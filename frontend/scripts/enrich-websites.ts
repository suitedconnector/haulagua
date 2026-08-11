/**
 * enrich-websites.ts
 *
 * Enriches hauler listings in data/haulers-flat.json by crawling each hauler's
 * own website with Firecrawl (markdown) and parsing the result with regex.
 *
 * Rewritten Aug 2026: previously read and wrote Strapi, which was decommissioned
 * in April. Now operates directly on the static JSON, works across all states,
 * and defaults to a dry run.
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
 * Skips social URLs (Facebook, Instagram, Yelp, LinkedIn, X) entirely.
 *
 * Usage — dry run by default; --write is required to modify anything:
 *   pnpm enrich:websites                              # preview, all states
 *   pnpm enrich:websites --state TX,AZ --limit 10     # cheap first pass
 *   pnpm enrich:websites --state TX,AZ --write        # apply
 *   pnpm enrich:websites --delay 3000                 # slower crawl
 *
 * A dry run writes data/enrichment-preview.json for review. A write run backs
 * up haulers-flat.json to .bak first.
 *
 * Requires FIRECRAWL_API_KEY in .env.local.
 */

import * as path from "path";
import * as fs from "fs";
import { config as loadDotenv } from "dotenv";

loadDotenv({ path: path.resolve(process.cwd(), ".env.local") });
loadDotenv({ path: path.resolve(process.cwd(), "..", ".env.local"), override: false });

const FIRECRAWL_KEY = process.env.FIRECRAWL_API_KEY;

if (!FIRECRAWL_KEY) {
  console.error("❌  FIRECRAWL_API_KEY is not set in .env.local");
  process.exit(1);
}

const CURRENT_YEAR = new Date().getFullYear();

// ─── CLI ──────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const hasFlag = (f: string) => argv.includes(f);
function flagValue(f: string): string | null {
  const i = argv.indexOf(f);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : null;
}

/** Default is dry-run. Writing requires an explicit --write. */
const DRY_RUN = !hasFlag("--write");
/** Comma-separated state filter, e.g. --state TX,AZ. Omit for all states. */
const STATES = (flagValue("--state") ?? "")
  .split(",")
  .map((s) => s.trim().toUpperCase())
  .filter(Boolean);
/** Cap the number of sites crawled — use for a cheap first pass. */
const LIMIT = Number(flagValue("--limit") ?? "0") || Infinity;
/** Milliseconds between crawls. These are small business sites; be polite. */
const DELAY_MS = Number(flagValue("--delay") ?? "1500");
/** Re-crawl haulers that already carry an `enrichment` stamp. */
const FORCE = hasFlag("--force");

// ─── Types ────────────────────────────────────────────────────────────────────

/** A record in data/haulers-flat.json. Extra keys are preserved on write. */
interface Hauler {
  name: string;
  slug: string;
  state: string;
  website?: string | null;
  description?: string | null;
  serviceArea?: string | null;
  isActive?: boolean;
  // Enrichment targets. truckCapacity is a STRING in haulers-flat.json even
  // though it holds a number — kept as-is to match the existing shape.
  truckCapacity?: string | null;
  certification?: string | null;
  hoseLength?: number | null;
  truckCount?: number | null;
  pumpType?: string | null;
  hoseMaterial?: string | null;
  yearsInBusiness?: number | null;
  serviceRadius?: number | null;
  /** Provenance: which fields came from a website crawl, and when. */
  enrichment?: { source: string; at: string; fields: string[] };
  [key: string]: unknown;
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

// ─── haulers-flat.json I/O ────────────────────────────────────────────────────

/**
 * Locate the app root by walking up from cwd. Mirrors check-slug-drift.ts so the
 * script runs from frontend/ or the repo root, under both tsx (CJS) and ESM.
 */
function findRoot(): string {
  let dir = path.resolve(process.cwd());
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(dir, "data", "haulers-flat.json"))) return dir;
    if (fs.existsSync(path.join(dir, "frontend", "data", "haulers-flat.json"))) {
      return path.join(dir, "frontend");
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  console.error(
    `enrich-websites: could not locate data/haulers-flat.json from ${process.cwd()}`
  );
  process.exit(1);
}

const ROOT = findRoot();
const DATA_PATH = path.join(ROOT, "data", "haulers-flat.json");

function loadHaulers(): Hauler[] {
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf8")) as Hauler[];
}

/**
 * Write the full array back, preserving key order and unknown fields.
 * A .bak is written alongside first — this file is the sole source of truth for
 * every page on the site, and a bad run should be one `mv` away from undone.
 */
function saveHaulers(haulers: Hauler[]): void {
  fs.copyFileSync(DATA_PATH, `${DATA_PATH}.bak`);
  fs.writeFileSync(DATA_PATH, JSON.stringify(haulers, null, 2) + "\n");
}

/** Write the proposed changes to a reviewable file instead of mutating data. */
function saveDiff(rows: DiffRow[]): string {
  const out = path.join(ROOT, "data", "enrichment-preview.json");
  fs.writeFileSync(out, JSON.stringify(rows, null, 2) + "\n");
  return out;
}

interface DiffRow {
  slug: string;
  name: string;
  state: string;
  website: string;
  patch: Record<string, string | number>;
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

/** Hosts we can't usefully crawl for business copy. */
const SKIP_HOSTS = ["facebook.com", "instagram.com", "yelp.com", "linkedin.com", "twitter.com", "x.com"];

const isBlank = (v: unknown) => v === null || v === undefined || String(v).trim() === "";

async function main() {
  const scope = STATES.length ? STATES.join(", ") : "all states";
  console.log(`🌐  Haulagua — Website Enricher  [${scope}]`);
  console.log(DRY_RUN ? "    DRY RUN — no files will be modified. Pass --write to apply.\n"
                      : "    WRITE MODE — data/haulers-flat.json will be updated.\n");

  const haulers = loadHaulers();

  const targets = haulers.filter((h) => {
    if (h.isActive === false) return false;
    if (isBlank(h.website)) return false;
    if (STATES.length && !STATES.includes(String(h.state).toUpperCase())) return false;
    return true;
  });

  console.log(`${haulers.length} haulers loaded — ${targets.length} active with a website in scope.\n`);

  let enriched = 0, noData = 0, skipped = 0, failed = 0, crawled = 0;
  const diff: DiffRow[] = [];

  for (const h of targets) {
    if (crawled >= LIMIT) {
      console.log(`\n  ⏹  limit of ${LIMIT} reached — stopping.`);
      break;
    }

    const website = String(h.website);

    if (SKIP_HOSTS.some((d) => website.includes(d))) {
      console.log(`  ⏭️  skip      ${h.name} (social URL)`);
      skipped++;
      continue;
    }

    // Skip anything already crawled. Without this the "all fields present"
    // check below is almost never true — most sites don't mention pump type or
    // hose material — so every run would re-crawl every site and re-bill it.
    if (h.enrichment && !FORCE) {
      console.log(`  ⏭️  skip      ${h.name} (enriched ${h.enrichment.at}; --force to redo)`);
      skipped++;
      continue;
    }

    const wanted = [
      "description", "serviceArea", "truckCapacity", "hoseLength", "certification",
      "truckCount", "pumpType", "hoseMaterial", "yearsInBusiness", "serviceRadius",
    ];
    if (wanted.every((f) => !isBlank(h[f]))) {
      console.log(`  ⏭️  skip      ${h.name} (all fields present)`);
      skipped++;
      continue;
    }

    console.log(`  🔗  crawling  ${h.name}  →  ${website}`);
    crawled++;
    await sleep(DELAY_MS);

    let markdown: string | null;
    try {
      markdown = await scrapeMarkdown(website);
    } catch (err) {
      console.error(`  ❌  failed    ${h.name}: ${err}`);
      failed++;
      continue;
    }

    if (!markdown || markdown.trim().length < 100) {
      console.log(`  🈳  no content ${h.name}`);
      noData++;
      continue;
    }

    const x = parseMarkdown(markdown);
    const patch: Record<string, string | number> = {};

    // Only ever fill blanks — existing data is never overwritten.
    // truckCapacity is stored as a string in haulers-flat.json.
    if (isBlank(h.description) && x.description)         patch.description     = x.description;
    if (isBlank(h.serviceArea) && x.serviceArea)         patch.serviceArea     = x.serviceArea;
    if (isBlank(h.truckCapacity) && x.truckCapacity)     patch.truckCapacity   = String(x.truckCapacity);
    if (isBlank(h.hoseLength) && x.hoseLength)           patch.hoseLength      = x.hoseLength;
    if (isBlank(h.certification) && x.certification)     patch.certification   = x.certification;
    if (isBlank(h.truckCount) && x.truckCount)           patch.truckCount      = x.truckCount;
    if (isBlank(h.pumpType) && x.pumpType)               patch.pumpType        = x.pumpType;
    if (isBlank(h.hoseMaterial) && x.hoseMaterial)       patch.hoseMaterial    = x.hoseMaterial;
    if (isBlank(h.yearsInBusiness) && x.yearsInBusiness) patch.yearsInBusiness = x.yearsInBusiness;
    if (isBlank(h.serviceRadius) && x.serviceRadius)     patch.serviceRadius   = x.serviceRadius;

    if (Object.keys(patch).length === 0) {
      console.log(`  🈳  no data    ${h.name} (crawled, nothing extracted)`);
      noData++;
      continue;
    }

    diff.push({
      slug: h.slug,
      name: h.name,
      state: h.state,
      website,
      patch,
    });

    if (!DRY_RUN) {
      Object.assign(h, patch);
      h.enrichment = {
        source: "website",
        at: new Date().toISOString().slice(0, 10),
        fields: Object.keys(patch),
      };
    }

    console.log(`  ✅  ${DRY_RUN ? "would fill" : "enriched "} ${h.name} → ${Object.keys(patch).join(", ")}`);
    enriched++;
  }

  if (diff.length) {
    const out = saveDiff(diff);
    console.log(`\n📝  Proposed changes written to ${path.relative(ROOT, out)}`);
  }

  if (!DRY_RUN && diff.length) {
    saveHaulers(haulers);
    console.log(`💾  data/haulers-flat.json updated (backup at haulers-flat.json.bak)`);
  }

  console.log("\n─────────────────────────────────────────");
  console.log(`${DRY_RUN ? "🔎  Would enrich" : "✅  Enriched   "} : ${enriched}`);
  console.log(`🈳  No data     : ${noData}`);
  console.log(`⏭️  Skipped     : ${skipped}`);
  console.log(`❌  Failed      : ${failed}`);
  console.log(`🔗  Crawled     : ${crawled}`);
  console.log("─────────────────────────────────────────");
  if (DRY_RUN) {
    console.log("Review the preview file, then re-run with --write to apply.\n");
  } else {
    console.log("Run `pnpm check:slugs` before committing.\n");
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
