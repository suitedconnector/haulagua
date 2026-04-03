/**
 * seed-google-places.ts
 *
 * Searches Google Places API for water hauler businesses in Texas and Arizona
 * cities and seeds them into Strapi.
 *
 * Usage: npm run seed:google
 *
 * Required env vars (read from .env.local):
 *   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
 *   STRAPI_API_TOKEN
 *   NEXT_PUBLIC_STRAPI_URL  (defaults to http://localhost:1337)
 */

import * as path from "path";
import { config as loadDotenv } from "dotenv";

// Load frontend/.env.local first, then root/.env.local for any missing vars
loadDotenv({ path: path.resolve(process.cwd(), ".env.local") });
loadDotenv({ path: path.resolve(process.cwd(), "..", ".env.local"), override: false });

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

if (!GOOGLE_API_KEY) {
  console.error("❌  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set in .env.local");
  process.exit(1);
}
if (!STRAPI_TOKEN) {
  console.error("❌  STRAPI_API_TOKEN is not set in .env.local");
  process.exit(1);
}

// ─── Config ───────────────────────────────────────────────────────────────────

const SEARCH_TERMS = ["water hauler", "bulk water delivery"];

const CITIES: { city: string; state: string; abbr: string }[] = [
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
];

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

// ─── Rate limiter (avoid hitting Google's QPS limit) ─────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("💧  Haulagua — Google Places Seeder\n");

  let totalImported = 0;
  let totalSkipped = 0;
  let totalFiltered = 0;
  let totalFailed = 0;

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

        const exists = await slugExists(slug);
        if (exists) {
          console.log(`    ⏭️  skip  ${details.name} (slug "${slug}" exists)`);
          totalSkipped++;
          continue;
        }

        const { streetAddress, city: detailCity, state: detailState, zip } =
          extractAddressParts(details);

        const hauler: ParsedHauler = {
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

  console.log("\n─────────────────────────────────────────");
  console.log(`✅  Imported : ${totalImported}`);
  console.log(`⏭️  Skipped  : ${totalSkipped} (duplicate slug)`);
  console.log(`🚫  Filtered : ${totalFiltered} (not a water hauler)`);
  console.log(`❌  Failed   : ${totalFailed}`);
  console.log("─────────────────────────────────────────\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
