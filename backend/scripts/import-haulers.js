const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const fetch = require('node-fetch');
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const STRAPI_URL = 'https://haulagua.onrender.com';
const STRAPI_TOKEN = '25c484da6b536c09e9240ff61085968458400ae229aaec0ecb6b498e0c8aa6899bcbd8eef58d1f549a4b7342140c2c4d114b369b2d79ac2078e5a28c1a60c00dc3078926e727b86a1347d455d9d74d373312e18113e4d66a7060f271724bafd80240e7d84206be1eb8973f4e40927ac94a064407b4dcc9074c07afefbb55ba98';
const CSV_PATH = path.join(__dirname, 'haulers.csv');

const csv = fs.readFileSync(CSV_PATH, 'utf8');

const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });

async function importHaulers() {
  let success = 0;
  let failed = 0;

  for (const row of data) {
    const hauler = {
      name: row['Name'],
      slug: slugify(row['Name']),
      phone: row['Phone'],
      website: row['Website'],
      address: row['Address'],
      city: row['City'],
      state: row['State'],
      zip: row['Zip'],
      hours: row['Hours'],
      plusCode: row['Plus Code'],
      ada: row['ADA']?.toLowerCase() === 'yes',
      lgbtqFriendly: row['LGBTQ+ friendly']?.toLowerCase() === 'yes',
      veteranOwned: row['Veteran Owned']?.toLowerCase() === 'yes',
      womenOwned: row['Women-owned']?.toLowerCase() === 'yes',
      isActive: true,
    };

    try {
      const res = await fetch(`${STRAPI_URL}/api/haulers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
        body: JSON.stringify({ data: hauler }),
      });

      if (res.ok) {
        console.log(`✅ Imported: ${hauler.name}`);
        success++;
      } else {
        const err = await res.json();
        console.log(`❌ Failed: ${hauler.name}`, err);
        failed++;
      }
    } catch (e) {
      console.log(`❌ Error: ${hauler.name}`, e.message);
      failed++;
    }
  }

  console.log(`\nDone! ${success} imported, ${failed} failed.`);
}

importHaulers();