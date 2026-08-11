/**
 * check-slug-drift.ts
 *
 * Guards against silently orphaning indexed hauler URLs.
 *
 * Background: commit ae16eda (2026-04-30) rewrote haulers-flat.json and
 * removed 20 slugs while adding 25. It read as an additive refresh, so the
 * removals went unnoticed — 17 of those URLs were still returning 404 in
 * Google Search Console three months later.
 *
 * This compares the current haulers-flat.json against a committed snapshot
 * of known-published slugs. Any slug that disappears must be either
 * redirected in next.config.mjs or explicitly retired in the snapshot.
 *
 *   pnpm check:slugs             # fail on undeclared removals
 *   pnpm check:slugs --update    # accept current state as the baseline
 *
 * Runs automatically before `next build`, which means it also runs on every
 * Vercel deploy. A failure here blocks the deploy — that is deliberate, since
 * the alternative is shipping 404s to indexed URLs.
 *
 * Emergency override:  SKIP_SLUG_CHECK=1 pnpm build
 * (Vercel: add it as an env var, then remove it once the data is fixed.)
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

/**
 * Locate the app root by walking up from cwd looking for the data file.
 *
 * Deliberately avoids `import.meta.dirname` and `__dirname`: tsx loads this as
 * CJS (where import.meta is undefined) while `node --experimental-strip-types`
 * loads it as ESM (where __dirname is undefined). Walking up from cwd works
 * under both, and also lets the script run from the repo root or from frontend/.
 */
function findRoot(): string {
  let dir = resolve(process.cwd());
  for (let i = 0; i < 6; i++) {
    if (existsSync(join(dir, "data", "haulers-flat.json"))) return dir;
    if (existsSync(join(dir, "frontend", "data", "haulers-flat.json"))) {
      return join(dir, "frontend");
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  console.error(
    "check-slug-drift: could not locate data/haulers-flat.json from " +
      `${process.cwd()}\n  Run it from the frontend/ directory or the repo root.`
  );
  process.exit(1);
}

const ROOT = findRoot();
const DATA = join(ROOT, "data", "haulers-flat.json");
const SNAPSHOT = join(ROOT, "data", "published-slugs.json");
const CONFIG = join(ROOT, "next.config.mjs");

type Hauler = { slug: string; name?: string };
type Snapshot = {
  updated: string;
  /** Slugs that have been publicly reachable at /haulers/<slug>. */
  published: string[];
  /**
   * Slugs deliberately allowed to 404 — business is gone and there is no
   * equivalent page to redirect to. Add with a reason.
   */
  retired: Record<string, string>;
};

const isUpdate = process.argv.includes("--update");

if (process.env.SKIP_SLUG_CHECK === "1") {
  console.warn("⚠ SKIP_SLUG_CHECK=1 — slug drift check bypassed.");
  process.exit(0);
}

function readSnapshot(): Snapshot {
  if (!existsSync(SNAPSHOT)) {
    return { updated: "", published: [], retired: {} };
  }
  return JSON.parse(readFileSync(SNAPSHOT, "utf8")) as Snapshot;
}

/** Pull the source slug of every /haulers/* redirect out of next.config.mjs. */
function redirectedSlugs(): Set<string> {
  if (!existsSync(CONFIG)) return new Set();
  const src = readFileSync(CONFIG, "utf8");
  const found = new Set<string>();

  // Object-map form: 'old-slug': 'new-slug'
  for (const m of src.matchAll(/['"]([a-z0-9][\w.-]*)['"]\s*:\s*['"][\w.-]+['"]/gi)) {
    found.add(m[1]);
  }
  // Explicit form: source: '/haulers/old-slug'
  for (const m of src.matchAll(/source:\s*[`'"]\/haulers\/([\w.-]+)[`'"]/gi)) {
    found.add(m[1]);
  }
  return found;
}

const haulers = JSON.parse(readFileSync(DATA, "utf8")) as Hauler[];
const current = new Set(haulers.map((h) => h.slug).filter(Boolean));

// Duplicate slugs silently shadow each other at build time.
const seen = new Set<string>();
const duplicates = haulers
  .map((h) => h.slug)
  .filter((s) => s && (seen.has(s) ? true : (seen.add(s), false)));

const snapshot = readSnapshot();

if (isUpdate) {
  const next: Snapshot = {
    updated: new Date().toISOString().slice(0, 10),
    published: [...new Set([...snapshot.published, ...current])].sort(),
    retired: snapshot.retired ?? {},
  };
  writeFileSync(SNAPSHOT, JSON.stringify(next, null, 2) + "\n");
  console.log(
    `✓ Baseline updated — ${next.published.length} published slugs, ` +
      `${Object.keys(next.retired).length} retired.`
  );
  process.exit(0);
}

if (!snapshot.published.length) {
  console.error(
    "No slug baseline found.\n" +
      "Create one with:  npm run check:slugs -- --update"
  );
  process.exit(1);
}

const redirects = redirectedSlugs();
const retired = new Set(Object.keys(snapshot.retired ?? {}));

const orphaned = snapshot.published.filter(
  (s) => !current.has(s) && !redirects.has(s) && !retired.has(s)
);

// Redirects pointing at slugs that no longer exist produce redirect→404 chains.
const brokenTargets: string[] = [];
if (existsSync(CONFIG)) {
  const src = readFileSync(CONFIG, "utf8");
  for (const m of src.matchAll(/['"][\w.-]+['"]\s*:\s*['"]([\w.-]+)['"]/g)) {
    const target = m[1];
    if (redirects.size && !current.has(target) && snapshot.published.includes(target)) {
      brokenTargets.push(target);
    }
  }
}

let failed = false;

if (duplicates.length) {
  failed = true;
  console.error(`\n✗ Duplicate slugs in haulers-flat.json (${duplicates.length}):`);
  for (const s of [...new Set(duplicates)]) console.error(`    ${s}`);
}

if (orphaned.length) {
  failed = true;
  console.error(`\n✗ ${orphaned.length} previously-published slug(s) removed with no redirect:\n`);
  for (const slug of orphaned) {
    // Suggest a rename target if one looks close.
    const guess = [...current].find(
      (c) => c.startsWith(slug.slice(0, 12)) || slug.startsWith(c.slice(0, 12))
    );
    console.error(`    /haulers/${slug}${guess ? `   → likely renamed to: ${guess}` : ""}`);
  }
  console.error(
    "\n  Each one needs a decision:\n" +
      "    • renamed  → add a 301 to redirects() in next.config.mjs\n" +
      "    • gone     → add to `retired` in data/published-slugs.json with a reason\n"
  );
}

if (brokenTargets.length) {
  failed = true;
  console.error(`\n✗ Redirect target(s) no longer exist — these chain into a 404:`);
  for (const t of [...new Set(brokenTargets)]) console.error(`    ${t}`);
}

if (failed) process.exit(1);

console.log(
  `✓ No slug drift — ${current.size} live, ${redirects.size} redirected, ${retired.size} retired.`
);
