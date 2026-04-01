/**
 * enrich-google.ts
 *
 * Enriches TX hauler listings in Strapi using Google Places API.
 * Searches for each hauler by name + city + state, and if a high-confidence
 * match is found (name similarity ≥ 70%) fills in any missing fields:
 * description, website, phone, address.
 *
 * Never overwrites existing data.
 *
 * Usage: npm run enrich:google
 */

import * as path from "path";
import { config as loadDotenv } from "dotenv";

loadDotenv({ path: path.resolve(process.cwd(), ".env.local") });
loadDotenv({ path: path.resolve(process.cwd(), "..", ".env.local"), override: false });

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

if (!GOOGLE_API_KEY) {
  console.error("❌  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set");
  process.exit(1);
}
if (!STRAPI_TOKEN) {
  console.error("❌  STRAPI_API_TOKEN is not set");
  process.exit(1);
}

const SIMILARITY_THRESHOLD = 0.70;

// ─── Types ────────────────────────────────────────────────────────────────────

interface StrapiHauler {
  id: number;
  attributes: {
    name: string;
    slug: string;
    city: string;
    state: string;
    phone: string | null;
    website: string | null;
    address: string | null;
    description: string | null;
  };
}

interface PlaceResult {
  place_id: string;
  name: string;
}

interface PlaceDetails {
  name: string;
  formatted_phone_number?: string;
  website?: string;
  formatted_address?: string;
  editorial_summary?: { overview?: string };
  address_components?: { long_name: string; short_name: string; types: string[] }[];
}

// ─── Name similarity (Jaccard on word tokens) ─────────────────────────────────

function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(llc|inc|ltd|co|corp|company|services?|water|hauling|hauler|delivery|truck|bulk)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function similarity(a: string, b: string): number {
  const setA = new Set(normalise(a).split(" ").filter(Boolean));
  const setB = new Set(normalise(b).split(" ").filter(Boolean));
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;
  const intersection = [...setA].filter((t) => setB.has(t)).length;
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

// ─── Strapi helpers ───────────────────────────────────────────────────────────

const strapiHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${STRAPI_TOKEN}`,
};

async function fetchTXHaulers(): Promise<StrapiHauler[]> {
  const all: StrapiHauler[] = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const p = new URLSearchParams({
      "filters[isActive][$eq]": "true",
      "filters[state][$eq]": "TX",
      "fields[0]": "name",
      "fields[1]": "slug",
      "fields[2]": "city",
      "fields[3]": "state",
      "fields[4]": "phone",
      "fields[5]": "website",
      "fields[6]": "address",
      "fields[7]": "description",
      "pagination[page]": String(page),
      "pagination[pageSize]": String(pageSize),
    });

    const res = await fetch(`${STRAPI_URL}/api/haulers?${p}`, { headers: strapiHeaders });
    if (!res.ok) throw new Error(`Strapi fetch failed: HTTP ${res.status}`);
    const data = await res.json();

    all.push(...(data.data ?? []));

    const { page: cur, pageCount } = data.meta?.pagination ?? {};
    if (!cur || cur >= pageCount) break;
    page++;
  }

  return all;
}

async function updateHauler(
  id: number,
  patch: Record<string, string | null>
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

// ─── Google Places helpers ────────────────────────────────────────────────────

async function searchPlace(
  name: string,
  city: string,
  state: string
): Promise<PlaceResult[]> {
  const params = new URLSearchParams({
    query: `${name} ${city} ${state}`,
    key: GOOGLE_API_KEY!,
  });
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`
  );
  if (!res.ok) throw new Error(`Places search HTTP ${res.status}`);
  const data = await res.json();
  if (data.status === "REQUEST_DENIED")
    throw new Error(`Google API denied: ${data.error_message}`);
  return (data.results ?? []) as PlaceResult[];
}

async function getDetails(placeId: string): Promise<PlaceDetails | null> {
  const fields = [
    "name",
    "formatted_phone_number",
    "website",
    "formatted_address",
    "editorial_summary",
    "address_components",
  ].join(",");
  const params = new URLSearchParams({ place_id: placeId, fields, key: GOOGLE_API_KEY! });
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${params}`
  );
  if (!res.ok) throw new Error(`Place details HTTP ${res.status}`);
  const data = await res.json();
  return data.status === "OK" ? (data.result as PlaceDetails) : null;
}

// ─── Rate limiter ─────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🔍  Haulagua — Google Places Enricher (TX)\n");

  const haulers = await fetchTXHaulers();
  console.log(`Fetched ${haulers.length} active TX haulers.\n`);

  let enriched = 0;
  let notFound = 0;
  let skipped = 0;
  let failed = 0;

  for (const hauler of haulers) {
    const a = hauler.attributes;

    // If all enrichable fields already have data, nothing to do
    const allPresent = a.description && a.website && a.phone && a.address;
    if (allPresent) {
      console.log(`  ⏭️  skip    ${a.name} (all fields present)`);
      skipped++;
      continue;
    }

    await sleep(200);

    let results: PlaceResult[];
    try {
      results = await searchPlace(a.name, a.city, a.state);
    } catch (err) {
      console.error(`  ❌  error   ${a.name}: ${err}`);
      failed++;
      continue;
    }

    // Find best match above threshold
    let bestMatch: PlaceResult | null = null;
    let bestScore = 0;
    for (const r of results.slice(0, 3)) {
      const score = similarity(a.name, r.name);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = r;
      }
    }

    if (!bestMatch || bestScore < SIMILARITY_THRESHOLD) {
      console.log(
        `  🔎  not found  ${a.name}${bestMatch ? ` (best: "${bestMatch.name}" @ ${(bestScore * 100).toFixed(0)}%)` : ""}`
      );
      notFound++;
      continue;
    }

    let details: PlaceDetails | null;
    try {
      details = await getDetails(bestMatch.place_id);
    } catch (err) {
      console.error(`  ❌  error   ${a.name} (details): ${err}`);
      failed++;
      continue;
    }
    if (!details) {
      notFound++;
      continue;
    }

    // Build patch — only fill missing fields
    const patch: Record<string, string | null> = {};
    if (!a.description && details.editorial_summary?.overview)
      patch.description = details.editorial_summary.overview;
    if (!a.website && details.website)
      patch.website = details.website;
    if (!a.phone && details.formatted_phone_number)
      patch.phone = details.formatted_phone_number;
    if (!a.address && details.formatted_address)
      patch.address = details.formatted_address;

    if (Object.keys(patch).length === 0) {
      console.log(`  ⏭️  skip    ${a.name} (matched @ ${(bestScore * 100).toFixed(0)}% but no new data)`);
      skipped++;
      continue;
    }

    await sleep(100);

    try {
      await updateHauler(hauler.id, patch);
      const fields = Object.keys(patch).join(", ");
      console.log(
        `  ✅  enriched  ${a.name} (${(bestScore * 100).toFixed(0)}% match) → ${fields}`
      );
      enriched++;
    } catch (err) {
      console.error(`  ❌  failed   ${a.name}: ${err}`);
      failed++;
    }
  }

  console.log("\n─────────────────────────────────────────");
  console.log(`✅  Enriched  : ${enriched}`);
  console.log(`🔎  Not found : ${notFound}`);
  console.log(`⏭️  Skipped   : ${skipped}`);
  console.log(`❌  Failed    : ${failed}`);
  console.log("─────────────────────────────────────────\n");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
