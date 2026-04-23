#!/usr/bin/env node
/**
 * Haulagua Strapi Seed Script
 * Source: TCEQ Licensed Water Hauler List (Updated November 18, 2025)
 * 
 * Usage:
 *   STRAPI_URL=http://localhost:1337 STRAPI_TOKEN=your_token node seed-texas-haulers.js
 * 
 * Or for Railway:
 *   STRAPI_URL=https://your-app.railway.app STRAPI_TOKEN=your_token node seed-texas-haulers.js
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

if (!STRAPI_TOKEN) {
  console.error('❌ STRAPI_TOKEN env var required');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${STRAPI_TOKEN}`,
};

async function post(endpoint, data) {
  const res = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ data }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`POST ${endpoint} failed: ${res.status} ${err}`);
  }
  return res.json();
}

// ─── LOCATIONS ──────────────────────────────────────────────────────────────
const locations = [
  {
    "city": "Huntsville",
    "state": "TX",
    "slug": "huntsville",
    "county": "Anderson",
    "metaTitle": "Bulk Water Delivery in Huntsville, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Huntsville, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "College Station",
    "state": "TX",
    "slug": "college-station",
    "county": "Atascosa",
    "metaTitle": "Bulk Water Delivery in College Station, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in College Station, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Austin",
    "state": "TX",
    "slug": "austin",
    "county": "Bandera",
    "metaTitle": "Bulk Water Delivery in Austin, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Austin, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "San Antonio",
    "state": "TX",
    "slug": "san-antonio",
    "county": "Bexar",
    "metaTitle": "Bulk Water Delivery in San Antonio, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in San Antonio, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Blanco",
    "state": "TX",
    "slug": "blanco",
    "county": "Blanco",
    "metaTitle": "Bulk Water Delivery in Blanco, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Blanco, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Freeport",
    "state": "TX",
    "slug": "freeport",
    "county": "Brazoria",
    "metaTitle": "Bulk Water Delivery in Freeport, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Freeport, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Spicewood",
    "state": "TX",
    "slug": "spicewood",
    "county": "Burnet",
    "metaTitle": "Bulk Water Delivery in Spicewood, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Spicewood, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Marble Falls",
    "state": "TX",
    "slug": "marble-falls",
    "county": "Burnet",
    "metaTitle": "Bulk Water Delivery in Marble Falls, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Marble Falls, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Burnet",
    "state": "TX",
    "slug": "burnet",
    "county": "Burnet",
    "metaTitle": "Bulk Water Delivery in Burnet, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Burnet, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Brownsville",
    "state": "TX",
    "slug": "brownsville",
    "county": "Cameron",
    "metaTitle": "Bulk Water Delivery in Brownsville, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Brownsville, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Canyon Lake",
    "state": "TX",
    "slug": "canyon-lake",
    "county": "Comal",
    "metaTitle": "Bulk Water Delivery in Canyon Lake, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Canyon Lake, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Dimmitt",
    "state": "TX",
    "slug": "dimmitt",
    "county": "Dallam",
    "metaTitle": "Bulk Water Delivery in Dimmitt, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Dimmitt, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Dallas",
    "state": "TX",
    "slug": "dallas",
    "county": "Dallas",
    "metaTitle": "Bulk Water Delivery in Dallas, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Dallas, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Lavernia",
    "state": "TX",
    "slug": "lavernia",
    "county": "Dimmit",
    "metaTitle": "Bulk Water Delivery in Lavernia, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Lavernia, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Midland",
    "state": "TX",
    "slug": "midland",
    "county": "Ector",
    "metaTitle": "Bulk Water Delivery in Midland, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Midland, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Cleburne",
    "state": "TX",
    "slug": "cleburne",
    "county": "Ector",
    "metaTitle": "Bulk Water Delivery in Cleburne, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Cleburne, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "El Paso",
    "state": "TX",
    "slug": "el-paso",
    "county": "El Paso",
    "metaTitle": "Bulk Water Delivery in El Paso, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in El Paso, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Houston",
    "state": "TX",
    "slug": "houston",
    "county": "Harris",
    "metaTitle": "Bulk Water Delivery in Houston, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Houston, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Dripping Springs",
    "state": "TX",
    "slug": "dripping-springs",
    "county": "Hays",
    "metaTitle": "Bulk Water Delivery in Dripping Springs, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Dripping Springs, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Buda",
    "state": "TX",
    "slug": "buda",
    "county": "Hays",
    "metaTitle": "Bulk Water Delivery in Buda, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Buda, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Jasper",
    "state": "TX",
    "slug": "jasper",
    "county": "Jasper",
    "metaTitle": "Bulk Water Delivery in Jasper, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Jasper, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Gainesville",
    "state": "TX",
    "slug": "gainesville",
    "county": "Karnes",
    "metaTitle": "Bulk Water Delivery in Gainesville, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Gainesville, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Three Rivers",
    "state": "TX",
    "slug": "three-rivers",
    "county": "Live Oak",
    "metaTitle": "Bulk Water Delivery in Three Rivers, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Three Rivers, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Brady",
    "state": "TX",
    "slug": "brady",
    "county": "McCulloch",
    "metaTitle": "Bulk Water Delivery in Brady, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Brady, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Odessa",
    "state": "TX",
    "slug": "odessa",
    "county": "Midland",
    "metaTitle": "Bulk Water Delivery in Odessa, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Odessa, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Pecos",
    "state": "TX",
    "slug": "pecos",
    "county": "Reeves",
    "metaTitle": "Bulk Water Delivery in Pecos, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Pecos, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Fort Worth",
    "state": "TX",
    "slug": "fort-worth",
    "county": "Tarrant",
    "metaTitle": "Bulk Water Delivery in Fort Worth, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Fort Worth, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Keller",
    "state": "TX",
    "slug": "keller",
    "county": "Tarrant",
    "metaTitle": "Bulk Water Delivery in Keller, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Keller, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "San Angelo",
    "state": "TX",
    "slug": "san-angelo",
    "county": "Tom Green",
    "metaTitle": "Bulk Water Delivery in San Angelo, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in San Angelo, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Cedar Park",
    "state": "TX",
    "slug": "cedar-park",
    "county": "Travis",
    "metaTitle": "Bulk Water Delivery in Cedar Park, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Cedar Park, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Kyle",
    "state": "TX",
    "slug": "kyle",
    "county": "Travis",
    "metaTitle": "Bulk Water Delivery in Kyle, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Kyle, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Lufkin",
    "state": "TX",
    "slug": "lufkin",
    "county": "Ward",
    "metaTitle": "Bulk Water Delivery in Lufkin, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Lufkin, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Laredo",
    "state": "TX",
    "slug": "laredo",
    "county": "Webb",
    "metaTitle": "Bulk Water Delivery in Laredo, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Laredo, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Rome",
    "state": "TX",
    "slug": "rome",
    "county": "Webb",
    "metaTitle": "Bulk Water Delivery in Rome, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Rome, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Georgetown",
    "state": "TX",
    "slug": "georgetown",
    "county": "Williamson",
    "metaTitle": "Bulk Water Delivery in Georgetown, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Georgetown, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "city": "Decatur",
    "state": "TX",
    "slug": "decatur",
    "county": "Wise",
    "metaTitle": "Bulk Water Delivery in Decatur, TX | Haulagua",
    "metaDescription": "Find licensed bulk water haulers in Decatur, TX. Compare providers for pool fills, potable water, construction & more.",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  }
];

// ─── HAULERS ────────────────────────────────────────────────────────────────
const haulers = [
  {
    "name": "TDCJ Water Hauler",
    "slug": "tdcj-water-hauler",
    "phone": "936-437-7247",
    "address": "PO Box 4011",
    "city": "Huntsville",
    "state": "TX",
    "zip": "77342",
    "county": "Anderson",
    "pws_id": "TX0010062",
    "contact_name": "Ronald Hudson",
    "service_types": [
      "potable"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Willda Beast Water Hauler",
    "slug": "willda-beast-water-hauler",
    "phone": "979-268-6760",
    "address": "PO Box 12250",
    "city": "College Station",
    "state": "TX",
    "zip": "77842",
    "county": "Atascosa",
    "pws_id": "TX0070035",
    "contact_name": "James Cody Evans",
    "service_types": [
      "potable"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "TWU Water Hauler San Antonio",
    "slug": "twu-water-hauler-san-antonio",
    "phone": "737-376-2534",
    "address": "PO Box 140164",
    "city": "Austin",
    "state": "TX",
    "zip": "78714",
    "county": "Bandera",
    "pws_id": "TX0100120",
    "contact_name": "Chuck Barry",
    "service_types": [
      "potable"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "TDCJ Water Hauler",
    "slug": "tdcj-water-hauler",
    "phone": "936-437-7247",
    "address": "PO Box 4011",
    "city": "Huntsville",
    "state": "TX",
    "zip": "77342",
    "county": "Bee",
    "pws_id": "TX0130070",
    "contact_name": "Jason Pierce",
    "service_types": [
      "potable"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "HEB Emergency Hauling",
    "slug": "heb-emergency-hauling",
    "phone": "210-938-8232",
    "address": "646 S Main Ave",
    "city": "San Antonio",
    "state": "TX",
    "zip": "78204",
    "county": "Bexar",
    "pws_id": "TX0150555",
    "contact_name": "Abel Martinez",
    "service_types": [
      "emergency",
      "potable"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "WaterFleet Water Hauler",
    "slug": "waterfleet-water-hauler",
    "phone": "855-744-5222",
    "address": "5110 SE Loop 410",
    "city": "San Antonio",
    "state": "TX",
    "zip": "78222",
    "county": "Bexar",
    "pws_id": "TX0150590",
    "contact_name": "Alan Pyle",
    "service_types": [
      "potable",
      "construction"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Immels Dairy Service",
    "slug": "immels-dairy-service",
    "phone": "830-833-5606",
    "address": "PO Box 775",
    "city": "Blanco",
    "state": "TX",
    "zip": "78606",
    "county": "Blanco",
    "pws_id": "TX0160032",
    "contact_name": "Troy Immel",
    "service_types": [
      "agricultural"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Sierra Bulk Water",
    "slug": "sierra-bulk-water",
    "phone": "512-461-3878",
    "address": "831 River Bend Dr",
    "city": "Blanco",
    "state": "TX",
    "zip": "78606",
    "county": "Blanco",
    "pws_id": "TX0160048",
    "contact_name": "Shane Schmidt",
    "service_types": [
      "potable",
      "pool"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Granberg Bulk Water Service",
    "slug": "granberg-bulk-water-service",
    "phone": "830-385-4195",
    "address": "198 Sunset Rdg",
    "city": "Blanco",
    "state": "TX",
    "zip": "78606",
    "county": "Blanco",
    "pws_id": "TX0160053",
    "contact_name": "Lisa Granberg",
    "service_types": [
      "potable"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "TDCJ Water Hauler",
    "slug": "tdcj-water-hauler",
    "phone": "936-437-7247",
    "address": "PO Box 4011",
    "city": "Huntsville",
    "state": "TX",
    "zip": "77342",
    "county": "Brazoria",
    "pws_id": "TX0200688",
    "contact_name": "Jason Pierce",
    "service_types": [
      "potable"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Jenkins Industries Water Hauler",
    "slug": "jenkins-industries-water-hauler",
    "phone": "979-239-4267",
    "address": "3015 County Rd 400",
    "city": "Freeport",
    "state": "TX",
    "zip": "77541",
    "county": "Brazoria",
    "pws_id": "TX0200757",
    "contact_name": "Bonner Jenkins",
    "service_types": [
      "potable",
      "construction"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Lone Star Bulk Water Hauler",
    "slug": "lone-star-bulk-water-hauler",
    "phone": "512-588-0246",
    "address": "115 Vera Dr",
    "city": "Spicewood",
    "state": "TX",
    "zip": "78669",
    "county": "Burnet",
    "pws_id": "TX0270151",
    "contact_name": "Samuel Castillo Ponce",
    "service_types": [
      "potable",
      "pool"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Frontier Bulk Water",
    "slug": "frontier-bulk-water",
    "phone": "830-385-7000",
    "address": "PO Box 1348",
    "city": "Marble Falls",
    "state": "TX",
    "zip": "78654",
    "county": "Burnet",
    "pws_id": "TX0270159",
    "contact_name": "Crockett Savage",
    "service_types": [
      "potable",
      "agricultural"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Consolidated Water Bostic Water Hauler",
    "slug": "consolidated-water-bostic-water-hauler",
    "phone": "512-756-2100",
    "address": "PO Box 1367",
    "city": "Burnet",
    "state": "TX",
    "zip": "78611",
    "county": "Burnet",
    "pws_id": "TX0270161",
    "contact_name": "Chris Bostic",
    "service_types": [
      "potable"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Drip Drops Bulk Water",
    "slug": "drip-drops-bulk-water",
    "phone": "830-220-9059",
    "address": "143 Crest Dr",
    "city": "Spicewood",
    "state": "TX",
    "zip": "78669",
    "county": "Burnet",
    "pws_id": "TX0270175",
    "contact_name": "Hector Flores Jr",
    "service_types": [
      "potable",
      "pool"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Brownsville Public Water Hauler",
    "slug": "brownsville-public-water-hauler",
    "phone": "956-983-6709",
    "address": "PO Box 3270",
    "city": "Brownsville",
    "state": "TX",
    "zip": "78523",
    "county": "Cameron",
    "pws_id": "TX0310153",
    "contact_name": "Marilyn Gilbert",
    "service_types": [
      "potable",
      "emergency"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Starbase SpaceX Water Hauler",
    "slug": "starbase-spacex-water-hauler",
    "phone": "615-955-2843",
    "address": "1 Rocket Rd",
    "city": "Brownsville",
    "state": "TX",
    "zip": "78521",
    "county": "Cameron",
    "pws_id": "TX0310164",
    "contact_name": "Phillip Catanach",
    "service_types": [
      "construction",
      "potable"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Aqua Wheels",
    "slug": "aqua-wheels",
    "phone": "512-800-5256",
    "address": "1667 Hallmark",
    "city": "Canyon Lake",
    "state": "TX",
    "zip": "78133",
    "county": "Comal",
    "pws_id": "TX0460301",
    "contact_name": "Toby Triesch",
    "service_types": [
      "pool",
      "potable"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Cross Integrated Transport",
    "slug": "cross-integrated-transport",
    "phone": "806-478-1435",
    "address": "PO Box 1023",
    "city": "Dimmitt",
    "state": "TX",
    "zip": "79027",
    "county": "Dallam",
    "pws_id": "TX0560021",
    "contact_name": "Emilio Fernandez",
    "service_types": [
      "potable",
      "agricultural"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "BTB Dallas Mountain Creek Hauling",
    "slug": "btb-dallas-mountain-creek-hauling",
    "phone": "207-280-4352",
    "address": "4718 Mountain Creek Pkwy",
    "city": "Dallas",
    "state": "TX",
    "zip": "75236",
    "county": "Dallas",
    "pws_id": "TX0570188",
    "contact_name": "Samuel Gordon",
    "service_types": [
      "potable",
      "construction"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Atlas Base Camp Equipment & Logistics",
    "slug": "atlas-base-camp-equipment-logistics",
    "phone": "210-727-4790",
    "address": "14414 US Highway 87 W",
    "city": "Lavernia",
    "state": "TX",
    "zip": "78121",
    "county": "Dimmit",
    "pws_id": "TX0640064",
    "contact_name": "Brad Smith",
    "service_types": [
      "construction",
      "oilgas"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Ken's Satellite and Potable Water Hauler",
    "slug": "ken-s-satellite-and-potable-water-hauler",
    "phone": "432-528-8888",
    "address": "1900 Fringewood Dr",
    "city": "Midland",
    "state": "TX",
    "zip": "79707",
    "county": "Ector",
    "pws_id": "TX0680233",
    "contact_name": "Beverly Couch",
    "service_types": [
      "potable",
      "oilgas"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Provisions Fleet Management",
    "slug": "provisions-fleet-management",
    "phone": "817-825-1254",
    "address": "3125 County Road 805B",
    "city": "Cleburne",
    "state": "TX",
    "zip": "76031",
    "county": "Ector",
    "pws_id": "TX0680239",
    "contact_name": "Lowell Keeney",
    "service_types": [
      "potable",
      "construction"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "AHG Water Hauler",
    "slug": "ahg-water-hauler",
    "phone": "512-410-1490",
    "address": "9430 Research Blvd Bldg 4",
    "city": "Austin",
    "state": "TX",
    "zip": "78759",
    "county": "Ector",
    "pws_id": "TX0680248",
    "contact_name": "Jason Aymami",
    "service_types": [
      "potable",
      "oilgas"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Lujan Trucking",
    "slug": "lujan-trucking",
    "phone": "915-859-8187",
    "address": "10650 Socorro Rd",
    "city": "El Paso",
    "state": "TX",
    "zip": "79927",
    "county": "El Paso",
    "pws_id": "TX0710104",
    "contact_name": "Gilbert Lujan",
    "service_types": [
      "potable",
      "construction"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "El Paso Water Utilities Water Hauling",
    "slug": "el-paso-water-utilities-water-hauling",
    "phone": "915-594-5595",
    "address": "PO Box 511",
    "city": "El Paso",
    "state": "TX",
    "zip": "79961",
    "county": "El Paso",
    "pws_id": "TX0710210",
    "contact_name": "John Balliew",
    "service_types": [
      "potable",
      "emergency"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "J & A Water Hauling Service",
    "slug": "j-a-water-hauling-service",
    "phone": "915-252-8052",
    "address": "14600 Buffalo Bill Dr",
    "city": "El Paso",
    "state": "TX",
    "zip": "79938",
    "county": "El Paso",
    "pws_id": "TX0710214",
    "contact_name": "Alfredo Lopez",
    "service_types": [
      "potable",
      "agricultural"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "TWU Water Hauler Pottsboro",
    "slug": "twu-water-hauler-pottsboro",
    "phone": "737-376-2534",
    "address": "PO Box 140164",
    "city": "Austin",
    "state": "TX",
    "zip": "78714",
    "county": "Grayson",
    "pws_id": "TX0910154",
    "contact_name": "Chuck Barry",
    "service_types": [
      "potable"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "H2Eco Bulk Water Hauler",
    "slug": "h2eco-bulk-water-hauler",
    "phone": "713-812-8400",
    "address": "16310 Aldine Westfield Rd",
    "city": "Houston",
    "state": "TX",
    "zip": "77032",
    "county": "Harris",
    "pws_id": "TX1013631",
    "contact_name": "Joseph Devine",
    "service_types": [
      "potable",
      "construction",
      "pool"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Sun Coast Resources",
    "slug": "sun-coast-resources",
    "phone": "713-844-9600",
    "address": "6405 Cavalcade St",
    "city": "Houston",
    "state": "TX",
    "zip": "77026",
    "county": "Harris",
    "pws_id": "TX1013667",
    "contact_name": "Kathy Lehne",
    "service_types": [
      "oilgas",
      "construction"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "BTB Pasadena Hauling Operations",
    "slug": "btb-pasadena-hauling-operations",
    "phone": "207-280-4352",
    "address": "4718 Mountain Creek Pkwy",
    "city": "Dallas",
    "state": "TX",
    "zip": "75236",
    "county": "Harris",
    "pws_id": "TX1013805",
    "contact_name": "Samuel Gordon",
    "service_types": [
      "potable",
      "construction"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "South Central Water Hauler",
    "slug": "south-central-water-hauler",
    "phone": "806-995-3547",
    "address": "4621 Gasmer Dr",
    "city": "Houston",
    "state": "TX",
    "zip": "77035",
    "county": "Harris",
    "pws_id": "TX1013865",
    "contact_name": "James Davis",
    "service_types": [
      "potable"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Reynolds Nationwide Water Tank Trailers",
    "slug": "reynolds-nationwide-water-tank-trailers",
    "phone": "210-648-7770",
    "address": "8755 US Highway 87 E",
    "city": "San Antonio",
    "state": "TX",
    "zip": "78263",
    "county": "Harris",
    "pws_id": "TX1013868",
    "contact_name": "Dennis Reynolds",
    "service_types": [
      "potable",
      "events",
      "pool"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "H2O2U Water Delivery",
    "slug": "h2o2u-water-delivery",
    "phone": "512-695-5204",
    "address": "911 W Highway 290",
    "city": "Dripping Springs",
    "state": "TX",
    "zip": "78620",
    "county": "Hays",
    "pws_id": "TX1050164",
    "contact_name": "Britton Hughes",
    "service_types": [
      "potable",
      "pool"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Texas Bulk Water",
    "slug": "texas-bulk-water",
    "phone": "512-644-1015",
    "address": "PO Box 146",
    "city": "Dripping Springs",
    "state": "TX",
    "zip": "78620",
    "county": "Hays",
    "pws_id": "TX1050174",
    "contact_name": "James Mock",
    "service_types": [
      "potable",
      "pool",
      "agricultural"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Pure Class Water Hauling",
    "slug": "pure-class-water-hauling",
    "phone": "830-777-0707",
    "address": "PO Box 577",
    "city": "Dripping Springs",
    "state": "TX",
    "zip": "78620",
    "county": "Hays",
    "pws_id": "TX1050219",
    "contact_name": "Blake Dannhaus",
    "service_types": [
      "potable",
      "pool"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Oasis Water Delivery",
    "slug": "oasis-water-delivery",
    "phone": "737-305-8520",
    "address": "171 Wildcat Draw",
    "city": "Buda",
    "state": "TX",
    "zip": "78610",
    "county": "Hays",
    "pws_id": "TX1050235",
    "contact_name": "Wade Sanford",
    "service_types": [
      "potable",
      "pool"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Hamilton Pool Bulk Water",
    "slug": "hamilton-pool-bulk-water",
    "phone": "512-676-7531",
    "address": "PO Box 1736",
    "city": "Dripping Springs",
    "state": "TX",
    "zip": "78620",
    "county": "Hays",
    "pws_id": "TX1050240",
    "contact_name": "Jody Shahdad",
    "service_types": [
      "pool",
      "potable"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Aqua Texas Hauler Granbury",
    "slug": "aqua-texas-hauler-granbury",
    "phone": "512-990-4400",
    "address": "1106 Clayton Ln",
    "city": "Austin",
    "state": "TX",
    "zip": "78723",
    "county": "Hood",
    "pws_id": "TX1110135",
    "contact_name": "Scot Foltz",
    "service_types": [
      "potable",
      "pool"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Buck Springs Bottled Water Company",
    "slug": "buck-springs-bottled-water-company",
    "phone": "409-384-4701",
    "address": "4829 US Highway 96 N",
    "city": "Jasper",
    "state": "TX",
    "zip": "75951",
    "county": "Jasper",
    "pws_id": "TX1210061",
    "contact_name": "Clark Shofner",
    "service_types": [
      "potable"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "WaterFleet Water Hauler",
    "slug": "waterfleet-water-hauler",
    "phone": "855-744-5222",
    "address": "5110 SE Loop 410",
    "city": "San Antonio",
    "state": "TX",
    "zip": "78222",
    "county": "Jefferson",
    "pws_id": "TX1230112",
    "contact_name": "Alan Pyle",
    "service_types": [
      "potable",
      "construction"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Peak Rentals Kenedy Hauler",
    "slug": "peak-rentals-kenedy-hauler",
    "phone": "940-612-4223",
    "address": "PO Box 340",
    "city": "Gainesville",
    "state": "TX",
    "zip": "76241",
    "county": "Karnes",
    "pws_id": "TX1280020",
    "contact_name": "Patrick Anderle",
    "service_types": [
      "oilgas",
      "construction"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "F & H Water Service",
    "slug": "f-h-water-service",
    "phone": "361-318-9614",
    "address": "PO Box 724",
    "city": "Three Rivers",
    "state": "TX",
    "zip": "78071",
    "county": "Live Oak",
    "pws_id": "TX1490033",
    "contact_name": "Frank Colle",
    "service_types": [
      "potable",
      "agricultural"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Hanna Water Hauler",
    "slug": "hanna-water-hauler",
    "phone": "325-456-4882",
    "address": "3425 Menard Hwy",
    "city": "Brady",
    "state": "TX",
    "zip": "76825",
    "county": "McCulloch",
    "pws_id": "TX1540021",
    "contact_name": "Jeff Hanna",
    "service_types": [
      "potable",
      "agricultural"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Water Tech",
    "slug": "water-tech",
    "phone": "432-272-1001",
    "address": "PO Box 14077",
    "city": "Odessa",
    "state": "TX",
    "zip": "79768",
    "county": "Midland",
    "pws_id": "TX1650105",
    "contact_name": "Tony Blakely",
    "service_types": [
      "oilgas",
      "potable"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Water Runner",
    "slug": "water-runner",
    "phone": "319-759-8702",
    "address": "11906 Jordy Rd",
    "city": "Midland",
    "state": "TX",
    "zip": "79707",
    "county": "Midland",
    "pws_id": "TX1650113",
    "contact_name": "Nathan Taylor",
    "service_types": [
      "oilgas",
      "potable"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Stallion Oilfield Services Water Hauler",
    "slug": "stallion-oilfield-services-water-hauler",
    "phone": "713-528-5544",
    "address": "950 Corbindale Rd",
    "city": "Houston",
    "state": "TX",
    "zip": "77024",
    "county": "Midland",
    "pws_id": "TX1650189",
    "contact_name": "David Mannon",
    "service_types": [
      "oilgas",
      "construction"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Water Works Field Services",
    "slug": "water-works-field-services",
    "phone": "432-445-3306",
    "address": "2425 Stafford Blvd",
    "city": "Pecos",
    "state": "TX",
    "zip": "79772",
    "county": "Reeves",
    "pws_id": "TX1950034",
    "contact_name": "James Ivy",
    "service_types": [
      "oilgas",
      "construction",
      "potable"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "City of Fort Worth Water Haulers",
    "slug": "city-of-fort-worth-water-haulers",
    "phone": "817-392-6118",
    "address": "100 Fort Worth Trl",
    "city": "Fort Worth",
    "state": "TX",
    "zip": "76102",
    "county": "Tarrant",
    "pws_id": "TX2200370",
    "contact_name": "Mattie Parker",
    "service_types": [
      "potable",
      "emergency"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Aqua Texas Hauler Fort Worth",
    "slug": "aqua-texas-hauler-fort-worth",
    "phone": "512-990-4400",
    "address": "1106 Clayton Ln",
    "city": "Austin",
    "state": "TX",
    "zip": "78723",
    "county": "Tarrant",
    "pws_id": "TX2200374",
    "contact_name": "Scot Foltz",
    "service_types": [
      "potable",
      "pool",
      "construction"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Samantha Springs Water Hauler",
    "slug": "samantha-springs-water-hauler",
    "phone": "817-554-8800",
    "address": "712 N Main St",
    "city": "Keller",
    "state": "TX",
    "zip": "76248",
    "county": "Tarrant",
    "pws_id": "TX2200386",
    "contact_name": "Joseph McCombs",
    "service_types": [
      "potable",
      "pool"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Turquoise Water",
    "slug": "turquoise-water",
    "phone": "325-658-3899",
    "address": "PO Box 61874",
    "city": "San Angelo",
    "state": "TX",
    "zip": "76906",
    "county": "Tom Green",
    "pws_id": "TX2260033",
    "contact_name": "Wayne Cowen",
    "service_types": [
      "potable",
      "pool"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "J and L Water Wagon",
    "slug": "j-and-l-water-wagon",
    "phone": "325-245-5454",
    "address": "121 W 25th St",
    "city": "San Angelo",
    "state": "TX",
    "zip": "76903",
    "county": "Tom Green",
    "pws_id": "TX2260091",
    "contact_name": "Jeremy Kekoa",
    "service_types": [
      "potable",
      "agricultural"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Concho Rural Water Hauling",
    "slug": "concho-rural-water-hauling",
    "phone": "325-658-2961",
    "address": "8174 US Highway 87 N",
    "city": "San Angelo",
    "state": "TX",
    "zip": "76901",
    "county": "Tom Green",
    "pws_id": "TX2260102",
    "contact_name": "Benjamin Wiese",
    "service_types": [
      "potable",
      "agricultural"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Original Services Water Hauler",
    "slug": "original-services-water-hauler",
    "phone": "325-227-6749",
    "address": "PO Box 62703",
    "city": "San Angelo",
    "state": "TX",
    "zip": "76906",
    "county": "Tom Green",
    "pws_id": "TX2260114",
    "contact_name": "Zachary Drennan",
    "service_types": [
      "potable",
      "construction"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Water Boy",
    "slug": "water-boy",
    "phone": "512-868-7355",
    "address": "PO Box 1897",
    "city": "Cedar Park",
    "state": "TX",
    "zip": "78630",
    "county": "Travis",
    "pws_id": "TX2270372",
    "contact_name": "Stephany Moore",
    "service_types": [
      "potable",
      "pool"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Tejas Water Haulers",
    "slug": "tejas-water-haulers",
    "phone": "713-812-8400",
    "address": "16310 Aldine Westfield Rd",
    "city": "Houston",
    "state": "TX",
    "zip": "77032",
    "county": "Travis",
    "pws_id": "TX2270400",
    "contact_name": "Joseph Devine",
    "service_types": [
      "potable",
      "construction"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Swift Bulk Water",
    "slug": "swift-bulk-water",
    "phone": "512-917-8006",
    "address": "9320 Bernoulli Dr",
    "city": "Austin",
    "state": "TX",
    "zip": "78748",
    "county": "Travis",
    "pws_id": "TX2270423",
    "contact_name": "Brian Wittmuss",
    "service_types": [
      "potable",
      "pool",
      "events"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "City of Austin Water Hauler",
    "slug": "city-of-austin-water-hauler",
    "phone": "512-972-0109",
    "address": "PO Box 1088",
    "city": "Austin",
    "state": "TX",
    "zip": "78767",
    "county": "Travis",
    "pws_id": "TX2270434",
    "contact_name": "Shay Roalson",
    "service_types": [
      "potable",
      "emergency"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Austin Bulk Water",
    "slug": "austin-bulk-water",
    "phone": "512-280-4037",
    "address": "PO Box 1570",
    "city": "Kyle",
    "state": "TX",
    "zip": "78640",
    "county": "Travis",
    "pws_id": "TX2270436",
    "contact_name": "Chandler Atkins",
    "service_types": [
      "potable",
      "pool",
      "construction"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Ripple 2.0 Bulk Water Delivery",
    "slug": "ripple-2-0-bulk-water-delivery",
    "phone": "512-784-7376",
    "address": "4227 Tyx Trl",
    "city": "Spicewood",
    "state": "TX",
    "zip": "78669",
    "county": "Travis",
    "pws_id": "TX2270451",
    "contact_name": "Mark Mendoza",
    "service_types": [
      "potable",
      "pool"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Stallion Oilfield Services Water Hauler",
    "slug": "stallion-oilfield-services-water-hauler",
    "phone": "713-275-4122",
    "address": "950 Corbindale Rd",
    "city": "Houston",
    "state": "TX",
    "zip": "77024",
    "county": "Victoria",
    "pws_id": "TX2350078",
    "contact_name": "Steve Rayburn",
    "service_types": [
      "oilgas",
      "construction"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "TDCJ Water Hauler",
    "slug": "tdcj-water-hauler",
    "phone": "936-437-7247",
    "address": "PO Box 4011",
    "city": "Huntsville",
    "state": "TX",
    "zip": "77342",
    "county": "Walker",
    "pws_id": "TX2360087",
    "contact_name": "Jason Pierce",
    "service_types": [
      "potable"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Winco Trucking Water Hauler",
    "slug": "winco-trucking-water-hauler",
    "phone": "936-632-6033",
    "address": "203 S 1st St",
    "city": "Lufkin",
    "state": "TX",
    "zip": "75901",
    "county": "Ward",
    "pws_id": "TX2380029",
    "contact_name": "Stephen Greak",
    "service_types": [
      "potable",
      "construction"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Webb County Water Hauler",
    "slug": "webb-county-water-hauler",
    "phone": "956-523-4600",
    "address": "1000 Houston St",
    "city": "Laredo",
    "state": "TX",
    "zip": "78040",
    "county": "Webb",
    "pws_id": "TX2400037",
    "contact_name": "Tano Tijerina",
    "service_types": [
      "potable",
      "emergency"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "City of Laredo Water Hauler",
    "slug": "city-of-laredo-water-hauler",
    "phone": "956-791-7300",
    "address": "1110 Houston St",
    "city": "Laredo",
    "state": "TX",
    "zip": "78040",
    "county": "Webb",
    "pws_id": "TX2400044",
    "contact_name": "Pete Saenz",
    "service_types": [
      "potable",
      "emergency"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Deployed Resources Water Hauler",
    "slug": "deployed-resources-water-hauler",
    "phone": "225-819-7172",
    "address": "164 McPike Rd",
    "city": "Rome",
    "state": "TX",
    "zip": "78040",
    "county": "Webb",
    "pws_id": "TX2400050",
    "contact_name": "Andrew Roberts",
    "service_types": [
      "emergency",
      "potable"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "Live Oak Water Delivery",
    "slug": "live-oak-water-delivery",
    "phone": "512-200-4355",
    "address": "204 County Road 166",
    "city": "Georgetown",
    "state": "TX",
    "zip": "78626",
    "county": "Williamson",
    "pws_id": "TX2460176",
    "contact_name": "Daniel Amon",
    "service_types": [
      "potable",
      "pool",
      "agricultural"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  },
  {
    "name": "A & V Water Hauling",
    "slug": "a-v-water-hauling",
    "phone": "940-281-1315",
    "address": "PO Box 1504",
    "city": "Decatur",
    "state": "TX",
    "zip": "76234",
    "county": "Wise",
    "pws_id": "TX2490081",
    "contact_name": "Devan Pharis",
    "service_types": [
      "potable",
      "agricultural"
    ],
    "licensed": true,
    "license_source": "TCEQ Licensed Water Hauler List (Nov 2025)",
    "publishedAt": "2025-11-18T00:00:00.000Z"
  }
];

async function seed() {
  console.log('🌊 Seeding Haulagua Texas data...\n');

  // 1. Seed locations
  console.log(`📍 Creating ${locations.length} location pages...`);
  const locationMap = {};
  for (const loc of locations) {
    try {
      const result = await post('locations', loc);
      locationMap[`${loc.city}-${loc.state}`] = result.data.id;
      console.log(`  ✓ ${loc.city}, ${loc.state}`);
    } catch (e) {
      console.warn(`  ⚠ Skipped ${loc.city}: ${e.message}`);
    }
  }

  // 2. Seed haulers
  console.log(`\n🚛 Creating ${haulers.length} hauler listings...`);
  let created = 0, skipped = 0;
  for (const hauler of haulers) {
    try {
      // Link to location if exists
      const locId = locationMap[`${hauler.city}-${hauler.state}`];
      if (locId) hauler.location = locId;
      
      await post('haulers', hauler);
      console.log(`  ✓ ${hauler.name} (${hauler.county} County)`);
      created++;
    } catch (e) {
      console.warn(`  ⚠ Skipped ${hauler.name}: ${e.message}`);
      skipped++;
    }
  }

  console.log(`\n✅ Done! ${created} haulers created, ${skipped} skipped.`);
  console.log(`📍 ${Object.keys(locationMap).length} location pages created.`);
}

seed().catch(console.error);
