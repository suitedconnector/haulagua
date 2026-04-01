/**
 * clean-descriptions.ts
 *
 * Fetches all active TX haulers from Strapi and nulls out the description
 * field for any record where the description contains junk patterns left
 * behind by website enrichment (expired domains, error pages, placeholders).
 *
 * Usage: npm run clean:descriptions
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

// ─── Junk patterns ────────────────────────────────────────────────────────────

const JUNK_PATTERNS = [
  "account has expired",
  "media error",
  "something went wrong",
  "your company",
  "coming soon",
  "under construction",
  "lorem ipsum",
  "page not found",
  "403",
  "404",
  "error",
  "domain",
  "parked",
  "placeholder",
];

function isJunk(description: string): boolean {
  const lower = description.toLowerCase();
  return JUNK_PATTERNS.some((p) => lower.includes(p));
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface StrapiHauler {
  id: number;
  attributes: {
    name: string;
    description: string | null;
  };
}

// ─── Strapi helpers ───────────────────────────────────────────────────────────

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${STRAPI_TOKEN}`,
};

async function fetchTXHaulers(): Promise<StrapiHauler[]> {
  const all: StrapiHauler[] = [];
  let page = 1;

  while (true) {
    const p = new URLSearchParams({
      "filters[isActive][$eq]": "true",
      "filters[state][$eq]": "TX",
      "filters[description][$notNull]": "true",
      "fields[0]": "name",
      "fields[1]": "description",
      "pagination[page]": String(page),
      "pagination[pageSize]": "100",
    });

    const res = await fetch(`${STRAPI_URL}/api/haulers?${p}`, { headers });
    if (!res.ok) throw new Error(`Strapi fetch failed: HTTP ${res.status}`);
    const data = await res.json();

    all.push(...(data.data ?? []));

    const { page: cur, pageCount } = data.meta?.pagination ?? {};
    if (!cur || cur >= pageCount) break;
    page++;
  }

  return all;
}

async function nullDescription(id: number): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/haulers/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: { description: null } }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `HTTP ${res.status}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🧹  Haulagua — Description Cleaner (TX)\n");

  const haulers = await fetchTXHaulers();
  console.log(`Fetched ${haulers.length} active TX haulers with descriptions.\n`);

  let cleaned = 0;
  let kept = 0;
  let failed = 0;

  for (const hauler of haulers) {
    const { name, description } = hauler.attributes;
    if (!description) continue;

    if (!isJunk(description)) {
      kept++;
      continue;
    }

    const snippet = description.slice(0, 80).replace(/\n/g, " ");
    try {
      await nullDescription(hauler.id);
      console.log(`  🗑️   cleaned  "${name}"`);
      console.log(`         was: "${snippet}${description.length > 80 ? "…" : ""}"`);
      cleaned++;
    } catch (err) {
      console.error(`  ❌  failed   "${name}": ${err}`);
      failed++;
    }
  }

  console.log("\n─────────────────────────────────────────");
  console.log(`🗑️   Cleaned : ${cleaned}`);
  console.log(`✅  Kept    : ${kept}`);
  console.log(`❌  Failed  : ${failed}`);
  console.log("─────────────────────────────────────────\n");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
