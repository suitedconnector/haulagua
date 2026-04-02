/**
 * sync-to-production.ts
 *
 * Reads all active haulers from local Strapi (http://localhost:1337) and
 * syncs them to production Strapi (https://haulagua.onrender.com).
 *
 * Behaviour per hauler:
 *   - Slug not in prod  → POST (create)
 *   - Slug in prod      → PATCH only the fields that are non-null locally
 *                         but null/empty in production (never overwrites)
 *
 * Usage: npm run sync:prod
 *
 * Required env vars (read from .env.local):
 *   STRAPI_PROD_API_TOKEN     — API token generated in production Strapi admin
 *   STRAPI_API_TOKEN          — fallback if STRAPI_PROD_API_TOKEN not set
 *   NEXT_PUBLIC_STRAPI_URL    — local Strapi (defaults to http://localhost:1337)
 */

import * as path from "path";
import { config as loadDotenv } from "dotenv";

loadDotenv({ path: path.resolve(process.cwd(), ".env.local") });
loadDotenv({ path: path.resolve(process.cwd(), "..", ".env.local"), override: false });

const LOCAL_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const PROD_URL = "https://haulagua.onrender.com";

const PROD_TOKEN = process.env.STRAPI_PROD_API_TOKEN ?? process.env.STRAPI_API_TOKEN;

if (!PROD_TOKEN) {
  console.error("❌  STRAPI_PROD_API_TOKEN (or STRAPI_API_TOKEN) is not set in .env.local");
  process.exit(1);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface HaulerAttributes {
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  serviceArea: string | null;
  minFee: number | null;
  truckCapacity: number | null;
  hoseLength: number | null;
  waterType: "potable" | "non-potable" | "both" | null;
  isVerifiedPro: boolean;
  isActive: boolean;
  isClaimed: boolean;
  industries: unknown | null;
  certification: string | null;
  truckCount: number | null;
  pumpType: string | null;
  hoseMaterial: string | null;
  yearsInBusiness: number | null;
  serviceRadius: number | null;
}

interface StrapiHauler {
  id: number;
  attributes: HaulerAttributes;
}

// Fields that can be enriched — we only patch these when prod is empty
const ENRICHABLE_FIELDS: (keyof HaulerAttributes)[] = [
  "description", "phone", "email", "website", "address", "city", "state", "zip",
  "serviceArea", "minFee", "truckCapacity", "hoseLength", "waterType", "industries",
  "certification", "truckCount", "pumpType", "hoseMaterial", "yearsInBusiness", "serviceRadius",
];

const ALL_FIELDS: (keyof HaulerAttributes)[] = [
  "name", "slug", ...ENRICHABLE_FIELDS,
  "isVerifiedPro", "isActive", "isClaimed",
];

// ─── Local Strapi — fetch all active haulers ──────────────────────────────────

// Local Strapi is publicly readable — no auth needed
const localHeaders: Record<string, string> = { "Content-Type": "application/json" };

async function fetchLocalHaulers(): Promise<StrapiHauler[]> {
  const all: StrapiHauler[] = [];
  let page = 1;

  while (true) {
    const p = new URLSearchParams({
      "filters[isActive][$eq]": "true",
      "pagination[page]": String(page),
      "pagination[pageSize]": "100",
      "publicationState": "live",
    });
    ALL_FIELDS.forEach((f, i) => p.set(`fields[${i}]`, f));

    const res = await fetch(`${LOCAL_URL}/api/haulers?${p}`, { headers: localHeaders });
    if (!res.ok) throw new Error(`Local Strapi fetch failed: HTTP ${res.status}`);

    const data = await res.json();
    all.push(...(data.data ?? []));

    const { page: cur, pageCount } = data.meta?.pagination ?? {};
    if (!cur || cur >= pageCount) break;
    page++;
  }

  return all;
}

// ─── Production Strapi helpers ────────────────────────────────────────────────

const prodHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${PROD_TOKEN}`,
};

/** Returns the prod hauler record for this slug, or null if not found. */
async function fetchProdBySlug(slug: string): Promise<StrapiHauler | null> {
  const p = new URLSearchParams({ "filters[slug][$eq]": slug });
  ENRICHABLE_FIELDS.forEach((f, i) => p.set(`fields[${i}]`, f));

  const res = await fetch(`${PROD_URL}/api/haulers?${p}`, { headers: prodHeaders });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.data?.[0] as StrapiHauler) ?? null;
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  return false;
}

/** Builds a patch object: local fields that are non-empty where prod is empty. */
function buildPatch(
  local: HaulerAttributes,
  prod: HaulerAttributes
): Partial<HaulerAttributes> {
  const patch: Partial<HaulerAttributes> = {};
  for (const field of ENRICHABLE_FIELDS) {
    if (!isEmpty(local[field]) && isEmpty(prod[field])) {
      (patch as Record<string, unknown>)[field] = local[field];
    }
  }
  return patch;
}

async function patchProd(
  id: number,
  patch: Partial<HaulerAttributes>
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${PROD_URL}/api/haulers/${id}`, {
      method: "PUT",
      headers: prodHeaders,
      body: JSON.stringify({ data: patch }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err?.error?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

async function postToProd(
  attrs: HaulerAttributes
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${PROD_URL}/api/haulers`, {
      method: "POST",
      headers: prodHeaders,
      body: JSON.stringify({
        data: { ...attrs, publishedAt: new Date().toISOString() },
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err?.error?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀  Haulagua — Sync Local → Production\n");
  console.log(`   Local : ${LOCAL_URL}`);
  console.log(`   Prod  : ${PROD_URL}\n`);

  console.log("⏳  Fetching active haulers from local Strapi…");
  let haulers: StrapiHauler[];
  try {
    haulers = await fetchLocalHaulers();
  } catch (err) {
    console.error(`❌  Failed to fetch local haulers: ${err}`);
    process.exit(1);
  }
  console.log(`   Found ${haulers.length} active haulers locally.\n`);

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const hauler of haulers) {
    const local = hauler.attributes;

    const prodRecord = await fetchProdBySlug(local.slug);

    if (!prodRecord) {
      // Not in prod — create it
      const { ok, error } = await postToProd(local);
      if (ok) {
        console.log(`  ✅  created  "${local.name}" — ${local.city ?? "?"}, ${local.state ?? "?"}`);
        created++;
      } else {
        console.error(`  ❌  failed   "${local.name}": ${error}`);
        failed++;
      }
    } else {
      // Already in prod — patch missing fields
      const patch = buildPatch(local, prodRecord.attributes);
      const patchKeys = Object.keys(patch);

      if (patchKeys.length === 0) {
        console.log(`  ⏭️   skip     "${local.name}" (no new data to sync)`);
        skipped++;
        await sleep(50);
        continue;
      }

      const { ok, error } = await patchProd(prodRecord.id, patch);
      if (ok) {
        console.log(`  📝  updated  "${local.name}" — ${patchKeys.join(", ")}`);
        updated++;
      } else {
        console.error(`  ❌  failed   "${local.name}": ${error}`);
        failed++;
      }
    }

    await sleep(150);
  }

  console.log("\n─────────────────────────────────────────");
  console.log(`✅  Created : ${created}`);
  console.log(`📝  Updated : ${updated}`);
  console.log(`⏭️   Skipped : ${skipped} (no new data)`);
  console.log(`❌  Failed  : ${failed}`);
  console.log("─────────────────────────────────────────\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
