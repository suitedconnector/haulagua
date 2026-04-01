/**
 * enrich-websites.ts
 *
 * Enriches TX hauler listings in Strapi by crawling their websites with Firecrawl.
 * Extracts: services offered, truck capacity (gallons), hose length (feet),
 * service area, and about/description text.
 *
 * Only fills missing fields — never overwrites existing data.
 *
 * Usage: npm run enrich:websites
 */

import * as path from "path";
import { config as loadDotenv } from "dotenv";

loadDotenv({ path: path.resolve(process.cwd(), ".env.local") });
loadDotenv({ path: path.resolve(process.cwd(), "..", ".env.local"), override: false });

const FIRECRAWL_KEY = process.env.FIRECRAWL_API_KEY;
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

if (!FIRECRAWL_KEY) {
  console.error("❌  FIRECRAWL_API_KEY is not set in .env.local");
  process.exit(1);
}
if (!STRAPI_TOKEN) {
  console.error("❌  STRAPI_API_TOKEN is not set");
  process.exit(1);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface StrapiHauler {
  id: number;
  attributes: {
    name: string;
    slug: string;
    website: string;
    description: string | null;
    serviceArea: string | null;
    truckCapacity: number | null;
    hoseLength: number | null;
  };
}

interface ExtractedData {
  description?: string | null;
  serviceArea?: string | null;
  truckCapacity?: number | null;
  hoseLength?: number | null;
  services?: string[] | null;
}

// ─── Strapi helpers ───────────────────────────────────────────────────────────

const strapiHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${STRAPI_TOKEN}`,
};

async function fetchTXHaulersWithWebsites(): Promise<StrapiHauler[]> {
  const all: StrapiHauler[] = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const p = new URLSearchParams({
      "filters[isActive][$eq]": "true",
      "filters[state][$eq]": "TX",
      "filters[website][$notNull]": "true",
      "fields[0]": "name",
      "fields[1]": "slug",
      "fields[2]": "website",
      "fields[3]": "description",
      "fields[4]": "serviceArea",
      "fields[5]": "truckCapacity",
      "fields[6]": "hoseLength",
      "pagination[page]": String(page),
      "pagination[pageSize]": String(pageSize),
    });

    const res = await fetch(`${STRAPI_URL}/api/haulers?${p}`, { headers: strapiHeaders });
    if (!res.ok) throw new Error(`Strapi fetch failed: HTTP ${res.status}`);
    const data = await res.json();

    const batch: StrapiHauler[] = (data.data ?? []).filter(
      (h: StrapiHauler) => !!h.attributes.website
    );
    all.push(...batch);

    const { page: cur, pageCount } = data.meta?.pagination ?? {};
    if (!cur || cur >= pageCount) break;
    page++;
  }

  return all;
}

async function updateHauler(
  id: number,
  patch: Record<string, string | number | null>
): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/haulers/${id}`, {
    method: "PUT",
    headers: strapiHeaders,
    body: JSON.stringify({ data: patch }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `HTTP ${res.status}`);
  }
}

// ─── Firecrawl ────────────────────────────────────────────────────────────────

async function crawlWebsite(url: string): Promise<ExtractedData | null> {
  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${FIRECRAWL_KEY}`,
    },
    body: JSON.stringify({
      url,
      formats: ["extract"],
      extract: {
        prompt: [
          "You are analyzing a water hauling business website.",
          "Extract the following information if present:",
          "- description: A 1-3 sentence summary of the business (what they do, who they serve).",
          "- serviceArea: The geographic area they serve (e.g. 'Houston metro area', 'Dallas-Fort Worth').",
          "- truckCapacity: The truck or tank capacity in gallons as a number (e.g. 4000). If a range, use the largest.",
          "- hoseLength: The hose length in feet as a number (e.g. 150).",
          "- services: A list of service types offered (e.g. ['pool filling', 'construction', 'potable water', 'agricultural']).",
          "Return null for any field not found. Do not guess.",
        ].join(" "),
        schema: {
          type: "object",
          properties: {
            description: { type: "string" },
            serviceArea: { type: "string" },
            truckCapacity: { type: "number" },
            hoseLength: { type: "number" },
            services: { type: "array", items: { type: "string" } },
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Firecrawl HTTP ${res.status}: ${body.slice(0, 120)}`);
  }

  const data = await res.json();

  if (!data.success) {
    throw new Error(`Firecrawl error: ${data.error ?? "unknown"}`);
  }

  return (data.extract as ExtractedData) ?? null;
}

// ─── Service type mapping ─────────────────────────────────────────────────────
// Map free-text service strings extracted from sites to Strapi enum values

const SERVICE_MAP: [RegExp, string][] = [
  [/pool|swim|hot tub|fountain/i, "pool"],
  [/construct|dust|compact|soil/i, "construction"],
  [/potable|drinking|cistern|well|tank\s*fill/i, "potable"],
  [/agri|livestock|farm|crop|irrig/i, "agricultural"],
  [/emerg|disaster|relief|drought/i, "emergency"],
  [/event|festival|sport/i, "events"],
];

function normaliseServices(raw: string[]): string[] {
  const out = new Set<string>();
  for (const s of raw) {
    for (const [re, val] of SERVICE_MAP) {
      if (re.test(s)) {
        out.add(val);
        break;
      }
    }
  }
  return [...out];
}

// ─── Rate limiter ─────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌐  Haulagua — Website Enricher (TX)\n");

  const haulers = await fetchTXHaulersWithWebsites();
  console.log(`Fetched ${haulers.length} active TX haulers with websites.\n`);

  let enriched = 0;
  let noData = 0;
  let skipped = 0;
  let failed = 0;

  for (const hauler of haulers) {
    const a = hauler.attributes;

    // If all enrichable scalar fields are already filled, skip
    const allPresent = a.description && a.serviceArea && a.truckCapacity && a.hoseLength;
    if (allPresent) {
      console.log(`  ⏭️  skip    ${a.name} (all fields present)`);
      skipped++;
      continue;
    }

    console.log(`  🔗  crawling  ${a.name}  →  ${a.website}`);
    await sleep(500);

    let extracted: ExtractedData | null;
    try {
      extracted = await crawlWebsite(a.website);
    } catch (err) {
      console.error(`  ❌  failed   ${a.name}: ${err}`);
      failed++;
      continue;
    }

    if (!extracted) {
      console.log(`  🈳  no data  ${a.name}`);
      noData++;
      continue;
    }

    // Build patch — only fill missing fields
    const patch: Record<string, string | number | null> = {};

    if (!a.description && extracted.description?.trim())
      patch.description = extracted.description.trim();
    if (!a.serviceArea && extracted.serviceArea?.trim())
      patch.serviceArea = extracted.serviceArea.trim();
    if (!a.truckCapacity && extracted.truckCapacity && extracted.truckCapacity > 0)
      patch.truckCapacity = Math.round(extracted.truckCapacity);
    if (!a.hoseLength && extracted.hoseLength && extracted.hoseLength > 0)
      patch.hoseLength = Math.round(extracted.hoseLength);

    if (Object.keys(patch).length === 0) {
      console.log(`  ⏭️  skip    ${a.name} (crawled but no new fields)`);
      skipped++;
      continue;
    }

    await sleep(100);

    try {
      await updateHauler(hauler.id, patch);
      const fields = Object.keys(patch).join(", ");
      console.log(`  ✅  enriched  ${a.name} → ${fields}`);
      enriched++;
    } catch (err) {
      console.error(`  ❌  update failed  ${a.name}: ${err}`);
      failed++;
    }
  }

  console.log("\n─────────────────────────────────────────");
  console.log(`✅  Enriched  : ${enriched}`);
  console.log(`🈳  No data   : ${noData}`);
  console.log(`⏭️  Skipped   : ${skipped}`);
  console.log(`❌  Failed    : ${failed}`);
  console.log("─────────────────────────────────────────\n");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
