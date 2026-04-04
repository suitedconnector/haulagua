/**
 * clean-descriptions.ts
 *
 * Comprehensive data quality cleanup for all active haulers in Strapi.
 * Checks description and serviceArea fields and nulls any that contain
 * junk content: HTML/markdown table syntax, scraped footer text,
 * template placeholders, error pages, or content too short to be useful.
 *
 * Usage: npm run clean:descriptions
 */

import * as path from "path";
import { config as loadDotenv } from "dotenv";

loadDotenv({ path: path.resolve(process.cwd(), ".env.local") });
loadDotenv({ path: path.resolve(process.cwd(), "..", ".env.local"), override: false });

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

if (!STRAPI_TOKEN) {
  console.error("❌  STRAPI_API_TOKEN is not set");
  process.exit(1);
}

// ─── Junk detection ───────────────────────────────────────────────────────────

// Strings that disqualify a field (case-insensitive)
const SUBSTRING_FLAGS: string[] = [
  // HTML/markdown table artifacts
  "| --- |",
  // Scraped directory / footer content
  "bulkwaterdelivery.com",
  "updated:",
  "this directory",
  "ads.htm",
  "advertise",
  "copyright",
  "click here",
  // Template / placeholder text
  "your company",
  "your business",
  "your text",
  "insert your",
  "walking billboard",
  "launch endless promotion",
  "hands of others",
  "coming soon",
  "under construction",
  "lorem ipsum",
  // Non-hauler business types
  "beverage",
  // Error pages
  "account has expired",
  "media error",
  "something went wrong",
  "page not found",
  "domain parked",
  "placeholder",
];

// Regex patterns that disqualify a field
const PATTERN_FLAGS: RegExp[] = [
  // HTTP error codes standing alone
  /\b40[34]\b/,
  // Repeated special characters (3+ of the same symbol in a row, not alphanumeric)
  /[^a-z0-9\s]{3,}/i,
];

function pipeRatio(s: string): number {
  if (s.length === 0) return 0;
  const pipeAndDash = (s.match(/[|\\-]/g) ?? []).length;
  return pipeAndDash / s.length;
}

function hasTableSyntax(s: string): boolean {
  // More than 2 occurrences of "| |" or pipe ratio > 30%
  const multiPipe = (s.match(/\|\s*\|/g) ?? []).length;
  return multiPipe > 2 || pipeRatio(s) > 0.30;
}

function isJunk(value: string): { junk: boolean; reason: string } {
  // 1. Pure whitespace / line breaks only
  if (!value.trim()) return { junk: true, reason: "whitespace only" };

  // 2. Too short
  if (value.trim().length < 20) return { junk: true, reason: "too short (<20 chars)" };

  // 3. HTML/markdown table syntax
  if (hasTableSyntax(value)) return { junk: true, reason: "table syntax / high pipe ratio" };

  // 4. Substring flags (case-insensitive)
  const lower = value.toLowerCase();
  for (const flag of SUBSTRING_FLAGS) {
    if (lower.includes(flag)) return { junk: true, reason: `contains "${flag}"` };
  }

  // 5. Regex pattern flags
  for (const re of PATTERN_FLAGS) {
    if (re.test(value)) return { junk: true, reason: `matches pattern ${re}` };
  }

  return { junk: false, reason: "" };
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface StrapiHauler {
  id: number;
  attributes: {
    name: string;
    state: string;
    description: string | null;
    serviceArea: string | null;
  };
}

// ─── Strapi helpers ───────────────────────────────────────────────────────────

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${STRAPI_TOKEN}`,
};

async function fetchAllActiveHaulers(): Promise<StrapiHauler[]> {
  const all: StrapiHauler[] = [];
  let page = 1;

  while (true) {
    const p = new URLSearchParams({
      "filters[isActive][$eq]": "true",
      "fields[0]": "name",
      "fields[1]": "state",
      "fields[2]": "description",
      "fields[3]": "serviceArea",
      "pagination[page]": String(page),
      "pagination[pageSize]": "100",
    });

    const res = await fetch(`${STRAPI_URL}/api/haulers?${p}`, { headers });
    if (!res.ok) throw new Error(`Strapi fetch failed: HTTP ${res.status}`);
    const data = await res.json();

    all.push(...(data.data ?? []));

    const { page: cur, pageCount } = data.meta?.pagination ?? {};
    if (!cur || cur >= pageCount) break;
    page++;
  }

  return all;
}

async function patchHauler(
  id: number,
  patch: { description?: null; serviceArea?: null }
): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/haulers/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: patch }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `HTTP ${res.status}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🧹  Haulagua — Comprehensive Data Quality Cleaner\n");

  const haulers = await fetchAllActiveHaulers();
  console.log(`Fetched ${haulers.length} active haulers.\n`);

  let descriptionsCleaned = 0;
  let serviceAreasCleaned = 0;
  let haulersTouched = 0;
  let failed = 0;

  for (const hauler of haulers) {
    const { name, state, description, serviceArea } = hauler.attributes;
    const patch: { description?: null; serviceArea?: null } = {};
    const reasons: string[] = [];

    if (description) {
      const { junk, reason } = isJunk(description);
      if (junk) {
        patch.description = null;
        reasons.push(`description: ${reason}`);
      }
    }

    if (serviceArea) {
      const { junk, reason } = isJunk(serviceArea);
      if (junk) {
        patch.serviceArea = null;
        reasons.push(`serviceArea: ${reason}`);
      }
    }

    if (Object.keys(patch).length === 0) continue;

    try {
      await patchHauler(hauler.id, patch);

      if (patch.description === null) {
        const snippet = description!.slice(0, 70).replace(/\n/g, " ");
        console.log(`  🗑️  [${state}] "${name}"`);
        console.log(`       description (${reasons.find(r => r.startsWith("desc"))?.split(": ")[1]}): "${snippet}${description!.length > 70 ? "…" : ""}"`);
        descriptionsCleaned++;
      }
      if (patch.serviceArea === null) {
        const snippet = serviceArea!.slice(0, 70).replace(/\n/g, " ");
        console.log(`  🗑️  [${state}] "${name}"`);
        console.log(`       serviceArea (${reasons.find(r => r.startsWith("service"))?.split(": ")[1]}): "${snippet}${serviceArea!.length > 70 ? "…" : ""}"`);
        serviceAreasCleaned++;
      }

      haulersTouched++;
    } catch (err) {
      console.error(`  ❌  failed "${name}": ${err}`);
      failed++;
    }
  }

  console.log("\n─────────────────────────────────────────");
  console.log(`🗑️  Descriptions cleaned : ${descriptionsCleaned}`);
  console.log(`🗑️  Service areas cleaned: ${serviceAreasCleaned}`);
  console.log(`📋  Haulers touched      : ${haulersTouched}`);
  console.log(`✅  Haulers already clean: ${haulers.length - haulersTouched - failed}`);
  console.log(`❌  Failed               : ${failed}`);
  console.log("─────────────────────────────────────────\n");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
