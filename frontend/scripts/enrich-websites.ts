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
/**
 * Milliseconds between crawls. Default 7000 ≈ 8.5 req/min, which stays under
 * Firecrawl's ~10/min cap on the lower tiers. Also polite to the small business
 * sites being crawled. Lower it if you're on a higher plan.
 */
const DELAY_MS = Number(flagValue("--delay") ?? "7000");
/** Re-crawl haulers that already carry an `enrichment` stamp. */
const FORCE = hasFlag("--force");
/**
 * "fields"  — scrape each homepage and regex out description/capacity/etc.
 * "areas"   — map each site's URL list and derive serviceArea from
 *             /areas-we-serve/<city>-<state>/ style paths. One call per site,
 *             no page fetches, and the city comes from how the hauler chose to
 *             organise their own site rather than from parsing marketing copy.
 */
const MODE = (flagValue("--mode") ?? "fields").toLowerCase();
/** Target a single hauler by slug — useful for testing one known case. */
const ONLY = flagValue("--only");

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
  /**
   * Service categories found on the hauler's own website, comma-joined.
   * Deliberately NOT named `services` — that key is what the old ?service=
   * filter expected as an array of objects, and reusing it would silently
   * half-revive dead code. Treat this as website-derived, not verified.
   */
  servicesDetected?: string | null;
  /** Provenance: which fields came from a website crawl, and when. */
  enrichment?: { source: string; at: string; fields: string[] };
  /** Last date --mode areas mapped this site, so empty results aren't re-billed. */
  areasCheckedAt?: string;
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
  /** Service categories detected on the hauler's own site. May be empty. */
  services: string[];
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

/**
 * Extract a comma-separated list of place names, not a marketing sentence.
 *
 * The previous version returned whole sentences, which produced values like
 * "TCEQ#0270151 ✓ Friendly, reliable service Serving our neighbors across the
 * Texas Hill Country for years." — a license number, a glyph and a slogan in a
 * field that should hold locations.
 */
function parseServiceArea(md: string): string | null {
  const text = md
    .replace(/#{1,6}\s+/g, "")
    .replace(/[*_`~]+/g, "")
    .replace(/[✓✔✅★•]/g, " ")
    .replace(/\s+/g, " ");

  const TRIGGER =
    /\b(?:serving|service\s+area|we\s+deliver\s+to|delivery\s+area|we\s+serve|proudly\s+serving|coverage\s+area|available\s+in|operating\s+in|deliver(?:ing)?\s+(?:bulk\s+water\s+)?to)\b[:\s]*/i;

  const m = TRIGGER.exec(text);
  if (!m) return null;

  // Take what follows the trigger, up to the end of the clause.
  const tail = text.slice(m.index + m[0].length).split(/[.!?|]/)[0] ?? "";

  // Split on commas / "and" / "&" and keep only fragments that look like place
  // names: title-case words, optionally with a state abbreviation.
  const PLACE = /^[A-Z][A-Za-z.'-]*(?:\s+[A-Z][A-Za-z.'-]*){0,3}(?:,\s*[A-Z]{2})?$/;
  const STOP = /^(?:and|the|surrounding|areas?|more|beyond|all|our|neighbors|customers|counties|county|communities)$/i;

  const parts = tail
    .split(/\s*(?:,|&|\band\b)\s*/i)
    .map((p) => p.trim().replace(/\s+/g, " "))
    .filter((p) => p.length >= 3 && p.length <= 40)
    .filter((p) => !STOP.test(p))
    .filter((p) => PLACE.test(p));

  if (parts.length < 2) return null;

  // De-duplicate, preserve order, cap the length.
  const seen = new Set<string>();
  const places = parts.filter((p) => {
    const k = p.toLowerCase();
    return seen.has(k) ? false : (seen.add(k), true);
  });

  return places.slice(0, 12).join(", ");
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

  // Chrome, consent banners and widget text that must never become public copy.
  // A run that proposed "Your feedback will be used to help improve Google
  // Translate" as a hauler's description is what prompted this list.
  const JUNK =
    /(google\s+translate|translate\s+this|your\s+feedback|cookie|consent|gdpr|privacy\s+policy|terms\s+of\s+(?:use|service)|enable\s+javascript|javascript\s+(?:is|must)|browser\s+(?:does\s+not|isn'?t)|update\s+your\s+browser|all\s+rights\s+reserved|skip\s+to\s+(?:main|content)|powered\s+by|©|\bwix\b|\bsquarespace\b|godaddy|website\s+(?:by|design(?:ed)?\s+by)|sign\s+up|log\s*in|subscribe|newsletter|follow\s+us|share\s+this|leave\s+a\s+review|click\s+here|read\s+more|learn\s+more\s*$|loading|404|not\s+found)/i;

  const NAVISH = /^(copyright|menu|nav|home|about|contact|©)/i;

  const paragraphs = clean
    .split(/\n\n+/)
    .map((p) => p.replace(/\n/g, " ").replace(/\s+/g, " ").trim())
    .filter((p) => p.length >= 50 && p.length <= 600)
    .filter((p) => !NAVISH.test(p))
    .filter((p) => !JUNK.test(p))
    // Must read like prose: at least 8 words and one sentence-ish structure,
    // and not a pile of nav links masquerading as a paragraph.
    .filter((p) => p.split(/\s+/).length >= 8)
    .filter((p) => (p.match(/\|/g)?.length ?? 0) < 2)
    // Reject ALL-CAPS shouting and fragments with no lowercase at all.
    .filter((p) => /[a-z]/.test(p) && p.replace(/[^A-Z]/g, "").length < p.length * 0.4)
    // Reject badge/feature strips — "TCEQ#0270151 ✓ Friendly, reliable service
    // Serving our neighbors..." is three fragments glued together, not prose.
    .filter((p) => !/[✓✔✅★☆•▪●]/.test(p))
    .filter((p) => !/^\s*(?:TCEQ|NSF|DOT|EPA|TX)\s*#?\s*\d/i.test(p))
    // Must contain a sentence. Nav strips like "Pay a Bill Online Account Start
    // Service Alerts & Outages AWC News" have no terminal punctuation.
    .filter((p) => /[.!?]/.test(p))
    // Reject Title Case Runs — menus capitalise most words, prose doesn't.
    // Measured on words after the first, which is capitalised either way.
    .filter((p) => {
      const words = p.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).slice(1);
      if (words.length < 4) return false;
      const capped = words.filter((w) => /^[A-Z]/.test(w)).length;
      return capped / words.length < 0.5;
    });

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

/**
 * Detect service offerings a hauler advertises on their own site.
 *
 * Two purposes. First, `trailerRental` answers whether the rental intent we see
 * in search ("water trailer rental", "water truck rental glendale az") can be
 * served by haulers already in the directory — Agua Trucks offers it — rather
 * than requiring a new supplier category.
 *
 * Second, the rest populate the service classification that has never existed:
 * the `?service=` filter read `h.services[]` and `h.industries[]`, neither of
 * which is present on any record, so every filtered URL returned zero haulers.
 *
 * Requires two distinct signals per category to reduce false positives from
 * navigation menus and boilerplate.
 */
const SERVICE_SIGNALS: Record<string, RegExp[]> = {
  trailerRental: [
    /water\s+trailer/i,
    /\btrailer\s+rental|rent(?:al)?\s+(?:a\s+)?(?:water\s+)?trailer/i,
    /\btow(?:able)?\s+water\s+tank/i,
  ],
  pool: [/\bpool\s+(?:fill|filling|water)/i, /\bswimming\s+pool/i, /\bhot\s+tub|\bspa\b/i],
  potable: [/\bpotable\s+water/i, /\bdrinking\s+water/i, /\bcistern/i, /\bNSF[-\s]?61\b/i],
  construction: [/\bdust\s+control/i, /\bsoil\s+compaction/i, /\bconstruction\s+(?:site|water)/i, /\bjob\s?site/i],
  agricultural: [/\blivestock/i, /\bstock\s+tank/i, /\birrigation/i, /\branch|\bcattle/i, /\bagricultur/i, /\bfarm\b|\bcrop|\borchard/i],
  emergency: [/\bemergency\s+(?:water|delivery|response)/i, /\bdisaster\s+relief/i, /\b24\/7\b/i, /\bwell\s+(?:ran|run|went)\s+dry/i],
  events: [/\bevent\s+water/i, /\bfestival/i, /\bfilm\s+(?:set|production)/i, /\bwedding/i],
  oilGas: [/\bfrac(?:king|\s+tank)/i, /\bdrilling\s+(?:rig|site)/i, /\boil\s*(?:field|&|and)\s*gas/i, /\bpermian/i],
};

function parseServices(md: string): string[] {
  const found: string[] = [];
  for (const [name, patterns] of Object.entries(SERVICE_SIGNALS)) {
    const hits = patterns.filter((re) => re.test(md)).length;
    if (hits >= 2) found.push(name);
  }
  return found;
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
    services: parseServices(md),
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
  /** Things a human should look at. Never applied automatically. */
  flags?: string[];
}

/**
 * Detect a stored licence number that looks truncated against the one on the
 * hauler's own site — e.g. stored "TCEQ #027015" vs site "TCEQ#0270151".
 * Reported only; never written, because the stored value may be the correct one.
 */
function licenceMismatch(stored: unknown, scraped: string | null): string | null {
  if (isBlank(stored) || !scraped) return null;
  const a = String(stored).replace(/\D/g, "");
  const b = scraped.replace(/\D/g, "");
  if (!a || !b || a === b) return null;
  if (b.startsWith(a) && b.length > a.length) {
    return `certification may be truncated — stored "${stored}", site shows "${scraped}"`;
  }
  if (a.startsWith(b) && a.length > b.length) return null; // stored is richer
  return `certification differs — stored "${stored}", site shows "${scraped}"`;
}

// ─── Firecrawl (markdown) ─────────────────────────────────────────────────────

/**
 * Scrape one URL as markdown, retrying on rate limits and transient 5xx.
 *
 * Firecrawl's lower tiers cap requests per minute. Rather than relying on the
 * caller guessing --delay correctly, a 429 backs off and retries: honouring
 * Retry-After when present, otherwise 20s, 40s, 60s. Rows are only lost after
 * MAX_RETRIES consecutive failures.
 */
const MAX_RETRIES = 3;

async function scrapeMarkdown(url: string, attempt = 1): Promise<string | null> {
  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${FIRECRAWL_KEY}`,
    },
    body: JSON.stringify({ url, formats: ["markdown"] }),
  });

  if (res.status === 429 || res.status >= 500) {
    if (attempt > MAX_RETRIES) {
      const body = await res.text().catch(() => "");
      throw new Error(`Firecrawl HTTP ${res.status} after ${MAX_RETRIES} retries: ${body.slice(0, 100)}`);
    }
    const retryAfter = Number(res.headers.get("retry-after"));
    const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1000
      : attempt * 20_000;
    console.log(`      ⏳ HTTP ${res.status} — waiting ${Math.round(waitMs / 1000)}s (retry ${attempt}/${MAX_RETRIES})`);
    await sleep(waitMs);
    return scrapeMarkdown(url, attempt + 1);
  }

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

// ─── Service-area discovery (--mode areas) ────────────────────────────────────

/**
 * List every URL Firecrawl can find on a site. One call, no page fetches.
 * Shares the 429/5xx backoff behaviour of scrapeMarkdown.
 */
async function mapSite(url: string, attempt = 1): Promise<string[]> {
  const res = await fetch("https://api.firecrawl.dev/v1/map", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${FIRECRAWL_KEY}`,
    },
    body: JSON.stringify({ url, includeSubdomains: false }),
  });

  if (res.status === 429 || res.status >= 500) {
    if (attempt > MAX_RETRIES) {
      throw new Error(`Firecrawl map HTTP ${res.status} after ${MAX_RETRIES} retries`);
    }
    const retryAfter = Number(res.headers.get("retry-after"));
    const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : attempt * 20_000;
    console.log(`      ⏳ HTTP ${res.status} — waiting ${Math.round(waitMs / 1000)}s (retry ${attempt}/${MAX_RETRIES})`);
    await sleep(waitMs);
    return mapSite(url, attempt + 1);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Firecrawl map HTTP ${res.status}: ${body.slice(0, 120)}`);
  }

  const data = await res.json();
  if (!data.success && !data.links) throw new Error(`Firecrawl map: ${data.error ?? "unknown error"}`);
  return (data.links ?? data.data ?? []) as string[];
}

/** URL path segments that indicate a service-area / location page. */
const AREA_PATH =
  /\/(?:areas?[-_]we[-_]serve|service[-_]areas?|areas?[-_]served|we[-_]serve|locations?|cities|coverage|delivery[-_]areas?)\//i;

const US_STATES: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA",
  hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA",
  kansas: "KS", kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
  massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS",
  missouri: "MO", montana: "MT", nebraska: "NE", nevada: "NV",
  "new-hampshire": "NH", "new-jersey": "NJ", "new-mexico": "NM", "new-york": "NY",
  "north-carolina": "NC", "north-dakota": "ND", ohio: "OH", oklahoma: "OK",
  oregon: "OR", pennsylvania: "PA", "rhode-island": "RI", "south-carolina": "SC",
  "south-dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT",
  virginia: "VA", washington: "WA", "west-virginia": "WV", wisconsin: "WI",
  wyoming: "WY",
};

/** Slug fragments that are page furniture, not city names. */
const NOT_A_CITY = new Set([
  "index", "all", "more", "other", "areas", "area", "locations", "location",
  "service", "services", "coverage", "home", "page", "list", "map", "near-me",
  "we-serve", "served", "delivery", "water", "bulk-water", "contact", "about",
]);

/**
 * Title-case a city slug. Deliberately does NOT uppercase short words — city
 * names like El Mirage, La Grange and St George have two-letter particles that
 * are not abbreviations.
 */
const titleCase = (s: string) =>
  s.split("-").filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");

/**
 * Turn a list of site URLs into "City, ST" strings.
 * Handles /areas-we-serve/glendale-arizona/ and /service-area/glendale-az/.
 * Returns null rather than guessing when a slug doesn't parse cleanly.
 */
function citiesFromUrls(urls: string[], fallbackState: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  for (const raw of urls) {
    let pathname: string;
    try {
      pathname = new URL(raw).pathname;
    } catch {
      continue;
    }
    if (!AREA_PATH.test(pathname)) continue;

    const last = pathname.replace(/\/+$/, "").split("/").pop() ?? "";
    const slug = last.replace(/\.(html?|php|aspx)$/i, "").toLowerCase();
    if (!slug || NOT_A_CITY.has(slug)) continue;
    if (AREA_PATH.test(`/${slug}/`)) continue; // the index page itself

    const parts = slug.split("-");
    let state = fallbackState.toUpperCase();
    let cityParts = parts;

    // Trailing full state name: glendale-arizona
    const tail2 = parts.slice(-2).join("-");
    if (US_STATES[tail2]) {
      state = US_STATES[tail2];
      cityParts = parts.slice(0, -2);
    } else if (US_STATES[parts[parts.length - 1]]) {
      state = US_STATES[parts[parts.length - 1]];
      cityParts = parts.slice(0, -1);
    } else if (/^[a-z]{2}$/.test(parts[parts.length - 1] ?? "")) {
      // Trailing abbreviation: glendale-az
      const abbr = parts[parts.length - 1].toUpperCase();
      if (Object.values(US_STATES).includes(abbr)) {
        state = abbr;
        cityParts = parts.slice(0, -1);
      }
    }

    if (!cityParts.length || cityParts.length > 4) continue;
    const city = titleCase(cityParts.join("-"));
    if (city.length < 3 || city.length > 40) continue;

    const key = `${city}|${state}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(`${city}, ${state}`);
  }

  return out;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

/** Hosts we can't usefully crawl for business copy. */
const SKIP_HOSTS = ["facebook.com", "instagram.com", "yelp.com", "linkedin.com", "twitter.com", "x.com"];

const isBlank = (v: unknown) => v === null || v === undefined || String(v).trim() === "";

async function main() {
  if (!["fields", "areas"].includes(MODE)) {
    console.error(`Unknown --mode "${MODE}". Use "fields" or "areas".`);
    process.exit(1);
  }
  const scope = STATES.length ? STATES.join(", ") : "all states";
  console.log(`🌐  Haulagua — Website Enricher  [${MODE}]  [${scope}]`);
  console.log(DRY_RUN ? "    DRY RUN — no files will be modified. Pass --write to apply.\n"
                      : "    WRITE MODE — data/haulers-flat.json will be updated.\n");

  const haulers = loadHaulers();

  const targets = haulers.filter((h) => {
    if (ONLY) return h.slug === ONLY;
    if (h.isActive === false) return false;
    if (isBlank(h.website)) return false;
    if (STATES.length && !STATES.includes(String(h.state).toUpperCase())) return false;
    return true;
  });

  if (ONLY && !targets.length) {
    console.error(`No hauler with slug "${ONLY}".`);
    process.exit(1);
  }

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

    // ── areas mode ────────────────────────────────────────────────────────
    if (MODE === "areas") {
      if (h.areasCheckedAt && !FORCE) {
        console.log(`  ⏭️  skip      ${h.name} (mapped ${h.areasCheckedAt}; --force to redo)`);
        skipped++;
        continue;
      }
      if (!isBlank(h.serviceArea) && !FORCE) {
        console.log(`  ⏭️  skip      ${h.name} (serviceArea already set)`);
        skipped++;
        continue;
      }

      console.log(`  🗺️  mapping   ${h.name}  →  ${website}`);
      crawled++;
      await sleep(DELAY_MS);

      let urls: string[];
      try {
        urls = await mapSite(website);
      } catch (err) {
        console.error(`  ❌  failed    ${h.name}: ${err}`);
        failed++;
        continue;
      }

      const cities = citiesFromUrls(urls, h.state);
      if (!DRY_RUN) h.areasCheckedAt = new Date().toISOString().slice(0, 10);

      if (!cities.length) {
        console.log(`  🈳  no areas   ${h.name} (${urls.length} urls, no service-area pages)`);
        noData++;
        continue;
      }

      const value = cities.join("; ");
      diff.push({
        slug: h.slug,
        name: h.name,
        state: h.state,
        website,
        patch: { serviceArea: value },
      });

      if (!DRY_RUN) {
        h.serviceArea = value;
        h.enrichment = {
          source: "website:areas",
          at: new Date().toISOString().slice(0, 10),
          fields: ["serviceArea"],
        };
      }

      console.log(`  ✅  ${DRY_RUN ? "would set " : "set      "} ${h.name} → ${cities.length} cities: ${cities.slice(0, 5).join(", ")}${cities.length > 5 ? "…" : ""}`);
      enriched++;
      continue;
    }

    // ── fields mode ───────────────────────────────────────────────────────
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
    // Stored as a comma-joined string so the preview file stays readable; the
    // site can split on ", " when it eventually consumes this.
    if (isBlank(h.servicesDetected) && x.services.length) {
      patch.servicesDetected = x.services.join(", ");
    }

    const flags: string[] = [];
    const mismatch = licenceMismatch(h.certification, x.certification);
    if (mismatch) flags.push(mismatch);

    if (Object.keys(patch).length === 0 && flags.length === 0) {
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
      ...(flags.length ? { flags } : {}),
    });

    for (const f of flags) console.log(`  ⚠️  review    ${h.name}: ${f}`);

    if (Object.keys(patch).length === 0) {
      console.log(`  🈳  no data    ${h.name} (flagged for review only)`);
      noData++;
      continue;
    }

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
