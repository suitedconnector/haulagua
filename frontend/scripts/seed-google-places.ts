/**
 * seed-google-places.ts
 *
 * Searches Google Places API for water hauler businesses and seeds them into
 * Strapi, or writes results to a CSV for manual review.
 *
 * Usage:
 *   npm run seed:google               # import directly to Strapi
 *   npm run seed:csv -- --state=FL    # dry-run: write CSV for review
 *
 * Flags:
 *   --dry-run        Write results to CSV instead of importing to Strapi
 *   --state=XX       Only search cities in the given state abbreviation (e.g. FL)
 *
 * Required env vars (read from .env.local):
 *   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
 *   STRAPI_API_TOKEN          (not required for --dry-run)
 *   NEXT_PUBLIC_STRAPI_URL    (defaults to http://localhost:1337)
 */

import * as fs from "fs";
import * as path from "path";
import { config as loadDotenv } from "dotenv";

// Load frontend/.env.local first, then root/.env.local for any missing vars
loadDotenv({ path: path.resolve(process.cwd(), ".env.local") });
loadDotenv({ path: path.resolve(process.cwd(), "..", ".env.local"), override: false });

// ─── CLI args ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const STATE_ARG = args.find((a) => a.startsWith("--state="))?.split("=")[1]?.toUpperCase() ?? null;

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

if (!GOOGLE_API_KEY) {
  console.error("❌  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set in .env.local");
  process.exit(1);
}
if (!DRY_RUN && !STRAPI_TOKEN) {
  console.error("❌  STRAPI_API_TOKEN is not set in .env.local");
  process.exit(1);
}

// ─── Config ───────────────────────────────────────────────────────────────────

const SEARCH_TERMS = ["water hauler", "bulk water delivery"];

const ALL_CITIES: { city: string; state: string; abbr: string }[] = [
  // Texas
  { city: "Houston", state: "Texas", abbr: "TX" },
  { city: "Dallas", state: "Texas", abbr: "TX" },
  { city: "San Antonio", state: "Texas", abbr: "TX" },
  { city: "Austin", state: "Texas", abbr: "TX" },
  { city: "Fort Worth", state: "Texas", abbr: "TX" },
  { city: "El Paso", state: "Texas", abbr: "TX" },
  { city: "Arlington", state: "Texas", abbr: "TX" },
  { city: "Corpus Christi", state: "Texas", abbr: "TX" },
  { city: "Plano", state: "Texas", abbr: "TX" },
  { city: "Lubbock", state: "Texas", abbr: "TX" },
  // Arizona
  { city: "Phoenix", state: "Arizona", abbr: "AZ" },
  { city: "Tucson", state: "Arizona", abbr: "AZ" },
  { city: "Mesa", state: "Arizona", abbr: "AZ" },
  { city: "Chandler", state: "Arizona", abbr: "AZ" },
  { city: "Scottsdale", state: "Arizona", abbr: "AZ" },
  { city: "Glendale", state: "Arizona", abbr: "AZ" },
  { city: "Gilbert", state: "Arizona", abbr: "AZ" },
  { city: "Tempe", state: "Arizona", abbr: "AZ" },
  { city: "Peoria", state: "Arizona", abbr: "AZ" },
  { city: "Surprise", state: "Arizona", abbr: "AZ" },
  // Florida
  { city: "Jacksonville", state: "Florida", abbr: "FL" },
  { city: "Miami", state: "Florida", abbr: "FL" },
  { city: "Tampa", state: "Florida", abbr: "FL" },
  { city: "Orlando", state: "Florida", abbr: "FL" },
  { city: "St. Petersburg", state: "Florida", abbr: "FL" },
  { city: "Hialeah", state: "Florida", abbr: "FL" },
  { city: "Port St. Lucie", state: "Florida", abbr: "FL" },
  { city: "Tallahassee", state: "Florida", abbr: "FL" },
  { city: "Fort Lauderdale", state: "Florida", abbr: "FL" },
  { city: "Cape Coral", state: "Florida", abbr: "FL" },
  { city: "Ocala", state: "Florida", abbr: "FL" },
  { city: "Gainesville", state: "Florida", abbr: "FL" },
  { city: "Pensacola", state: "Florida", abbr: "FL" },
  { city: "Lakeland", state: "Florida", abbr: "FL" },
];

const CITIES = STATE_ARG
  ? ALL_CITIES.filter((c) => c.abbr === STATE_ARG)
  : ALL_CITIES;

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlacesSearchResult {
  place_id: string;
  name: string;
  types?: string[];
}

interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_phone_number?: string;
  website?: string;
  formatted_address?: string;
  editorial_summary?: { overview?: string };
  rating?: number;
  types?: string[];
  address_components?: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
}

interface ParsedHauler {
  place_id: string;
  name: string;
  slug: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string;
  state: string;
  zip: string | null;
  description: string | null;
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

// ─── Relevance filter ─────────────────────────────────────────────────────────

const REQUIRED_KEYWORDS = [
  "water haul",
  "bulk water",
  "water delivery",
  "water truck",
  "tank truck",
  "water transport",
  "potable water",
  "cistern",
  "water hauling",
];

const EXCLUDE_KEYWORDS = [
  "bottled water",
  "alkaline",
  "culligan",
  "primo",
  "nestle",
  "arrowhead",
  "plumbing",
  "construction",
  "junk",
  "moving",
  "towing",
  "wash",
  "fire",
  "utility",
  "department",
  "government",
  "park",
  "restaurant",
  "food",
  "coffee",
  "tea",
  "h mart",
  "grocery",
  "supermarket",
  "asian market",
  // Additional exclusions
  "wellness",
  "carpet",
  "servpro",
  "city of",
  "county",
  "municipal",
  "utilities",
  "treatment",
  "water & ice",
  "water and ice",
  "bottled",
  "5 gallon",
  "dispenser",
  "cooler",
  "purified",
  "distilled",
  "reverse osmosis",
  "water store",
  "water shop",
  "water station",
  "beverage",
];

/**
 * Returns true if the listing is relevant to bulk water hauling.
 * Checks the business name and Google Places types array.
 */
function isRelevant(name: string, types: string[] = []): boolean {
  const haystack = [name, ...types].join(" ").toLowerCase();

  // Must match at least one required keyword
  const passes = REQUIRED_KEYWORDS.some((kw) => haystack.includes(kw));
  if (!passes) return false;

  // Excluded keywords are checked against name only (types like "food" are too broad)
  const nameLower = name.toLowerCase();
  const blocked = EXCLUDE_KEYWORDS.some((kw) => nameLower.includes(kw));
  return !blocked;
}

// ─── Google Places API ────────────────────────────────────────────────────────

async function searchPlaces(
  query: string,
  city: string,
  stateAbbr: string
): Promise<PlacesSearchResult[]> {
  const params = new URLSearchParams({
    query: `${query} ${city} ${stateAbbr}`,
    key: GOOGLE_API_KEY!,
  });

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`
  );
  if (!res.ok) throw new Error(`Places text search HTTP ${res.status}`);

  const data = await res.json();

  if (data.status === "REQUEST_DENIED") {
    throw new Error(`Google API denied: ${data.error_message ?? data.status}`);
  }
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    console.warn(`    ⚠️  Places search status: ${data.status}`);
  }

  return (data.results ?? []) as PlacesSearchResult[];
}

async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  const fields = [
    "place_id",
    "name",
    "formatted_phone_number",
    "website",
    "formatted_address",
    "editorial_summary",
    "address_components",
    "types",
  ].join(",");

  const params = new URLSearchParams({
    place_id: placeId,
    fields,
    key: GOOGLE_API_KEY!,
  });

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${params}`
  );
  if (!res.ok) throw new Error(`Place details HTTP ${res.status}`);

  const data = await res.json();
  if (data.status !== "OK") {
    console.warn(`    ⚠️  Details status for ${placeId}: ${data.status}`);
    return null;
  }

  return data.result as PlaceDetails;
}

// ─── Address parsing ──────────────────────────────────────────────────────────

function extractAddressParts(details: PlaceDetails): {
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
} {
  const comps = details.address_components ?? [];

  const get = (type: string) =>
    comps.find((c) => c.types.includes(type))?.long_name ?? null;
  const getShort = (type: string) =>
    comps.find((c) => c.types.includes(type))?.short_name ?? null;

  const streetNumber = get("street_number");
  const route = get("route");
  const streetAddress =
    streetNumber && route ? `${streetNumber} ${route}` : route ?? null;

  return {
    streetAddress,
    city:
      get("locality") ??
      get("sublocality") ??
      get("administrative_area_level_3") ??
      null,
    state: getShort("administrative_area_level_1"),
    zip: get("postal_code"),
  };
}

// ─── Strapi helpers ───────────────────────────────────────────────────────────

const strapiHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${STRAPI_TOKEN}`,
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
  hauler: ParsedHauler
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/haulers`, {
      method: "POST",
      headers: strapiHeaders,
      body: JSON.stringify({
        data: {
          name: hauler.name,
          slug: hauler.slug,
          phone: hauler.phone,
          website: hauler.website,
          address: hauler.address,
          city: hauler.city,
          state: hauler.state,
          zip: hauler.zip,
          description: hauler.description,
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

// ─── CSV helpers ──────────────────────────────────────────────────────────────

const CSV_COLUMNS = [
  "approved",
  "place_id",
  "name",
  "slug",
  "phone",
  "website",
  "address",
  "city",
  "state",
  "zip",
  "description",
] as const;

function csvCell(value: string | null | undefined): string {
  const s = value ?? "";
  // Quote fields that contain a comma, double-quote, or newline
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function haulerToCsvRow(hauler: ParsedHauler): string {
  return [
    "", // approved — left blank for human review
    hauler.place_id,
    hauler.name,
    hauler.slug,
    hauler.phone,
    hauler.website,
    hauler.address,
    hauler.city,
    hauler.state,
    hauler.zip,
    hauler.description,
  ]
    .map(csvCell)
    .join(",");
}

function writeCsv(haulers: ParsedHauler[], stateLabel: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const filename = `haulers-${stateLabel.toLowerCase()}-${date}.csv`;
  const outPath = path.resolve(process.cwd(), filename);
  const header = CSV_COLUMNS.join(",");
  const rows = haulers.map(haulerToCsvRow);
  fs.writeFileSync(outPath, [header, ...rows].join("\n") + "\n", "utf-8");
  return outPath;
}

// ─── Rate limiter (avoid hitting Google's QPS limit) ─────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const modeLabel = DRY_RUN ? "CSV dry-run" : "Strapi import";
  const stateLabel = STATE_ARG ?? "all";
  console.log(`💧  Haulagua — Google Places Seeder [${modeLabel}] [state: ${stateLabel}]\n`);

  if (STATE_ARG && CITIES.length === 0) {
    console.error(`❌  No cities configured for state "${STATE_ARG}"`);
    process.exit(1);
  }

  let totalImported = 0;
  let totalSkipped = 0;
  let totalFiltered = 0;
  let totalFailed = 0;

  // In dry-run mode we collect all valid haulers and write a single CSV at the end.
  const csvRows: ParsedHauler[] = [];

  // Collect unique place_ids across all searches to avoid re-processing the same
  // business found under different search terms or nearby cities.
  const seenPlaceIds = new Set<string>();

  for (const { city, state, abbr } of CITIES) {
    console.log(`\n📍  ${city}, ${abbr}`);

    for (const term of SEARCH_TERMS) {
      console.log(`  🔍  "${term}"`);

      let results: PlacesSearchResult[];
      try {
        results = await searchPlaces(term, city, abbr);
      } catch (err) {
        console.error(`    ❌  Search failed: ${err}`);
        continue;
      }

      if (results.length === 0) {
        console.log("    — no results");
        continue;
      }

      for (const result of results) {
        if (seenPlaceIds.has(result.place_id)) {
          continue; // already processed in a prior search
        }
        seenPlaceIds.add(result.place_id);

        // Throttle: 1 details call per 200 ms to stay well under QPS limits
        await sleep(200);

        let details: PlaceDetails | null;
        try {
          details = await getPlaceDetails(result.place_id);
        } catch (err) {
          console.warn(`    ⚠️  Details fetch failed for "${result.name}": ${err}`);
          continue;
        }
        if (!details) continue;

        const slug = generateSlug(details.name);
        if (!slug) {
          console.warn(`    ⚠️  Could not generate slug for "${details.name}" — skipping`);
          continue;
        }

        if (!isRelevant(details.name, details.types)) {
          console.log(`    🚫  filtered  ${details.name} (not a water hauler)`);
          totalFiltered++;
          continue;
        }

        const { streetAddress, city: detailCity, state: detailState, zip } =
          extractAddressParts(details);

        const hauler: ParsedHauler = {
          place_id: details.place_id,
          name: details.name,
          slug,
          phone: details.formatted_phone_number ?? null,
          website: details.website ?? null,
          address: streetAddress,
          city: detailCity ?? city,
          state: detailState ?? abbr,
          zip,
          description: details.editorial_summary?.overview ?? null,
        };

        if (DRY_RUN) {
          console.log(`    📝  queued   ${hauler.name} — ${hauler.city}, ${hauler.state}`);
          csvRows.push(hauler);
          totalImported++;
          continue;
        }

        const exists = await slugExists(slug);
        if (exists) {
          console.log(`    ⏭️  skip  ${details.name} (slug "${slug}" exists)`);
          totalSkipped++;
          continue;
        }

        const { ok, error } = await postHauler(hauler);
        if (ok) {
          console.log(`    ✅  imported  ${hauler.name} — ${hauler.city}, ${hauler.state}`);
          totalImported++;
        } else {
          console.error(`    ❌  failed    ${hauler.name}: ${error}`);
          totalFailed++;
        }

        // Small pause between Strapi writes
        await sleep(100);
      }

      // Pause between Google searches
      await sleep(500);
    }
  }

  if (DRY_RUN) {
    if (csvRows.length === 0) {
      console.log("\nNo results to write.");
    } else {
      const outPath = writeCsv(csvRows, stateLabel);
      console.log(`\n📄  CSV written: ${outPath}`);
      console.log(`    ${csvRows.length} rows — set approved=true on rows you want to import,`);
      console.log(`    then run: npm run import:csv -- <path-to-csv>`);
    }
    console.log("\n─────────────────────────────────────────");
    console.log(`📝  Queued   : ${totalImported}`);
    console.log(`🚫  Filtered : ${totalFiltered} (not a water hauler)`);
    console.log("─────────────────────────────────────────\n");
  } else {
    console.log("\n─────────────────────────────────────────");
    console.log(`✅  Imported : ${totalImported}`);
    console.log(`⏭️  Skipped  : ${totalSkipped} (duplicate slug)`);
    console.log(`🚫  Filtered : ${totalFiltered} (not a water hauler)`);
    console.log(`❌  Failed   : ${totalFailed}`);
    console.log("─────────────────────────────────────────\n");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
