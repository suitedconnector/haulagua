const fs = require("fs");
const path = require("path");

const haulers = require("../data/haulers.json").data;

const fields = [
  "name","slug","phone","email","website","address","city","state","zip",
  "serviceArea","minFee","truckCapacity","hoseLength","waterType","waterSource",
  "isVerifiedPro","isActive","isClaimed","yearsInBusiness","serviceRadius",
  "truckCount","pumpType","hoseMaterial","insuranceCertificate",
  "hours","plusCode","ada","lgbtqFriendly","veteranOwned","womenOwned",
  "certification","description"
];

const header = fields.join(",");

const rows = haulers.map((h) => {
  const a = h.attributes;
  return fields.map((f) => {
    let val = a[f] ?? "";
    if (Array.isArray(val)) val = val.join("|");
    const str = String(val).replace(/"/g, '""').replace(/\n/g, " ");
    return `"${str}"`;
  }).join(",");
});

const csv = [header, ...rows].join("\n");
const out = path.join(__dirname, "output", "haulers-export.csv");
fs.mkdirSync(path.join(__dirname, "output"), { recursive: true });
fs.writeFileSync(out, csv, "utf8");
console.log(`✅ Exported ${haulers.length} haulers to ${out}`);