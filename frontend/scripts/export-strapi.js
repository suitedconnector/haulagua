#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const STRAPI_URL = "https://haulagua.onrender.com";
const STRAPI_TOKEN = "bafe516e2e77bcbb469e18ef692906193b4e7c17aef0349201942c70a0128c9ad47e85a4dc42549f11ca19365d7cb4151b8ff11d3d1813421fe0477f99f222518473d6d03d5db5601e37f69c9815768f6d713f346295b0013a7e9d0ea33c7627dfaa4723e2a084b87b326b5213d426199cfcb2041e647f9f15b84d824b7358c9";
const PAGE_SIZE = 100;
const OUT_DIR = path.join(__dirname, "..", "data");

async function strapiGet(endpoint) {
  const url = `${STRAPI_URL}/api${endpoint}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.json();
}

async function fetchAll(collection, populateQuery = "") {
  let page = 1, allData = [], total = null;
  console.log(`\n📦 Fetching /${collection}...`);
  while (true) {
    const endpoint = `/${collection}?pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}${populateQuery ? "&" + populateQuery : ""}`;
    const json = await strapiGet(endpoint);
    const records = json.data ?? [];
    allData = allData.concat(records);
    if (total === null) total = json.meta?.pagination?.total ?? records.length;
    console.log(`  Page ${page}: ${records.length} records (${allData.length}/${total})`);
    if (allData.length >= total || records.length < PAGE_SIZE) break;
    page++;
  }
  console.log(`  ✅ ${allData.length} ${collection} exported`);
  return allData;
}

function writeJson(filename, data) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const filepath = path.join(OUT_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf8");
  const kb = (fs.statSync(filepath).size / 1024).toFixed(1);
  console.log(`  💾 ${filepath} (${kb} KB)`);
}

async function main() {
  console.log("🚀 HaulAgua — Strapi → Static JSON Export");
  const haulers = await fetchAll("haulers", "populate=photo");
  writeJson("haulers.json", { data: haulers });
  const locations = await fetchAll("locations", "populate=nearbyCities");
  writeJson("locations.json", { data: locations });
  console.log(`\n✅ Done! ${haulers.length} haulers, ${locations.length} locations`);
}

main().catch((err) => { console.error("❌", err.message); process.exit(1); });