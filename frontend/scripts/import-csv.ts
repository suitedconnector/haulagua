/**
 * import-csv.ts
 *
 * Reads a CSV produced by `npm run seed:csv` and imports only rows where
 * approved=true into Strapi, skipping any slug that already exists.
 *
 * Usage:
 *   npm run import:csv -- haulers-fl-2026-04-03.csv
 *
 * Required env vars (read from .env.local):
 *   STRAPI_API_TOKEN
 *   NEXT_PUBLIC_STRAPI_URL  (defaults to http://localhost:1337)
 */

import * as fs from "fs";
import * as path from "path";
import { config as loadDotenv } from "dotenv";

loadDotenv({ path: path.resolve(process.cwd(), ".env.local") });
loadDotenv({ path: path.resolve(process.cwd(), "..", ".env.local"), override: false });

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

if (!STRAPI_TOKEN) {
  console.error("❌  STRAPI_API_TOKEN is not set in .env.local");
  process.exit(1);
}

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("❌  Usage: npm run import:csv -- <path-to-csv>");
  process.exit(1);
}

const resolvedPath = path.resolve(process.cwd(), csvPath);
if (!fs.existsSync(resolvedPath)) {
  console.error(`❌  File not found: ${resolvedPath}`);
  process.exit(1);
}

// ─── CSV parser ───────────────────────────────────────────────────────────────

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

interface CsvRow {
  approved: string;
  place_id: string;
  name: string;
  slug: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  description: string;
}

function parseCsv(content: string): CsvRow[] {
  const lines = content.split("\n").filter((l) => l.trim() !== "");
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = values[idx]?.trim() ?? "";
    });
    rows.push(row as unknown as CsvRow);
  }

  return rows;
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

async function postHauler(row: CsvRow): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/haulers`, {
      method: "POST",
      headers: strapiHeaders,
      body: JSON.stringify({
        data: {
          name: row.name,
          slug: row.slug,
          phone: row.phone || null,
          website: row.website || null,
          address: row.address || null,
          city: row.city,
          state: row.state,
          zip: row.zip || null,
          description: row.description || null,
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`💧  Haulagua — CSV Importer\n`);
  console.log(`📄  Reading: ${resolvedPath}\n`);

  const content = fs.readFileSync(resolvedPath, "utf-8");
  const rows = parseCsv(content);

  const approved = rows.filter((r) => r.approved.toLowerCase() === "true");
  console.log(`    ${rows.length} total rows, ${approved.length} approved\n`);

  if (approved.length === 0) {
    console.log("Nothing to import. Set approved=true on rows you want to import.");
    return;
  }

  let totalImported = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const row of approved) {
    if (!row.name || !row.slug) {
      console.warn(`    ⚠️  Missing name/slug — skipping row`);
      continue;
    }

    const exists = await slugExists(row.slug);
    if (exists) {
      console.log(`    ⏭️  skip  ${row.name} (slug "${row.slug}" exists)`);
      totalSkipped++;
      continue;
    }

    const { ok, error } = await postHauler(row);
    if (ok) {
      console.log(`    ✅  imported  ${row.name} — ${row.city}, ${row.state}`);
      totalImported++;
    } else {
      console.error(`    ❌  failed    ${row.name}: ${error}`);
      totalFailed++;
    }

    await sleep(100);
  }

  console.log("\n─────────────────────────────────────────");
  console.log(`✅  Imported : ${totalImported}`);
  console.log(`⏭️  Skipped  : ${totalSkipped} (duplicate slug)`);
  console.log(`❌  Failed   : ${totalFailed}`);
  console.log("─────────────────────────────────────────\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
