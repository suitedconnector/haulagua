import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HaulerCard } from "@/components/hauler-card";
import { MapPin, ArrowLeft } from "lucide-react";
import {
  STATE_NAMES,
  STATE_INTROS,
  STATE_INTRO_DEFAULT,
  fromStateSlug,
  getHaulersByState,
  groupHaulersByCity,
  getAllStatesWithCounts,
} from "@/lib/location";
import cityPhotoCache from "@/data/city-photos.json";
import { CityWave } from "@/components/city-wave";

type PageProps = { params: Promise<{ state: string }> };

// ─── Texas content ────────────────────────────────────────────────────────────

const TX_SERVICES = [
  { name: "Pool Fills", desc: "Residential and commercial pool filling, top-offs, and refills across Texas. Most haulers deliver 2,000–6,000 gallons per load." },
  { name: "Potable Water Delivery", desc: "Safe drinking water delivered to rural cisterns, holding tanks, and properties without municipal water access. Texas haulers serving the Hill Country, Permian Basin, and rural East Texas are experienced with potable-grade delivery." },
  { name: "Construction & Dust Control", desc: "Water trucks for active job sites, road building, land clearing, and dust suppression. Common across DFW, Houston, and booming Texas suburbs." },
  { name: "Agricultural & Livestock Water", desc: "Bulk water for ranches, farms, stock tanks, and irrigation. Especially in-demand during drought years across Central and West Texas." },
  { name: "Oil & Gas Operations", desc: "Frac water, drilling support, and dust control for Permian Basin and Eagle Ford Shale operations." },
  { name: "Emergency Water Delivery", desc: "Rapid response water hauling for well failures, drought emergencies, and disaster relief. Available across most Texas counties." },
  { name: "Events & Special Use", desc: "Mud bog events, outdoor festivals, and temporary water supply for off-grid construction camps." },
];

const TX_REGIONS = [
  { name: "Central Texas / Hill Country", desc: "Austin, Dripping Springs, Marble Falls, Blanco, Johnson City, Spicewood, Canyon Lake. High demand for potable water on rural properties and pool fills in the growing suburbs west of Austin." },
  { name: "West Texas / Permian Basin", desc: "Midland, Odessa, and surrounding oil country. Active market for oilfield water hauling, frac support, and dust control on remote job sites." },
  { name: "North Texas / DFW", desc: "Dallas, Fort Worth, Arlington, Carrollton, Keller. Large suburban market for pool fills and construction site water in one of the fastest-growing regions in the USA." },
  { name: "South Texas", desc: "San Antonio and surrounding areas. Mixed residential, agricultural, and commercial demand." },
  { name: "Gulf Coast / Houston", desc: "Houston and surrounding Harris County. Pool fills, construction, and emergency response in the nation's fourth-largest city." },
];

const TX_FAQS = [
  {
    q: "How much does bulk water delivery cost in Texas?",
    a: "Bulk water delivery in Texas typically costs between $150 and $500 per load, depending on the hauler, distance, water type, and volume. Potable water generally costs more than non-potable water. Most haulers have a minimum fee ranging from $150 to $300. Request quotes from multiple haulers in your area for the best rate.",
  },
  {
    q: "How many gallons does a water hauler truck hold in Texas?",
    a: "Most water hauler trucks in Texas carry between 2,000 and 6,000 gallons per load. Smaller medium-duty trucks typically hold 2,000–3,000 gallons, while full-size tanker trucks carry 4,000–6,000 gallons or more. For large jobs like filling a pool or topping off a cistern, haulers may make multiple trips.",
  },
  {
    q: "How long does it take to fill a pool with a water truck in Texas?",
    a: "A standard residential pool (10,000–20,000 gallons) typically requires 2–4 truckloads and can be filled in a few hours to one day, depending on truck size and travel time. Most Texas haulers can complete a pool fill in a single day with proper scheduling.",
  },
  {
    q: "Do Texas water haulers need a license for potable water delivery?",
    a: "Yes. Haulers delivering potable (drinking) water in Texas are required to be licensed by the Texas Commission on Environmental Quality (TCEQ). Always confirm your hauler holds a valid TCEQ potable water carrier license before accepting drinking water delivery.",
  },
  {
    q: "What areas of Texas have the most water haulers?",
    a: "The highest concentration of bulk water haulers in Texas is found in Central Texas (Austin metro, Hill Country), West Texas (Permian Basin), and the DFW metroplex. Rural counties in East, South, and Far West Texas tend to have fewer haulers, so lead times may be longer in those areas.",
  },
  {
    q: "Can I get emergency water delivery in Texas?",
    a: "Yes. Many Texas water haulers offer emergency or same-day delivery for well failures, drought conditions, fire suppression needs, and disaster response. Search for haulers in your city and call directly — most can advise on availability within minutes.",
  },
  {
    q: "What is the difference between potable and non-potable water delivery?",
    a: "Potable water is safe for human consumption — drinking, cooking, and bathing. Non-potable water is not safe to drink and is used for pool fills (chlorinated separately), dust control, irrigation, and construction. Potable delivery requires a licensed carrier and a food-grade tanker. Always specify which type you need when requesting a quote.",
  },
];

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const states = await getAllStatesWithCounts();
  return states.map(({ abbr }) => ({ state: abbr.toLowerCase() }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state } = await params;
  const abbr = fromStateSlug(state);
  const name = STATE_NAMES[state] ?? abbr;

  const title = state === "tx"
    ? "Bulk Water Delivery in Texas | Find Local Water Haulers | HaulAgua"
    : `Water Haulers in ${name} | HaulAgua`;
  const description = state === "tx"
    ? "Find bulk water haulers in Texas for pool fills, potable water delivery, construction dust control, agriculture, and emergencies. Browse verified haulers by city across all Texas regions."
    : `Find trusted bulk water haulers in ${name}. Compare verified pros for pool fills, construction, potable water and more.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://haulagua.com/water-haulers/${state}`,
      siteName: "HaulAgua",
      type: "website",
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type CityWithPhoto = {
  city: string;
  slug: string;
  count: number;
  photo: string | null;
};

export default async function StatePage({ params }: PageProps) {
  const { state } = await params;
  const abbr = fromStateSlug(state);
  const stateName = STATE_NAMES[state] ?? abbr;
  const haulers = await getHaulersByState(abbr);
  const cities = groupHaulersByCity(haulers);
  const intro = STATE_INTROS[state] ?? STATE_INTRO_DEFAULT;
  const isTX = state === "tx";

  const cache = cityPhotoCache as Record<string, string>;
  const citiesWithPhotos: CityWithPhoto[] = cities.map(({ city, slug, count }) => ({
    city,
    slug,
    count,
    photo: cache[`${city}|${abbr}`] ?? null,
  }));

  const faqSchema = isTX ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: TX_FAQS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  } : null;

  const itemListSchema = haulers.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Bulk Water Haulers in ${stateName}`,
    itemListElement: haulers.map((h, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: h.attributes.name,
      url: `https://haulagua.com/haulers/${h.attributes.slug}`,
    })),
  } : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}

      <main className="flex-1">
        {/* Hero / intro */}
        <section className="py-12 md:py-16 bg-white border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link
              href="/water-haulers"
              className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 hover:underline"
              style={{ color: "#005A9C" }}
            >
              <ArrowLeft className="h-4 w-4" />
              All States
            </Link>
            <h1
              className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold"
              style={{ color: "#005A9C" }}
            >
              Bulk Water Delivery in {stateName}
            </h1>

            {isTX ? (
              <div className="mt-4 space-y-3 text-lg text-muted-foreground max-w-2xl">
                <p>Texas is one of the largest markets for bulk water delivery in the country. From the Hill Country to the Permian Basin, water haulers serve pool fills, ranches, construction sites, and rural properties across every region of the Lone Star State.</p>
                <p>With millions of rural acres, one of the highest concentrations of private swimming pools in the nation, a booming construction industry, and active oil and gas operations, demand for reliable bulk water hauling in Texas is year-round and growing. Whether you need potable water delivered to a rural cistern outside Austin, dust control on a West Texas job site, or an emergency fill after a drought, local Texas water haulers are ready to help.</p>
              </div>
            ) : (
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{intro}</p>
            )}

            <p className="mt-3 text-sm text-muted-foreground">
              {haulers.length} hauler{haulers.length !== 1 ? "s" : ""} found in {stateName}
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-14">

          {/* Services — TX only */}
          {isTX && (
            <div>
              <h2 className="font-serif text-2xl font-semibold mb-6" style={{ color: "#005A9C" }}>
                Bulk Water Delivery Services in Texas
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TX_SERVICES.map(({ name, desc }) => (
                  <div key={name} className="rounded-xl border border-border bg-white p-5">
                    <h3 className="font-semibold text-base mb-1" style={{ color: "#005A9C" }}>{name}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* City photo grid */}
          {citiesWithPhotos.length > 0 && (
            <div>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                Browse by City
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {citiesWithPhotos.map(({ city, slug, count, photo }) => (
                  <Link
                    key={city}
                    href={`/water-haulers/${state}/${slug}`}
                    className="group rounded-xl overflow-hidden border border-border hover:shadow-md hover:border-[#005A9C]/40 transition-all bg-white"
                  >
                    <div className="relative h-40 w-full overflow-hidden">
                      {photo ? (
                        <Image
                          src={photo}
                          alt={`Bulk water delivery in ${city}, ${stateName}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: "#005A9C" }}
                        />
                      )}
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.65) 100%)" }} />
                      <CityWave className="absolute bottom-0 left-0" />
                      <div className="absolute inset-0 flex items-end justify-center pointer-events-none" style={{ paddingBottom: "16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <div style={{
                            backgroundColor: "#2d6e2d",
                            border: "4px solid white",
                            borderRadius: "6px",
                            padding: "8px 18px",
                            textAlign: "center",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                            minWidth: "160px",
                            maxWidth: "88%",
                          }}>
                            <p style={{ color: "white", fontSize: "9px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "2px" }}>
                              Welcome to
                            </p>
                            <p style={{ color: "white", fontSize: "20px", fontWeight: 800, lineHeight: 1.1, fontFamily: "Georgia, serif" }}>
                              {city}
                            </p>
                            <p style={{ color: "white", fontSize: "9px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginTop: "2px" }}>
                              {stateName}
                            </p>
                          </div>
                          <div style={{ width: "8px", height: "28px", backgroundColor: "#a0a0a0", boxShadow: "inset -2px 0 3px rgba(0,0,0,0.2)" }} />
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: "#0461AA" }}>
                      <p className="text-sm font-bold text-white">
                        {count} hauler{count !== 1 ? "s" : ""}
                      </p>
                      <i className="fa-solid fa-truck-droplet" style={{ color: "white", fontSize: "18px", opacity: 0.85 }} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Regional Coverage — TX only */}
          {isTX && (
            <div>
              <h2 className="font-serif text-2xl font-semibold mb-6" style={{ color: "#005A9C" }}>
                Texas Bulk Water Hauling by Region
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TX_REGIONS.map(({ name, desc }) => (
                  <div key={name} className="rounded-xl border border-border bg-white p-5">
                    <h3 className="font-semibold text-base mb-1" style={{ color: "#005A9C" }}>{name}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hauler grid */}
          {haulers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#005A9C1A" }}
              >
                <MapPin className="w-8 h-8" style={{ color: "#005A9C" }} />
              </div>
              <h2 className="font-serif text-xl font-semibold">No haulers listed yet</h2>
              <p className="text-muted-foreground max-w-sm">
                We don't have any haulers listed in {stateName} yet. Check back soon or{" "}
                <Link href="/for-haulers" className="underline" style={{ color: "#005A9C" }}>
                  list your business free
                </Link>
                .
              </p>
            </div>
          ) : (
            <div>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                All Haulers in {stateName}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {haulers.map((hauler) => (
                  <HaulerCard key={hauler.id} hauler={hauler} />
                ))}
              </div>
            </div>
          )}

          {/* FAQ — TX only */}
          {isTX && (
            <div>
              <h2 className="font-serif text-2xl font-semibold mb-6" style={{ color: "#005A9C" }}>
                Frequently Asked Questions About Bulk Water Delivery in Texas
              </h2>
              <div className="space-y-4">
                {TX_FAQS.map(({ q, a }) => (
                  <div key={q} className="rounded-xl border border-border bg-white p-6">
                    <h3 className="font-semibold text-base mb-2">{q}</h3>
                    <p className="text-sm text-muted-foreground">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
