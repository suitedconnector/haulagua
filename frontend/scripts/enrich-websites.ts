/**
 * enrich-websites.ts
 *
 * Enriches TX hauler listings in Strapi by crawling their websites with Firecrawl
 * (markdown format) and parsing the raw markdown with regex.
 *
 * Extracts:
 *   - truckCapacity  — patterns like "4,000 gallon", "4000 gal"
 *   - hoseLength     — patterns like "200 ft", "200 feet"
 *   - serviceArea    — sentences containing "serving", "service area", "we deliver to" etc.
 *   - description    — first meaningful paragraph (≥ 50 chars)
 *
 * Only fills missing fields — never overwrites existing data.
 * Skips Facebook URLs entirely.
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
  description: string | null;
  serviceArea: string | null;
  truckCapacity: number | null;
  hoseLength: number | null;
}

// ─── Markdown parsers ─────────────────────────────────────────────────────────

function parseCapacity(md: string): number | null {
  // Matches: "4,000 gallon", "4000 gal", "4,000-gallon", "4000-gal"
  const re = /\b(\d{1,2}[,.]?\d{3})\s*[-]?\s*gal(?:lon)?s?\b/gi;
  const hits: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    const n = parseInt(m[1].replace(/[,.]/g, ""), 10);
    if (n >= 500 && n <= 100_000) hits.push(n);
  }
  if (hits.length === 0) return null;
  // Return the largest value (most likely to be truck capacity, not a delivery size)
  return Math.max(...hits);
}

function parseHoseLength(md: string): number | null {
  // Matches: "200 ft", "200 feet", "200-ft hose", "200' hose"
  const re = /\b(\d{2,4})\s*(?:[-]?\s*(?:ft|feet|foot)|')\b(?:[^a-z]|hose|pipe)/gi;
  const hits: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    const n = parseInt(m[1], 10);
    if (n >= 50 && n <= 2000) hits.push(n);
  }
  if (hits.length === 0) return null;
  return Math.max(...hits);
}

function parseServiceArea(md: string): string | null {
  // Split into sentences and find ones mentioning service area keywords
  const sentences = md
    .replace(/#{1,6}\s+/g, "") // strip markdown headings
    .replace(/\*+/g, "")       // strip bold/italic markers
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length > 20 && s.length < 300);

  const SERVICE_AREA_RE =
    /\b(?:serv(?:ing|ice\s+area)|we\s+deliver\s+to|delivery\s+area|we\s+serve|proudly\s+serv|coverage\s+area|available\s+in|operating\s+in)\b/i;

  const match = sentences.find((s) => SERVICE_AREA_RE.test(s));
  return match ?? null;
}

function parseDescription(md: string): string | null {
  // Strip markdown syntax and find first meaningful paragraph
  const clean = md
    .replace(/#{1,6}\s+[^\n]+/g, "")     // headings
    .replace(/!\[.*?\]\(.*?\)/g, "")      // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links → text
    .replace(/[*_`~]+/g, "")             // bold/italic/code
    .replace(/^[-*+]\s+/gm, "")          // list bullets
    .replace(/^\d+\.\s+/gm, "")          // numbered lists
    .replace(/\n{3,}/g, "\n\n");

  const paragraphs = clean
    .split(/\n\n+/)
    .map((p) => p.replace(/\n/g, " ").replace(/\s+/g, " ").trim())
    .filter((p) => p.length >= 50 && !/^(copyright|menu|nav|home|about|contact|©)/i.test(p));

  return paragraphs[0] ?? null;
}

function parseMarkdown(md: string): ExtractedData {
  return {
    truckCapacity: parseCapacity(md),
    hoseLength: parseHoseLength(md),
    serviceArea: parseServiceArea(md),
    description: parseDescription(md),
  };
}

// ─── Strapi helpers ───────────────────────────────────────────────────────────

const strapiHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${STRAPI_TOKEN}`,
};

async function fetchTXHaulersWithWebsites(): Promise<StrapiHauler[]> {
  const all: StrapiHauler[] = [];
  let page = 1;

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
      "pagination[pageSize]": "100",
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

// ─── Firecrawl (markdown) ─────────────────────────────────────────────────────

async function scrapeMarkdown(url: string): Promise<string | null> {
  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${FIRECRAWL_KEY}`,
    },
    body: JSON.stringify({ url, formats: ["markdown"] }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Firecrawl HTTP ${res.status}: ${body.slice(0, 120)}`);
  }

  const data = await res.json();
  if (!data.success) throw new Error(`Firecrawl: ${data.error ?? "unknown error"}`);
  return (data.data?.markdown as string) ?? null;
}

// ─── Rate limiter ─────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌐  Haulagua — Website Enricher (TX, markdown mode)\n");

  const haulers = await fetchTXHaulersWithWebsites();
  console.log(`Fetched ${haulers.length} active TX haulers with websites.\n`);

  let enriched = 0;
  let noData = 0;
  let skipped = 0;
  let failed = 0;

  for (const hauler of haulers) {
    const a = hauler.attributes;

    // Skip Facebook — Firecrawl blocks it
    if (a.website.includes("facebook.com")) {
      console.log(`  ⏭️  skip    ${a.name} (Facebook URL)`);
      skipped++;
      continue;
    }

    // If all enrichable fields already present, nothing to do
    if (a.description && a.serviceArea && a.truckCapacity && a.hoseLength) {
      console.log(`  ⏭️  skip    ${a.name} (all fields present)`);
      skipped++;
      continue;
    }

    console.log(`  🔗  crawling  ${a.name}  →  ${a.website}`);
    await sleep(500);

    let markdown: string | null;
    try {
      markdown = await scrapeMarkdown(a.website);
    } catch (err) {
      console.error(`  ❌  failed   ${a.name}: ${err}`);
      failed++;
      continue;
    }

    if (!markdown || markdown.trim().length < 100) {
      console.log(`  🈳  no content  ${a.name}`);
      noData++;
      continue;
    }

    const extracted = parseMarkdown(markdown);

    // Build patch — only fill missing fields
    const patch: Record<string, string | number | null> = {};
    if (!a.description && extracted.description)
      patch.description = extracted.description;
    if (!a.serviceArea && extracted.serviceArea)
      patch.serviceArea = extracted.serviceArea;
    if (!a.truckCapacity && extracted.truckCapacity)
      patch.truckCapacity = extracted.truckCapacity;
    if (!a.hoseLength && extracted.hoseLength)
      patch.hoseLength = extracted.hoseLength;

    if (Object.keys(patch).length === 0) {
      console.log(`  🈳  no data   ${a.name} (crawled, nothing extracted)`);
      noData++;
      continue;
    }

    await sleep(100);

    try {
      await updateHauler(hauler.id, patch);
      const summary = Object.entries(patch)
        .map(([k, v]) => `${k}=${typeof v === "string" ? v.slice(0, 30) + (v.length > 30 ? "…" : "") : v}`)
        .join(", ");
      console.log(`  ✅  enriched  ${a.name} → ${summary}`);
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
