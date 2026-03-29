import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

const posts = [
  {
    title: "How Much Water Does It Take to Fill a Pool?",
    slug: "how-much-water-to-fill-a-pool",
    category: "Pool Fills",
    excerpt:
      "Wondering how many gallons your pool needs — and how to get it delivered fast? Here's exactly what to expect.",
    body: `Filling a swimming pool with a garden hose can take days. A bulk water hauler can do it in hours.

**How many gallons does a pool hold?**

- Small above-ground pool (10×20 ft): ~5,000 gallons
- Average in-ground pool (16×32 ft): ~20,000–25,000 gallons
- Large in-ground pool (20×40 ft): ~40,000+ gallons

**How to calculate your pool volume**

For rectangular pools: Length × Width × Average Depth × 7.5 = gallons
For round pools: Diameter × Diameter × Average Depth × 5.9 = gallons

**What does a water hauler deliver?**

Most bulk water trucks carry 4,000–6,000 gallons per load. For a standard 20,000-gallon pool, expect 3–5 truck loads. Many haulers can coordinate multiple loads in a single day.

**How much does it cost?**

Pricing varies by region and distance, but typical rates range from $150–$400 per load. Get quotes from multiple verified haulers on Haulagua to compare.

**Tips for a smooth fill**

- Have your water source (pool) ready before the hauler arrives
- Confirm the water quality — most haulers provide potable or non-potable options
- Ask about same-day availability during peak season`,
  },
  {
    title: "Construction Site Water Delivery: What You Need to Know",
    slug: "construction-site-water-delivery-guide",
    category: "Construction",
    excerpt:
      "From dust control to concrete mixing, construction sites have serious water needs. Here's how bulk water delivery works on job sites.",
    body: `Construction projects consume enormous amounts of water — and a reliable supply is critical to keeping work on schedule.

**Common construction water uses**

- Dust suppression on dirt roads and excavation sites
- Concrete and mortar mixing
- Compaction of soil and base materials
- Hydrostatic testing of pipes and tanks
- Worker sanitation and washdown

**How bulk water delivery works for construction**

A water hauler will bring a tanker truck directly to your job site. Trucks typically hold 4,000–10,000 gallons. For large sites, haulers can coordinate scheduled deliveries throughout the day or week.

**What to tell your hauler**

- Site access: Can a large truck reach the delivery point?
- Daily volume needs: How many gallons per day?
- Water quality: Potable or non-potable?
- Schedule: One-time fill or recurring delivery?

**Texas and Arizona construction water**

In hot, arid climates like Texas and Arizona, dust control is a major cost. Municipalities often restrict tap water use for non-potable purposes — making bulk delivery essential.

Find verified water haulers for your job site on Haulagua.`,
  },
  {
    title: "Rural Property Water Delivery: A Complete Guide",
    slug: "rural-property-water-delivery-guide",
    category: "Rural & Agricultural",
    excerpt:
      "No municipal water connection? No problem. Here's everything rural property owners need to know about bulk water delivery.",
    body: `Millions of rural properties in Texas and Arizona rely on hauled water as their primary — or only — water source. If you're new to off-grid or rural living, here's what you need to know.

**Who needs hauled water?**

- Properties without a municipal water connection
- Homes with a dry or unreliable well
- Agricultural operations needing supplemental water
- Ranches filling stock tanks and livestock water systems
- New construction before utility hookup

**Types of storage for hauled water**

- Cisterns: Underground or above-ground tanks, typically 500–10,000 gallons
- Stock tanks: For livestock and agricultural use
- Intermediate bulk containers (IBCs): Portable 275–330 gallon totes
- Above-ground poly tanks: Common for residential use

**How often will you need a delivery?**

Average household water use is about 80–100 gallons per person per day. A family of four uses roughly 10,000–12,000 gallons per month. With a 5,000-gallon cistern, you'd need delivery every 2 weeks.

**Finding the right hauler**

Look for haulers who:
- Are licensed and insured in your state
- Carry potable (drinking) water if needed
- Offer recurring delivery schedules
- Serve your specific county or region

Use Haulagua to search verified haulers in Texas and Arizona who specialize in rural water delivery.`,
  },
];

async function seedBlog() {
  if (!STRAPI_TOKEN) {
    console.error("STRAPI_API_TOKEN is not set. Add it to your .env file.");
    process.exit(1);
  }

  console.log(`Seeding ${posts.length} blog posts to ${STRAPI_URL}...\n`);

  for (const post of posts) {
    try {
      const res = await fetch(`${STRAPI_URL}/api/blog-posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
        body: JSON.stringify({ data: post }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`✗ Failed to create "${post.title}": ${res.status} ${err}`);
        continue;
      }

      const result = await res.json();
      console.log(`✓ Created: "${post.title}" (id: ${result.data?.id})`);
    } catch (err) {
      console.error(`✗ Error creating "${post.title}":`, err);
    }
  }

  console.log("\nDone.");
}

seedBlog();
