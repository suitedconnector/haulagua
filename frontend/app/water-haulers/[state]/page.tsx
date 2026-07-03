import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbList } from "schema-dts";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HaulerCard } from "@/components/hauler-card";
import { FaqSection } from "@/components/faq-section";
import { texasFAQs, arizonaFAQs } from "@/lib/faqs/data";
import { WaveDivider } from "@/components/WaveDivider";
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

type PageProps = { params: Promise<{ state: string }>; searchParams: Promise<{ service?: string }> };

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
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://www.haulagua.com/water-haulers/${state}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.haulagua.com/water-haulers/${state}`,
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

export default async function StatePage({ params, searchParams }: PageProps) {
  const { state } = await params;
  const { service } = await searchParams;
  const abbr = fromStateSlug(state);
  const stateName = STATE_NAMES[state] ?? abbr;
  const haulers = await getHaulersByState(abbr);
  const cities = groupHaulersByCity(haulers);
  const isTX = state === "tx";

  const activeServiceType = SERVICE_TYPES.find((st) => st.slug === service) ?? null;
  const displayedHaulers = activeServiceType
    ? haulers.filter((h) => {
        return (
          h.services?.some((s) => s.type === activeServiceType.slug) ||
          (h.industries?.includes(activeServiceType.slug) ?? false)
        );
      })
    : haulers;

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

  const stateFaqs = state === "tx" ? texasFAQs : state === "az" ? arizonaFAQs : null;

  const itemListSchema =
    haulers.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Bulk Water Haulers in ${stateName}`,
          itemListElement: haulers.map((h, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: h.name,
            url: `https://haulagua.com/haulers/${h.slug}`,
          })),
        }
      : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.haulagua.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: stateName,
        item: `https://www.haulagua.com/water-haulers/${state}`,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
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
              className="inline-flex items-center gap-1.5 text-sm font-bold mb-6 transition-colors"
              style={{ color: "#F2A900" }}
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
                      href={`?service=${slug}#all-haulers`}
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
                  className="font-serif text-2xl font-semibold mb-4 flex items-baseline gap-3"
                  style={{ color: "#333333" }}
                >
                  Bulk Water Haulers in {stateName}
                  <span className="text-sm font-normal text-muted-foreground">· {displayedHaulers.length} hauler{displayedHaulers.length !== 1 ? "s" : ""}</span>
                </h2>
                {activeServiceType && (
                  <div className="flex items-center gap-2 mb-5 text-sm">
                    <span className="text-muted-foreground">Showing: {activeServiceType.name}</span>
                    <span className="text-muted-foreground">·</span>
                    <Link href={`/water-haulers/${state}#all-haulers`} className="hover:underline" style={{ color: "#005A9C" }}>Clear filter</Link>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {displayedHaulers.map((hauler) => (
                    <HaulerCard key={hauler.id} hauler={hauler} refPath={`/water-haulers/${state}`} />
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
          <section id="cities" className="py-8 md:py-10 bg-white">
            <div className={INNER}>
              <h2
                className="font-serif text-2xl font-semibold mb-6"
                style={{ color: "#333333" }}
              >
                Browse Cities in {stateName}
              </h2>
              <div className="flex flex-wrap gap-2">
                {citiesWithPhotos.map(({ city, slug }) => (
                  <Link
                    key={slug}
                    href={`/water-haulers/${state}/${slug}`}
                    className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#005A9C] text-[#005A9C] text-sm font-medium transition-all hover:bg-[#005A9C] hover:text-white"
                  >
                    {city}
                  </Link>
                ))}
              </div>
            </div>
          </section>
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

        {/* ── FAQ — TX and AZ ── */}
        {stateFaqs && (
          <FaqSection
            faqs={stateFaqs}
            title={`Frequently Asked Questions About Bulk Water Delivery in ${stateName}`}
          />
        )}

      </main>
      <Footer />
    </div>
  );
}