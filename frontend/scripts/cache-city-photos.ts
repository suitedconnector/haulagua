/**
 * cache-city-photos.ts
 *
 * Fetches a Google Places photo URL for every unique city+state
 * found in Strapi hauler records, then writes the results to
 * data/city-photos.json so the state pages never hit Google at runtime.
 *
 * Run once (or whenever new cities are added):
 *   npm run cache:city-photos
 *
 * Only fetches cities not already in the cache — safe to re-run.
 */

import * as path from "path";
import * as fs from "fs";
import { config as loadDotenv } from "dotenv";

loadDotenv({ path: path.resolve(process.cwd(), ".env.local") });

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;
const CACHE_PATH = path.resolve(process.cwd(), "data/city-photos.json");

if (!GOOGLE_API_KEY) { console.error("❌  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set"); process.exit(1); }
if (!STRAPI_TOKEN)   { console.error("❌  STRAPI_API_TOKEN is not set"); process.exit(1); }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cacheKey(city: string, state: string) {
  return `${city}|${state}`;
}

async function fetchAllHaulers() {
  const res = await fetch(
    `${STRAPI_URL}/api/haulers?fields[0]=city&fields[1]=state&pagination[pageSize]=1000`,
    { headers: { Authorization: `Bearer ${STRAPI_TOKEN}` } }
  );
  if (!res.ok) throw new Error(`Strapi error: ${res.status}`);
  const data = await res.json();
  return data.data as { id: number; attributes: { city: string; state: string } }[];
}

async function fetchCityPhoto(city: string, state: string): Promise<string | null> {
  try {
    const searchUrl =
      `https://maps.googleapis.com/maps/api/place/textsearch/json` +
      `?query=${encodeURIComponent(`${city}, ${state}`)}&key=${GOOGLE_API_KEY}`;

    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const photoRef: string | undefined = searchData.results?.[0]?.photos?.[0]?.photo_reference;
    if (!photoRef) return null;

    const photoUrl =
      `https://maps.googleapis.com/maps/api/place/photo` +
      `?maxwidth=800&photoreference=${photoRef}&key=${GOOGLE_API_KEY}`;

    const photoRes = await fetch(photoUrl, { redirect: "follow" });
    if (!photoRes.ok) return null;
    return photoRes.url;
  } catch {
    return null;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Load existing cache
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  const existing: Record<string, string> = fs.existsSync(CACHE_PATH)
    ? JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"))
    : {};

  console.log(`📦 Loaded ${Object.keys(existing).length} cached city photos`);

  // Get unique cities from Strapi
  const haulers = await fetchAllHaulers();
  const cities = new Map<string, { city: string; state: string }>();
  for (const h of haulers) {
    const { city, state } = h.attributes;
    if (city && state) cities.set(cacheKey(city, state), { city, state });
  }

  const toFetch = [...cities.entries()].filter(([key]) => !existing[key]);
  console.log(`🔍 ${toFetch.length} new cities to fetch (${cities.size - toFetch.length} already cached)\n`);

  let fetched = 0;
  let failed = 0;

  for (const [key, { city, state }] of toFetch) {
    process.stdout.write(`  Fetching ${city}, ${state}... `);
    const url = await fetchCityPhoto(city, state);
    if (url) {
      existing[key] = url;
      fetched++;
      console.log("✅");
    } else {
      failed++;
      console.log("❌ no photo");
    }
    // Respect Google rate limits
    await new Promise(r => setTimeout(r, 200));
  }

  fs.writeFileSync(CACHE_PATH, JSON.stringify(existing, null, 2));
  console.log(`\n✅ Done — ${fetched} fetched, ${failed} failed. Cache saved to data/city-photos.json`);
}

main().catch(err => { console.error(err); process.exit(1); });
