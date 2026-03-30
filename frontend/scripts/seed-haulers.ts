/**
 * seed-haulers.ts
 *
 * Scrapes bulk water hauler listings from the bulkwaterdelivery.com state directory,
 * parses Texas and Arizona sections, and seeds them into the local Strapi instance.
 *
 * Usage: npm run seed:haulers
 */

import * as path from "path";
import * as fs from "fs";
import { config as loadDotenv } from "dotenv";

loadDotenv({ path: path.resolve(process.cwd(), ".env.local") });

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

const DIRECTORY_URL =
  "https://bulkwaterdelivery.com/Bulk-Water-Haulers-and-Suppliers-State-Directory.htm";

const TARGET_STATES: { anchor: string; next: string; abbr: string; name: string }[] = [
  { anchor: "TX", next: "VI", abbr: "TX", name: "Texas" },
  { anchor: "AZ", next: "CA", abbr: "AZ", name: "Arizona" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedHauler {
  name: string;
  phone: string;
  city?: string;
  state: string;
  rawServices: string[];
  website?: string;
}

// ─── HTML helpers ─────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(p|div|td|tr|li|h[1-6])[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, " ")
    .replace(/&[a-z]+;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n");
}

function extractWebsites(html: string): Map<string, string> {
  // Map business name fragments → website URL for entries that have a site link
  const map = new Map<string, string>();
  const re = /clicky_log_outbound[^>]+href="(https?:\/\/[^"?]+)[^"]*"[^>]*title="([^"]+)"/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const url = m[1].replace(/\?source=.*$/, "");
    const title = m[2];
    map.set(title.toLowerCase().slice(0, 40), url);
  }
  return map;
}

// ─── Parser ───────────────────────────────────────────────────────────────────

const PHONE_RE = /\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4}/;
const SKIP_LINE = /^(please tell|how to get|lock in|haulers:|copyright|adverti|disclaimer|^\s*$)/i;
const COUNTY_ONLY = /^[A-Za-z\s]+County\s*[-–]?\s*$/i;
// "AMARILLO -"  or "San Antonio -"  or "DALLAS -"  — a standalone city header line
const CITY_HEADER = /^([A-Za-z\s\.]+?)\s*[-–]\s*$/;
// Matches a US state section boundary like "Utah  (UT)" or "Vermont" appearing on its own line
const US_STATES: Record<string, string> = {
  Alabama:"AL",Arkansas:"AR",California:"CA",Colorado:"CO",Connecticut:"CT",
  Delaware:"DE",Florida:"FL",Georgia:"GA",Hawaii:"HI",Idaho:"ID",Illinois:"IL",
  Indiana:"IN",Iowa:"IA",Kansas:"KS",Kentucky:"KY",Louisiana:"LA",Maine:"ME",
  Maryland:"MD",Massachusetts:"MA",Michigan:"MI",Minnesota:"MN",Mississippi:"MS",
  Missouri:"MO",Montana:"MT",Nebraska:"NE",Nevada:"NV","New Hampshire":"NH",
  "New Jersey":"NJ","New Mexico":"NM","New York":"NY","North Carolina":"NC",
  "North Dakota":"ND",Ohio:"OH",Oklahoma:"OK",Oregon:"OR",Pennsylvania:"PA",
  "Rhode Island":"RI","South Carolina":"SC","South Dakota":"SD",Tennessee:"TN",
  Texas:"TX",Utah:"UT",Vermont:"VT","Virgin Islands":"VI",Virginia:"VA",
  Washington:"WA","West Virginia":"WV",Wisconsin:"WI",Wyoming:"WY",
};
function detectStateTransition(line: string): string | null {
  // Only fire on lines that ARE essentially a state name/header, e.g.:
  //   "Utah  (UT)"  |  "Vermont"  |  "Utah"
  // NOT on lines where a state name is embedded, e.g. "Iowa Park"
  const clean = line.trim().replace(/\([A-Z]{2}\)/, "").trim();
  for (const [name, abbr] of Object.entries(US_STATES)) {
    // The cleaned line must be exactly (or very close to) just the state name
    if (clean.toLowerCase() === name.toLowerCase()) return abbr;
    // Allow the abbreviation alone on the line, e.g. "(TX)" or just "TX"
    if (line.trim().replace(/[()]/g, "").trim() === abbr) return abbr;
  }
  return null;
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return raw.trim();
}

function parseEntry(
  entryLines: string[],
  stateAbbr: string
): ParsedHauler | null {
  const fullText = entryLines.join(" ").replace(/\s+/g, " ").trim();
  const phoneMatch = fullText.match(PHONE_RE);
  if (!phoneMatch) return null;

  const phone = normalisePhone(phoneMatch[0]);
  const phoneIdx = fullText.indexOf(phoneMatch[0]);
  const beforePhone = fullText.slice(0, phoneIdx).trim().replace(/[,\s]+$/, "");
  const afterPhone = fullText.slice(phoneIdx + phoneMatch[0].length).trim();

  // Services are often in parens after the phone
  const servicesMatch = afterPhone.match(/\(([^)]{3,})\)/);
  const rawServices = servicesMatch
    ? servicesMatch[1]
        .split(/[,\/]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // Parse name and city from beforePhone
  // Patterns seen:
  //   "Business Name, City"
  //   "City , Business Name"
  //   "City - Business Name"
  //   "Business Name" (no city)
  let name = "";
  let city: string | undefined;

  // Try separator: comma or " - "
  const sepMatch = beforePhone.match(/^(.+?)\s*(?:,\s*|-\s+)(.+)$/);
  if (sepMatch) {
    const [, a, b] = sepMatch;
    const aLooksLikeCity =
      a === a.toUpperCase() || (!a.includes(" ") && a.length < 25);
    if (aLooksLikeCity) {
      city = titleCase(a);
      name = b.trim();
    } else {
      name = a.trim();
      // Only use as city if it doesn't look like a descriptor
      if (b.length < 30 && !b.match(/\bservice|haul|water|truck|transport\b/i)) {
        city = titleCase(b);
      }
    }
  } else {
    name = beforePhone;
  }

  // Strip trailing punctuation artifacts
  name = name.replace(/^[\s,\-]+|[\s,\-]+$/g, "").trim();
  if (city) city = city.replace(/\bCounty\b.*$/i, "").trim();

  if (!name || name.length < 3) return null;
  // Skip obvious non-entries
  if (/^(county|state|please|how to|lock|haulers)/i.test(name)) return null;

  return { name, phone, city, state: stateAbbr, rawServices };
}

function parseStateSection(
  sectionHtml: string,
  stateAbbr: string
): ParsedHauler[] {
  const websiteMap = extractWebsites(sectionHtml);
  const text = stripHtml(sectionHtml);
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 1 && !SKIP_LINE.test(l) && !COUNTY_ONLY.test(l));

  const haulers: ParsedHauler[] = [];
  let currentEntry: string[] = [];
  let cityContext: string | undefined; // set when we hit a "CITY -" header line
  let doneWithState = false;

  for (const line of lines) {
    // Stop parsing if we've entered a different US state's section
    if (!doneWithState) {
      const transState = detectStateTransition(line);
      if (transState && transState !== stateAbbr && !PHONE_RE.test(line)) {
        doneWithState = true;
        currentEntry = [];
        continue;
      }
    }
    if (doneWithState) continue;

    // Detect standalone "CITY -" header lines — don't include them in the entry,
    // but remember the city for the next entry that follows.
    const cityHeaderMatch = line.match(CITY_HEADER);
    if (cityHeaderMatch && !PHONE_RE.test(line)) {
      cityContext = titleCase(cityHeaderMatch[1]);
      currentEntry = []; // discard any accumulated noise before this header
      continue;
    }

    currentEntry.push(line);

    if (PHONE_RE.test(line)) {
      const hauler = parseEntry(currentEntry, stateAbbr);
      if (hauler) {
        // Fill city from context header if the entry didn't resolve its own city
        if (!hauler.city && cityContext) hauler.city = cityContext;
        // Try to match a website from the link map
        for (const [titleFrag, url] of websiteMap) {
          if (hauler.name.toLowerCase().includes(titleFrag.slice(0, 15))) {
            hauler.website = url;
            break;
          }
        }
        haulers.push(hauler);
      }
      currentEntry = [];
      cityContext = undefined; // reset after using
    }

    // Reset if entry accumulates too many lines without a phone (noise)
    if (currentEntry.length > 6) {
      currentEntry = [];
    }
  }

  return haulers;
}

// ─── Service normalisation ────────────────────────────────────────────────────

const SERVICE_MAP: [RegExp, string][] = [
  [/pool|swim|hot tub|fountain/i, "pool"],
  [/construct|dust|compact|soil|spray/i, "construction"],
  [/potable|drinking|cistern|well|tank\s+fill/i, "potable"],
  [/agri|livestock|farm|crop|irrig/i, "agricultural"],
  [/emerg|disaster|relief|drought/i, "emergency"],
  [/event|festival|mud|sport/i, "events"],
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

// ─── Slug ─────────────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Strapi helpers ───────────────────────────────────────────────────────────

const strapiHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
};

async function slugExists(slug: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/haulers?filters[slug][$eq]=${encodeURIComponent(slug)}&fields[0]=slug`,
      { headers: strapiHeaders }
    );
    const data = await res.json();
    return (data.data?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

async function postHauler(
  hauler: ParsedHauler,
  slug: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const services = normaliseServices(hauler.rawServices);
    const res = await fetch(`${STRAPI_URL}/api/haulers`, {
      method: "POST",
      headers: strapiHeaders,
      body: JSON.stringify({
        data: {
          name: hauler.name,
          slug,
          phone: hauler.phone,
          city: hauler.city ?? null,
          state: hauler.state,
          website: hauler.website ?? null,
          description: null,
          isClaimed: false,
          isVerifiedPro: false,
          isActive: true,
          publishedAt: new Date().toISOString(),
        },
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

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚰  Haulagua Seeder — bulkwaterdelivery.com\n");
  console.log(`Fetching directory from ${DIRECTORY_URL} …`);

  const res = await fetch(DIRECTORY_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; HaulaguaSeeder/1.0)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching directory`);
  const html = await res.text();
  console.log(`Fetched ${(html.length / 1024).toFixed(0)} KB\n`);

  const allHaulers: ParsedHauler[] = [];

  for (const state of TARGET_STATES) {
    // Use the LAST occurrence of the start anchor (content section, not TOC nav anchor)
    const start = html.lastIndexOf(`name="${state.anchor}">`);
    if (start === -1) {
      console.warn(`⚠️  Could not find start anchor for ${state.name}`);
      continue;
    }
    // Skip past the closing '>' of the anchor tag to avoid the fragment in extracted text
    const sectionStart = html.indexOf(">", start) + 1;
    // Use FORWARD search from sectionStart for the next-state anchor (prevents over-reaching)
    const end = html.indexOf(`name="${state.next}">`, sectionStart);
    if (end === -1) {
      console.warn(`⚠️  Could not find end anchor (${state.next}) for ${state.name}`);
      continue;
    }
    const sectionHtml = html.slice(sectionStart, end);
    const haulers = parseStateSection(sectionHtml, state.abbr);
    console.log(`📍  ${state.name}: found ${haulers.length} hauler(s)`);
    allHaulers.push(...haulers);

    // Write debug file
    const debugFile = path.resolve(
      process.cwd(),
      `scripts/debug-${state.abbr}.json`
    );
    fs.writeFileSync(debugFile, JSON.stringify(haulers, null, 2));
    console.log(`    Debug → ${debugFile}`);
  }

  if (allHaulers.length === 0) {
    console.warn("\n⚠️  No haulers parsed. Check the debug files.");
    return;
  }

  console.log(`\n📋  Total to process: ${allHaulers.length} hauler(s)\n`);

  let seeded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < allHaulers.length; i++) {
    const hauler = allHaulers[i];
    const slug = generateSlug(hauler.name);

    process.stdout.write(
      `Seeding hauler ${i + 1} of ${allHaulers.length}: ${hauler.name} … `
    );

    if (!slug) {
      console.log("⏭   Skipped (no slug)");
      skipped++;
      continue;
    }

    if (await slugExists(slug)) {
      console.log("⏭   Skipped (duplicate)");
      skipped++;
      continue;
    }

    const result = await postHauler(hauler, slug);
    if (result.ok) {
      console.log("✅  Seeded");
      seeded++;
    } else {
      console.log(`❌  Failed — ${result.error}`);
      failed++;
    }
  }

  console.log(
    `\n🎉  Done!  Seeded: ${seeded}  |  Skipped: ${skipped}  |  Failed: ${failed}\n`
  );
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
