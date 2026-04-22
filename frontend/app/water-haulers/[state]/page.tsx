import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HaulerCard } from "@/components/hauler-card";
import { WaveDivider } from "@/components/WaveDivider";
import { CityWave } from "@/components/city-wave";
import {
  MapPin,
  ArrowLeft,
  Waves,
  Droplets,
  HardHat,
  Tractor,
  Zap,
  Flame,
  PartyPopper,
} from "lucide-react";
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

type PageProps = { params: Promise<{ state: string }> };

// ─── Service Types ─────────────────────────────────────────────────────────────

const SERVICE_TYPES = [
  { name: "Pool Fills", slug: "pool", icon: Waves, color: "#005A9C" },
  { name: "Potable Water", slug: "potable", icon: Droplets, color: "#005A9C" },
  { name: "Construction", slug: "construction", icon: HardHat, color: "#005A9C" },
  { name: "Agricultural", slug: "agricultural", icon: Tractor, color: "#005A9C" },
  { name: "Emergency", slug: "emergency", icon: Zap, color: "#F2A900" },
  { name: "Oil & Gas", slug: "oil-gas", icon: Flame, color: "#005A9C" },
  { name: "Events", slug: "events", icon: PartyPopper, color: "#005A9C" },
];

// ─── Texas content ────────────────────────────────────────────────────────────
const TX_INTRO_SHORT =
  "Texas has more bulk water haulers than almost any other state — serving pool fills, rural cisterns, construction sites, ranches, and oil fields across all 254 counties. Browse verified haulers below or jump to Austin, Houston, San Antonio, or browse all cities.";

const TX_INTRO_LONG =
  "Texas is one of the largest markets for bulk water delivery in the country. From the Hill Country to the Permian Basin, demand for reliable water hauling is year-round and growing. Whether you need potable water delivered to a rural cistern, dust control on a job site, pool water delivery, or an emergency fill after a drought, local Texas water haulers are ready to help.";

const TX_REGIONS = [
  {
    name: "Central Texas / Hill Country",
    desc: "Austin, Dripping Springs, Marble Falls, Blanco, Johnson City, Spicewood, Canyon Lake. High demand for potable water on rural properties and pool fills in the growing suburbs west of Austin.",
    cities: ["Austin", "Dripping Springs", "Marble Falls", "Canyon Lake"],
    slugs: ["austin", "dripping-springs", "marble-falls", "canyon-lake"],
  },
  {
    name: "West Texas / Permian Basin",
    desc: "Midland, Odessa, and surrounding oil country. Active market for oilfield water hauling, frac support, and dust control on remote job sites.",
    cities: ["Midland", "Odessa"],
    slugs: ["midland", "odessa"],
  },
  {
    name: "North Texas / DFW",
    desc: "Dallas, Fort Worth, Arlington, Carrollton, Keller. Large suburban market for pool fills and construction site water in one of the fastest-growing regions in the USA.",
    cities: ["Dallas", "Fort Worth", "Arlington"],
    slugs: ["dallas", "fort-worth", "arlington"],
  },
  {
    name: "South Texas",
    desc: "San Antonio and surrounding areas. Mixed residential, agricultural, and commercial demand.",
    cities: ["San Antonio"],
    slugs: ["san-antonio"],
  },
  {
    name: "Gulf Coast / Houston",
    desc: "Houston and surrounding Harris County. Pool fills, construction, and emergency response in the nation's fourth-largest city.",
    cities: ["Houston"],
    slugs: ["houston"],
  },
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

// ─── Per-state short intros ────────────────────────────────────────────────────

const STATE_INTRO_SHORT: Record<string, string> = {
  tx: TX_INTRO_SHORT,
  az: "Arizona is one of the driest states in the country — and one of the busiest markets for bulk water delivery. From pool fills in the Phoenix metro to rural cistern delivery across the Sonoran Desert, find verified water haulers near you.",
};

const STATE_INTRO_LONG: Record<string, string> = {
  tx: TX_INTRO_LONG,
  az: "Arizona's desert climate drives year-round demand for bulk water hauling across residential, agricultural, and commercial sectors. Whether you need potable water delivered to a rural property, pool water for a new fill, or construction water for a job site, local Arizona haulers are equipped to help.",
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const states = await getAllStatesWithCounts();
  return states.map(({ abbr }) => ({ state: abbr.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { state } = await params;
  const abbr = fromStateSlug(state);
  const name = STATE_NAMES[state] ?? abbr;
  const title =
    state === "tx"
      ? "Bulk Water Delivery in Texas | Find Local Water Haulers | HaulAgua"
      : `Water Haulers in ${name} | HaulAgua`;
  const description =
    state === "tx"
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

const INNER = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";
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
  const isTX = state === "tx";

  const cache = cityPhotoCache as Record<string, string>;
  const citiesWithPhotos: CityWithPhoto[] = cities.map(
    ({ city, slug, count }) => ({
      city,
      slug,
      count,
      photo: cache[`${city}|${abbr}`] ?? null,
    })
  );
  const hasCities = citiesWithPhotos.length > 0;

  const shortIntro =
    STATE_INTRO_SHORT[state] ??
    `Find bulk water haulers in ${stateName} for pool fills, potable water delivery, construction, agriculture, and emergencies. Browse verified haulers below or search by city.`;

  const longIntro =
    STATE_INTRO_LONG[state] ??
    `${stateName} has a growing market for bulk water delivery across residential, agricultural, and commercial sectors. Whether you need potable water, pool fills, construction water, or emergency delivery, local haulers are ready to help.`;

  const faqSchema = isTX
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: TX_FAQS.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      }
    : null;

  const itemListSchema =
    haulers.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Bulk Water Haulers in ${stateName}`,
          itemListElement: haulers.map((h, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: h.attributes.name,
            url: `https://haulagua.com/haulers/${h.attributes.slug}`,
          })),
        }
      : null;

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

        {/* ── Hero ── */}
        <section
          className="py-6 md:py-8"
          style={{ background: "linear-gradient(to bottom, #005A9C, #2A7FC1)" }}
        >
          <div className={INNER}>
            <Link
              href="/water-haulers"
              className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              All States
            </Link>

            {/* Two-column hero layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

              {/* Left — H1 + short intro + hauler count */}
              <div>
                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                  Bulk Water Delivery in {stateName}
                </h1>
                <p className="mt-4 text-lg text-white/85 max-w-xl">
                  {shortIntro}
                </p>
                <p className="mt-3 text-sm text-white/60">
                  {haulers.length} hauler{haulers.length !== 1 ? "s" : ""}{" "}
                  found in {stateName}
                </p>
              </div>

              {/* Right — Service type thumbnail links */}
              <div>
                <p className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-4">
                  Browse by Service
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {SERVICE_TYPES.map(({ name, slug, icon: Icon }) => (
                    <Link
                      key={slug}
                      href="#all-haulers"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-colors border border-white/20 hover:border-white/40"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-[#F2A900]" />
                      {name}
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* wave: hero → haulers */}
        <div style={{ backgroundColor: "#ffffff" }}>
          <WaveDivider topColor="#2A7FC1" />
        </div>

        {/* ── All Haulers ── */}
        <section id="all-haulers" className="py-8 md:py-10 bg-white scroll-mt-20">
          <div className={INNER}>
            {haulers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#005A9C1A" }}
                >
                  <MapPin className="w-8 h-8" style={{ color: "#005A9C" }} />
                </div>
                <h2 className="font-serif text-xl font-semibold">
                  No haulers listed yet
                </h2>
                <p className="text-muted-foreground max-w-sm">
                  We don't have any haulers listed in {stateName} yet. Check
                  back soon or{" "}
                  <Link
                    href="/for-haulers"
                    className="underline"
                    style={{ color: "#005A9C" }}
                  >
                    list your business free
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <>
                <h2
                  className="font-serif text-2xl font-semibold mb-6"
                  style={{ color: "#333333" }}
                >
                  Bulk Water Haulers in {stateName}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {haulers.map((hauler) => (
                    <HaulerCard key={hauler.id} hauler={hauler} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── Expanded body copy + anchor nav ── */}
        <div style={{ backgroundColor: "#F0F6FC" }}>
          <WaveDivider topColor="#ffffff" />
        </div>
        <section
          className="py-8 md:py-10"
          style={{ background: "linear-gradient(to bottom, #F0F6FC, #ffffff)" }}
        >
          <div className={INNER}>

            {/* Long intro copy */}
            <p className="text-base text-muted-foreground max-w-3xl mb-8 leading-relaxed">
              {longIntro}
            </p>

            {/* Anchor nav */}
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
              <span className="text-muted-foreground mr-1">Browse by:</span>
              {hasCities && (
                <a
                  href="#cities"
                  className="px-4 py-1.5 rounded-full border border-[#005A9C] text-[#005A9C] hover:bg-[#005A9C] hover:text-white transition-colors"
                >
                  Cities
                </a>
              )}
              <a
                href="#counties"
                className="px-4 py-1.5 rounded-full border border-[#005A9C] text-[#005A9C] hover:bg-[#005A9C] hover:text-white transition-colors"
              >
                Counties
              </a>
              {isTX && (
                <a
                  href="#regions"
                  className="px-4 py-1.5 rounded-full border border-[#005A9C] text-[#005A9C] hover:bg-[#005A9C] hover:text-white transition-colors"
                >
                  Regions
                </a>
              )}
            </div>

          </div>
        </section>

        {/* ── Cities ── */}
        {hasCities && (
          <>
            <section id="cities" className="py-8 md:py-10 bg-white">
              <div className={INNER}>
                <h2
                  className="font-serif text-2xl font-semibold mb-6"
                  style={{ color: "#333333" }}
                >
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
                            className="w-full h-full"
                            style={{ backgroundColor: "#005A9C" }}
                          />
                        )}
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.65) 100%)",
                          }}
                        />
                        <CityWave className="absolute bottom-0 left-0" />
                        <div
                          className="absolute inset-0 flex items-end justify-center pointer-events-none"
                          style={{ paddingBottom: "16px" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                backgroundColor: "#2d6e2d",
                                border: "4px solid white",
                                borderRadius: "6px",
                                padding: "8px 18px",
                                textAlign: "center",
                                boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                                minWidth: "160px",
                                maxWidth: "88%",
                              }}
                            >
                              <p
                                style={{
                                  color: "white",
                                  fontSize: "9px",
                                  fontWeight: 700,
                                  letterSpacing: "0.18em",
                                  textTransform: "uppercase",
                                  marginBottom: "2px",
                                }}
                              >
                                Welcome to
                              </p>
                              <p
                                style={{
                                  color: "white",
                                  fontSize: "20px",
                                  fontWeight: 800,
                                  lineHeight: 1.1,
                                  fontFamily: "Georgia, serif",
                                }}
                              >
                                {city}
                              </p>
                              <p
                                style={{
                                  color: "white",
                                  fontSize: "9px",
                                  fontWeight: 700,
                                  letterSpacing: "0.18em",
                                  textTransform: "uppercase",
                                  marginTop: "2px",
                                }}
                              >
                                {stateName}
                              </p>
                            </div>
                            <div
                              style={{
                                width: "8px",
                                height: "28px",
                                backgroundColor: "#a0a0a0",
                                boxShadow: "inset -2px 0 3px rgba(0,0,0,0.2)",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div
                        className="px-4 py-3 flex items-center gap-2"
                        style={{ backgroundColor: "#0461AA" }}
                      >
                        <p className="text-sm font-bold text-white">
                          {count} hauler{count !== 1 ? "s" : ""}
                        </p>
                        <i
                          className="fa-solid fa-truck-droplet"
                          style={{
                            color: "white",
                            fontSize: "18px",
                            opacity: 0.85,
                          }}
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
            <div style={{ backgroundColor: "#F0F6FC" }}>
              <WaveDivider topColor="white" />
            </div>
          </>
        )}

        {/* ── Counties — Coming Soon ── */}
        <section
          id="counties"
          className="py-8 md:py-10"
          style={{ background: "linear-gradient(to bottom, #F0F6FC, #ffffff)" }}
        >
          <div className={INNER}>
            <h2
              className="font-serif text-2xl font-semibold mb-2"
              style={{ color: "#333333" }}
            >
              Browse by County
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              County-level pages are coming soon. In the meantime, search by
              city or browse all haulers above.
            </p>
            <div className="rounded-xl border border-dashed border-[#005A9C]/30 bg-white p-10 text-center">
              <MapPin
                className="mx-auto mb-3 h-8 w-8"
                style={{ color: "#005A9C", opacity: 0.4 }}
              />
              <p className="text-sm text-muted-foreground">
                County pages coming soon —{" "}
                <Link
                  href="#all-haulers"
                  className="underline"
                  style={{ color: "#005A9C" }}
                >
                  search all haulers in {stateName}
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* ── Regions — TX only ── */}
        {isTX && (
          <>
            <div style={{ backgroundColor: "#D6E8F7" }}>
              <WaveDivider topColor="white" />
            </div>
            <section
              id="regions"
              className="py-8 md:py-10"
              style={{
                background: "linear-gradient(to bottom, #D6E8F7, #F8FBFF)",
              }}
            >
              <div className={INNER}>
                <h2
                  className="font-serif text-2xl font-semibold mb-6"
                  style={{ color: "#333333" }}
                >
                  Texas Bulk Water Hauling by Region
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {TX_REGIONS.map(({ name, desc, cities: regionCities, slugs }) => (
                    <div
                      key={name}
                      className="rounded-xl bg-white p-5 shadow-sm"
                    >
                      <h3
                        className="font-semibold text-base mb-1"
                        style={{ color: "#005A9C" }}
                      >
                        {name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {desc}
                      </p>
                      {regionCities.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {regionCities.map((city, i) => (
                            <Link
                              key={city}
                              href={`/water-haulers/tx/${slugs[i]}`}
                              className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#F0F6FC] text-[#005A9C] hover:bg-[#005A9C] hover:text-white transition-colors"
                            >
                              {city}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <div style={{ backgroundColor: "#C8DCF0" }}>
              <WaveDivider topColor="#F8FBFF" />
            </div>
          </>
        )}

        {/* ── FAQ — TX only ── */}
        {isTX && (
          <section
            className="py-8 md:py-10"
            style={{
              background: "linear-gradient(to bottom, #C8DCF0, #F0F6FC)",
            }}
          >
            <div className={INNER}>
              <h2
                className="font-serif text-2xl font-semibold mb-6"
                style={{ color: "#333333" }}
              >
                Frequently Asked Questions About Bulk Water Delivery in Texas
              </h2>
              <div className="space-y-4">
                {TX_FAQS.map(({ q, a }) => (
                  <div key={q} className="rounded-xl bg-white p-6 shadow-sm">
                    <h3
                      className="font-semibold text-base mb-2"
                      style={{ color: "#333333" }}
                    >
                      {q}
                    </h3>
                    <p className="text-sm text-muted-foreground">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>
      <Footer />
    </div>
  );
}