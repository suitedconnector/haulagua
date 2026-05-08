#!/usr/bin/env node
/**
 * merge-haulers.js
 * Run from: /Volumes/DevProjects/MVPs/haulagua/frontend/
 *   node scripts/merge-haulers.js
 */

const fs = require('fs');
const path = require('path');

// __dirname = .../frontend/scripts — so go up one level for data/
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const HAULERS_JSON = path.join(DATA_DIR, 'haulers.json');
const HAULERS_FLAT_JSON = path.join(DATA_DIR, 'haulers-flat.json');
const NEW_HAULERS_JSON = path.join(__dirname, 'haulers-with-descriptions.json');

// ── Load existing haulers ────────────────────────────────────────────────────
let existing = [];
if (fs.existsSync(HAULERS_JSON)) {
  existing = JSON.parse(fs.readFileSync(HAULERS_JSON, 'utf8'));
  console.log(`✓ Loaded ${existing.length} existing haulers`);
} else {
  console.warn(`⚠ No haulers.json at ${HAULERS_JSON}`);
  // Try haulers-flat.json as fallback
  if (fs.existsSync(HAULERS_FLAT_JSON)) {
    existing = JSON.parse(fs.readFileSync(HAULERS_FLAT_JSON, 'utf8'));
    console.log(`✓ Loaded ${existing.length} haulers from haulers-flat.json as fallback`);
  }
}

// ── Load new haulers ─────────────────────────────────────────────────────────
const incoming = JSON.parse(fs.readFileSync(NEW_HAULERS_JSON, 'utf8'));
console.log(`✓ Loaded ${incoming.length} new haulers with descriptions`);

// ── Dedup by slug and phone ───────────────────────────────────────────────────
const existingSlugs = new Set(existing.map(h => h.slug));
const existingPhones = new Set(
  existing.map(h => h.phone?.replace(/\D/g, '')).filter(Boolean)
);

let added = 0, updated = 0, skipped = 0;

for (const hauler of incoming) {
  const normalizedPhone = hauler.phone?.replace(/\D/g, '') || '';

  if (existingSlugs.has(hauler.slug)) {
    // Update empty descriptions on existing entries
    const idx = existing.findIndex(h => h.slug === hauler.slug);
    if (idx !== -1 && !existing[idx].description && hauler.description) {
      existing[idx].description = hauler.description;
      console.log(`  ↑ Updated desc: ${hauler.name}`);
      updated++;
    } else {
      skipped++;
    }
    continue;
  }

  if (normalizedPhone && existingPhones.has(normalizedPhone)) {
    console.log(`  ⊘ Dup phone: ${hauler.name}`);
    skipped++;
    continue;
  }

  existing.push(hauler);
  existingSlugs.add(hauler.slug);
  if (normalizedPhone) existingPhones.add(normalizedPhone);
  added++;
  console.log(`  + Added: ${hauler.name} (${hauler.city}, ${hauler.state})`);
}

console.log(`\n✓ Added ${added}, updated ${updated}, skipped ${skipped}`);
console.log(`✓ Total haulers: ${existing.length}`);

// ── Save haulers.json ─────────────────────────────────────────────────────────
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(HAULERS_JSON, JSON.stringify(existing, null, 2));
console.log(`✓ Saved ${HAULERS_JSON}`);

// ── Regenerate haulers-flat.json ──────────────────────────────────────────────
const flat = existing.map(h => ({
  name: h.name,
  slug: h.slug,
  phone: h.phone || '',
  website: h.website || '',
  city: h.city || '',
  state: h.state || '',
  zip: h.zip || '',
  serviceArea: h.serviceArea || '',
  waterType: h.waterType || '',
  truckCapacity: h.truckCapacity || '',
  isActive: h.isActive !== false,
  isVerifiedPro: h.isVerifiedPro === true,
  isClaimed: h.isClaimed === true,
  description: h.description || '',
  certification: h.certification || '',
}));

fs.writeFileSync(HAULERS_FLAT_JSON, JSON.stringify(flat, null, 2));
console.log(`✓ Saved ${HAULERS_FLAT_JSON}`);

const byState = {};
flat.forEach(h => { byState[h.state] = (byState[h.state]||0)+1; });
console.log('\nHaulers by state:', byState);
console.log('\n✅ Done! Now run:');
console.log('git add data/ && git commit -m "feat: add haulers with descriptions" && git push');
