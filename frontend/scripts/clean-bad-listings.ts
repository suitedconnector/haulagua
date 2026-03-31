/**
 * clean-bad-listings.ts
 *
 * Fetches all haulers from Strapi, identifies listings whose name contains
 * advertising placeholder text, and deletes them.
 *
 * Usage: npm run clean:listings
 *
 * Required env vars (read from .env.local / root .env.local):
 *   STRAPI_API_TOKEN
 *   NEXT_PUBLIC_STRAPI_URL  (defaults to http://localhost:1337)
 */

import * as path from "path";
import { config as loadDotenv } from "dotenv";

loadDotenv({ path: path.resolve(process.cwd(), ".env.local") });
loadDotenv({ path: path.resolve(process.cwd(), "..", ".env.local"), override: false });

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

if (!STRAPI_TOKEN) {
  console.error("❌  STRAPI_API_TOKEN is not set");
  process.exit(1);
}

// ─── Patterns to flag ─────────────────────────────────────────────────────────

const BAD_PATTERNS = [
  "AD AT TOP",
  "LOCK IN ON TOP",
  "LOCK IN TODAY",
  "AD HERE",
  "YOUR AD",
];

function isBadListing(name: string): boolean {
  const upper = name.toUpperCase();
  return BAD_PATTERNS.some((pattern) => upper.includes(pattern));
}

// ─── Strapi helpers ───────────────────────────────────────────────────────────

const headers: Record<string, string> = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${STRAPI_TOKEN}`,
};

interface StrapiHauler {
  id: number;
  attributes: { name: string; slug: string };
}

async function fetchAllHaulers(): Promise<StrapiHauler[]> {
  const all: StrapiHauler[] = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const params = new URLSearchParams({
      "fields[0]": "name",
      "fields[1]": "slug",
      "pagination[page]": String(page),
      "pagination[pageSize]": String(pageSize),
    });

    const res = await fetch(`${STRAPI_URL}/api/haulers?${params}`, { headers });
    if (!res.ok) throw new Error(`Fetch failed: HTTP ${res.status}`);

    const data = await res.json();
    const batch: StrapiHauler[] = data.data ?? [];
    all.push(...batch);

    const { page: currentPage, pageCount } = data.meta?.pagination ?? {};
    if (!currentPage || currentPage >= pageCount) break;
    page++;
  }

  return all;
}

async function deleteHauler(id: number): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/haulers/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error(`Delete failed: HTTP ${res.status}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🧹  Haulagua — Bad Listing Cleaner\n");
  console.log(`Patterns to flag: ${BAD_PATTERNS.map((p) => `"${p}"`).join(", ")}\n`);

  console.log("Fetching all haulers from Strapi…");
  const haulers = await fetchAllHaulers();
  console.log(`Fetched ${haulers.length} total haulers.\n`);

  const flagged = haulers.filter((h) => isBadListing(h.attributes.name));

  if (flagged.length === 0) {
    console.log("✅  No bad listings found. Nothing to delete.");
    return;
  }

  console.log(`Found ${flagged.length} bad listing(s):\n`);
  for (const h of flagged) {
    console.log(`  [${h.id}] "${h.attributes.name}" (slug: ${h.attributes.slug})`);
  }

  console.log("\nDeleting…\n");

  let deleted = 0;
  let failed = 0;

  for (const h of flagged) {
    try {
      await deleteHauler(h.id);
      console.log(`  ✅  deleted  [${h.id}] "${h.attributes.name}"`);
      deleted++;
    } catch (err) {
      console.error(`  ❌  failed   [${h.id}] "${h.attributes.name}": ${err}`);
      failed++;
    }
  }

  console.log("\n─────────────────────────────────────────");
  console.log(`✅  Deleted : ${deleted}`);
  if (failed > 0) console.log(`❌  Failed  : ${failed}`);
  console.log("─────────────────────────────────────────\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
