/**
 * enrich-websites.ts
 *
 * Enriches TX hauler listings in Strapi by crawling their websites with Firecrawl
 * (markdown format) and parsing the raw markdown with regex.
 *
 * Extracts:
 *   - truckCapacity   — "4,000 gallon", "4000 gal"
 *   - hoseLength      — "200 ft", "200 feet"
 *   - serviceArea     — sentences containing "serving", "service area", "we deliver to"
 *   - description     — first meaningful paragraph (≥ 50 chars)
 *   - certification   — TCEQ numbers, NSF, DOT, state cert mentions
 *   - truckCount      — "fleet of X trucks", "X truck fleet"
 *   - pumpType        — PTO, centrifugal, submersible, hydraulic pump mentions
 *   - hoseMaterial    — FDA/NSF hose material mentions
 *   - yearsInBusiness — "X years", "since YYYY", "founded YYYY", "established YYYY"
 *   - serviceRadius   — "within X miles", "up to X miles", "X-mile radius"
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

const CURRENT_YEAR = new Date().getFullYear();

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
    certification: string | null;
    truckCount: number | null;
    pumpType: string | null;
    hoseMaterial: string | null;
    yearsInBusiness: number | null;
    serviceRadius: number | null;
  };
}

interface ExtractedData {
  description: string | null;
  serviceArea: string | null;
  truckCapacity: number | null;
  hoseLength: number | null;
  certification: string | null;
  truckCount: number | null;
  pumpType: string | null;
  hoseMaterial: string | null;
  yearsInBusiness: number | null;
  serviceRadius: number | null;
}

// ─── Markdown parsers ─────────────────────────────────────────────────────────

function parseCapacity(md: string): number | null {
  const re = /\b(\d{1,2}[,.]?\d{3})\s*[-]?\s*gal(?:lon)?s?\b/gi;
  const hits: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    const n = parseInt(m[1].replace(/[,.]/g, ""), 10);
    if (n >= 500 && n <= 100_000) hits.push(n);
  }
  return hits.length ? Math.max(...hits) : null;
}

function parseHoseLength(md: string): number | null {
  const re = /\b(\d{2,4})\s*(?:[-]?\s*(?:ft|feet|foot)|')\b(?:[^a-z]|hose|pipe)/gi;
  const hits: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    const n = parseInt(m[1], 10);
    if (n >= 50 && n <= 2000) hits.push(n);
  }
  return hits.length ? Math.max(...hits) : null;
}

function parseServiceArea(md: string): string | null {
  const sentences = md
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*+/g, "")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length > 20 && s.length < 300);

  const RE = /\b(?:serv(?:ing|ice\s+area)|we\s+deliver\s+to|delivery\s+area|we\s+serve|proudly\s+serv|coverage\s+area|available\s+in|operating\s+in)\b/i;
  return sentences.find((s) => RE.test(s)) ?? null;
}

function parseDescription(md: string): string | null {
  const clean = md
    .replace(/#{1,6}\s+[^\n]+/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`~]+/g, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n");

  const paragraphs = clean
    .split(/\n\n+/)
    .map((p) => p.replace(/\n/g, " ").replace(/\s+/g, " ").trim())
    .filter((p) => p.length >= 50 && !/^(copyright|menu|nav|home|about|contact|©)/i.test(p));

  return paragraphs[0] ?? null;
}

function parseCertification(md: string): string | null {
  const certs: string[] = [];

  // TCEQ license number
  const tceqMatch = md.match(/TCEQ\s*(?:approved|certified|license[d]?|#|number|no\.?)?\s*[#:]?\s*(\d{4,10})/i);
  if (tceqMatch) certs.push(`TCEQ #${tceqMatch[1]}`);
  else if (/\bTCEQ\b/i.test(md)) certs.push("TCEQ Certified");

  // NSF / FDA approved
  if (/\bNSF[-\s]?61\b/i.test(md)) certs.push("NSF 61");
  else if (/\bNSF\b.*\bapproved\b|\bapproved\b.*\bNSF\b/i.test(md)) certs.push("NSF Approved");

  // DOT
  if (/\bDOT[-\s]?(?:certified|compliant|approved|registered|#\s*\d+)\b/i.test(md)) certs.push("DOT Certified");

  // State licensed / insured
  if (/\bfully\s+(?:licensed\s+(?:and\s+)?)?insured\b/i.test(md)) certs.push("Licensed & Insured");
  else if (/\bstate\s+(?:licensed|certified)\b/i.test(md)) certs.push("State Licensed");

  return certs.length ? certs.join(", ") : null;
}

function parseTruckCount(md: string): number | null {
  // "fleet of 5 trucks", "5-truck fleet", "3 water trucks", "2 tankers"
  const patterns = [
    /fleet\s+of\s+(\d+)\s+(?:water\s+)?trucks?/i,
    /(\d+)[-\s]truck\s+fleet/i,
    /(\d+)\s+(?:water\s+)?truck[s]?\s+(?:in\s+(?:our\s+)?fleet|available)/i,
    /(\d+)\s+tanker\s+truck/i,
  ];
  for (const re of patterns) {
    const m = md.match(re);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n >= 1 && n <= 500) return n;
    }
  }
  return null;
}

function parsePumpType(md: string): string | null {
  const types: string[] = [];
  if (/\bPTO\s+(?:water\s+)?pump/i.test(md)) types.push("PTO");
  if (/\bcentrifugal\s+pump/i.test(md)) types.push("Centrifugal");
  if (/\bsubmersible\s+pump/i.test(md)) types.push("Submersible");
  if (/\bhydraulic\s+pump/i.test(md)) types.push("Hydraulic");
  if (/\belectric\s+pump/i.test(md)) types.push("Electric");
  if (/\bgasoline[-\s]powered\s+pump/i.test(md)) types.push("Gasoline");
  return types.length ? types.join(", ") : null;
}

function parseHoseMaterial(md: string): string | null {
  const materials: string[] = [];
  if (/\bFDA[-\s](?:approved|grade)\s+hose/i.test(md) || /\bFDA\b.*\bhose\b/i.test(md))
    materials.push("FDA-approved");
  if (/\bNSF[-\s](?:61\s+)?(?:approved|certified)\s+hose/i.test(md) || /\bNSF\b.*\bhose\b/i.test(md))
    materials.push("NSF 61");
  if (/\bstainless\s+steel\s+(?:hose|fitting)/i.test(md)) materials.push("Stainless Steel");
  if (/\breinforced\s+(?:rubber|pvc)\s+hose/i.test(md)) materials.push("Reinforced Rubber");
  if (/\bpotable[-\s]grade\s+hose/i.test(md)) materials.push("Potable-grade");
  return materials.length ? materials.join(", ") : null;
}

function parseYearsInBusiness(md: string): number | null {
  // "over 20 years", "more than 15 years in business", "serving since 1998"
  const sinceMatch = md.match(/\bsince\s+(19\d{2}|20[0-2]\d)\b/i);
  if (sinceMatch) {
    const years = CURRENT_YEAR - parseInt(sinceMatch[1], 10);
    if (years >= 1 && years <= 150) return years;
  }

  const foundedMatch = md.match(/\b(?:founded|established|in\s+business\s+since)\s+(?:in\s+)?(19\d{2}|20[0-2]\d)\b/i);
  if (foundedMatch) {
    const years = CURRENT_YEAR - parseInt(foundedMatch[1], 10);
    if (years >= 1 && years <= 150) return years;
  }

  const yearsMatch = md.match(/\b(?:over|more\s+than|nearly|almost)?\s*(\d+)\+?\s+years?\s+(?:of\s+)?(?:in\s+business|experience|serving|of\s+service)/i);
  if (yearsMatch) {
    const n = parseInt(yearsMatch[1], 10);
    if (n >= 1 && n <= 150) return n;
  }

  return null;
}

function parseServiceRadius(md: string): number | null {
  // "within 50 miles", "up to 100 miles", "50-mile radius", "100 mile service area"
  const patterns = [
    /within\s+(\d+)\s*[-]?\s*miles?/i,
    /up\s+to\s+(\d+)\s*[-]?\s*miles?/i,
    /(\d+)\s*[-]?\s*mile\s+radius/i,
    /(\d+)\s*[-]?\s*mile\s+service\s+(?:area|range)/i,
    /service\s+(?:area|range)\s+of\s+(\d+)\s*[-]?\s*miles?/i,
  ];
  for (const re of patterns) {
    const m = md.match(re);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n >= 5 && n <= 1000) return n;
    }
  }
  return null;
}

function parseMarkdown(md: string): ExtractedData {
  return {
    truckCapacity: parseCapacity(md),
    hoseLength: parseHoseLength(md),
    serviceArea: parseServiceArea(md),
    description: parseDescription(md),
    certification: parseCertification(md),
    truckCount: parseTruckCount(md),
    pumpType: parsePumpType(md),
    hoseMaterial: parseHoseMaterial(md),
    yearsInBusiness: parseYearsInBusiness(md),
    serviceRadius: parseServiceRadius(md),
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
      "fields[7]": "certification",
      "fields[8]": "truckCount",
      "fields[9]": "pumpType",
      "fields[10]": "hoseMaterial",
      "fields[11]": "yearsInBusiness",
      "fields[12]": "serviceRadius",
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

    if (a.website.includes("facebook.com")) {
      console.log(`  ⏭️  skip    ${a.name} (Facebook URL)`);
      skipped++;
      continue;
    }

    const allPresent =
      a.description && a.serviceArea && a.truckCapacity && a.hoseLength &&
      a.certification && a.truckCount && a.pumpType && a.hoseMaterial &&
      a.yearsInBusiness && a.serviceRadius;

    if (allPresent) {
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

    const patch: Record<string, string | number | null> = {};
    if (!a.description && extracted.description)         patch.description     = extracted.description;
    if (!a.serviceArea && extracted.serviceArea)         patch.serviceArea     = extracted.serviceArea;
    if (!a.truckCapacity && extracted.truckCapacity)     patch.truckCapacity   = extracted.truckCapacity;
    if (!a.hoseLength && extracted.hoseLength)           patch.hoseLength      = extracted.hoseLength;
    if (!a.certification && extracted.certification)     patch.certification   = extracted.certification;
    if (!a.truckCount && extracted.truckCount)           patch.truckCount      = extracted.truckCount;
    if (!a.pumpType && extracted.pumpType)               patch.pumpType        = extracted.pumpType;
    if (!a.hoseMaterial && extracted.hoseMaterial)       patch.hoseMaterial    = extracted.hoseMaterial;
    if (!a.yearsInBusiness && extracted.yearsInBusiness) patch.yearsInBusiness = extracted.yearsInBusiness;
    if (!a.serviceRadius && extracted.serviceRadius)     patch.serviceRadius   = extracted.serviceRadius;

    if (Object.keys(patch).length === 0) {
      console.log(`  🈳  no data   ${a.name} (crawled, nothing extracted)`);
      noData++;
      continue;
    }

    await sleep(100);

    try {
      await updateHauler(hauler.id, patch);
      const summary = Object.keys(patch).join(", ");
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
