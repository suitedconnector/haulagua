import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HaulerCard } from "@/components/hauler-card";
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
  CITY_INTRO_DEFAULT,
  fromStateSlug,
  fromCitySlug,
  getHaulersByState,
  getHaulersByCity,
  getLocationByCity,
  groupHaulersByCity,
  getAllStatesWithCounts,
} from "@/lib/location";

type PageProps = { params: Promise<{ state: string; city: string }> };

// ─── Service Types ─────────────────────────────────────────────────────────────

const SERVICE_TYPES = [
  { name: "Pool Fills", slug: "pool", icon: Waves },
  { name: "Potable Water", slug: "potable", icon: Droplets },
  { name: "Construction", slug: "construction", icon: HardHat },
  { name: "Agricultural", slug: "agricultural", icon: Tractor },
  { name: "Emergency", slug: "emergency", icon: Zap },
  { name: "Oil & Gas", slug: "oil-gas", icon: Flame },
  { name: "Events", slug: "events", icon: PartyPopper },
];

const INNER = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

// ─── Static Params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const states = await getAllStatesWithCounts();
  const result: { state: string; city: string }[] = [];
  for (const { abbr } of states) {
    const haulers = await getHaulersByState(abbr.toUpperCase());
    const cities = groupHaulersByCity(haulers);
    for (const { slug } of cities) {
      result.push({ state: abbr.toLowerCase(), city: slug });
    }
  }
  return result;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state, city } = await params;
  const abbr = fromStateSlug(state);
  const stateName = STATE_NAMES[state] ?? abbr;
  const cityName = fromCitySlug(city);
  const location = await getLocationByCity(abbr, cityName);

  const title =
    location?.attributes.metaTitle ??
    `Bulk Water Delivery in ${cityName}, ${stateName} | HaulAgua`;
  const description =
    location?.attributes.metaDescription ??
    `Find bulk water haulers in ${cityName}, ${stateName} for pool fills, potable water delivery, construction, and more.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://haulagua.com/water-haulers/${state}/${city}`,
      siteName: "HaulAgua",
      type: "website",
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CityPage({ params }: PageProps) {
  const { state, city } = await params;
  const abbr = fromStateSlug(state);
  const stateName = STATE_NAMES[state] ?? abbr;
  const cityName = fromCitySlug(city);

  const [haulers, location] = await Promise.all([
    getHaulersByCity(abbr, cityName),
    getLocationByCity(abbr, cityName),
  ]);

  const introShort =
    location?.attributes.introShort ?? CITY_INTRO_DEFAULT(cityName, stateName);
  const introLong = location?.attributes.introLong ?? null;
  const localContext = location?.attributes.localContext ?? null;
  const faqs = location?.attributes.faqs ?? [];
  const nearbyCities = location?.attributes.nearbyCities?.data ?? [];
  const availableServices = location?.attributes.availableServices ?? null;

  // Filter service types to only show available ones, or show all if not specified
  const displayServices = availableServices
    ? SERVICE_TYPES.filter((s) => availableServices.includes(s.slug))
    : SERVICE_TYPES;

  // FAQ schema markup
  const faqSchema =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map(({ question, answer }) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer },
          })),
        }
      : null;

  const itemListSchema =
    haulers.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Bulk Water Haulers in ${cityName}, ${stateName}`,
          itemListElement: haulers.map((h, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: h.attributes.name,
            url: `https://haulagua.com/haulers/${h.attributes.slug}`,
          })),
        }
      : null;

  return (
    <div className="min-h-screen flex flex-col suppressHydrationWarning">
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
              href={`/water-haulers/${state}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              All {stateName} Haulers
            </Link>

            {/* Two-column hero layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

              {/* Left — H1 + short intro + hauler count */}
              <div>
                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                  Bulk Water Delivery in {cityName}, {stateName}
                </h1>
                <p className="mt-4 text-lg text-white/85 max-w-xl">
                  {introShort}
                </p>
                <p className="mt-3 text-sm text-white/60">
                  {haulers.length} hauler{haulers.length !== 1 ? "s" : ""} found in {cityName}
                </p>
              </div>

              {/* Right — Service type links */}
              <div>
                <p className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-4">
                  Browse by Service
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {displayServices.map(({ name, slug, icon: Icon }) => (
                    <Link
                      key={slug}
                      href={`/search?services=${slug}&state=${state}`}
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
        <div style={{ backgroundColor: "#F0F6FC" }}>
          <WaveDivider topColor="#2A7FC1" />
        </div>

        {/* ── Haulers ── */}
        <section id="all-haulers" className="py-8 md:py-8 bg-white scroll-mt-20" style={{ background: "linear-gradient(to bottom, #F0F6FC, #ffffff)" }}>
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
                  No haulers found in {cityName}
                </h2>
                <p className="text-muted-foreground max-w-sm">
                  We don't have any haulers listed in {cityName} yet.{" "}
                  <Link
                    href={`/water-haulers/${state}`}
                    className="underline"
                    style={{ color: "#005A9C" }}
                  >
                    Browse all {stateName} haulers
                  </Link>{" "}
                  or{" "}
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
                  Bulk Water Haulers in {cityName}, {stateName}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {haulers.map((hauler) => (
                    <HaulerCard key={hauler.id} hauler={hauler} refPath={`/water-haulers/${state}/${city}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── Expanded body copy ── */}
        {(introLong || localContext) && (
          <>
            <div style={{ backgroundColor: "#F0F6FC" }}>
              <WaveDivider topColor="white" />
            </div>
            <section
              className="py-8 md:py-8"
              style={{ background: "linear-gradient(to bottom, #F0F6FC, #ffffff)" }}
            >
              <div className={INNER}>
                {introLong && (
                  <p className="text-base text-muted-foreground max-w-3xl mb-6 leading-relaxed">
                    {introLong}
                  </p>
                )}
                {localContext && (
                  <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
                    {localContext}
                  </p>
                )}
              </div>
            </section>
          </>
        )}

        {/* ── Nearby Cities ── */}
        {nearbyCities.length > 0 && (
          <>
            <div style={{ backgroundColor: "#D6E8F7" }}>
              <WaveDivider topColor="white" />
            </div>
            <section
              className="py-8 md:py-8"
              style={{ background: "linear-gradient(to bottom, #D6E8F7, #F8FBFF)" }}
            >
              <div className={INNER}>
                <h2
                  className="font-serif text-2xl font-semibold mb-6"
                  style={{ color: "#333333" }}
                >
                  Nearby Cities
                </h2>
                <div className="flex flex-wrap gap-3">
                  {nearbyCities.map(({ id, attributes: nc }) => (
                    <Link
                      key={id}
                      href={`/water-haulers/${nc.state.toLowerCase()}/${nc.slug}`}
                      className="px-4 py-2 rounded-full bg-white border border-[#005A9C]/20 text-sm font-medium hover:bg-[#005A9C] hover:text-white hover:border-[#005A9C] transition-colors"
                      style={{ color: "#005A9C" }}
                    >
                      {nc.city}
                    </Link>
                  ))}
                </div>
              </div>
            </section>
            <div style={{ backgroundColor: "#C8DCF0" }}>
              <WaveDivider topColor="#F8FBFF" />
            </div>
          </>
        )}

        {/* ── FAQs ── */}
            <div style={{ backgroundColor: "#C8DCF0" }}>
              <WaveDivider topColor="white" />
            </div>
        {faqs.length > 0 && (
          <section
            className="py-8 md:py-8"
            style={{ background: "linear-gradient(to bottom, #C8DCF0, #ffffff" }}
          >
            <div className={INNER}>
              <h2
                className="font-serif text-2xl font-semibold mb-6"
                style={{ color: "#333333" }}
              >
                Frequently Asked Questions About Bulk Water Delivery in {cityName}
              </h2>
              <div className="space-y-4">
                {faqs.map(({ question, answer }) => (
                  <div
                    key={question}
                    className="rounded-xl bg-white p-6 shadow-sm"
                  >
                    <h3
                      className="font-semibold text-base mb-2"
                      style={{ color: "#333333" }}
                    >
                      {question}
                    </h3>
                    <p className="text-sm text-muted-foreground">{answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA for haulers ── */}
            <div style={{ backgroundColor: "#F8FBFF" }}>
              <WaveDivider topColor="#ffffff" />
            </div>
        <section
          className="py-8 md:py-8"
          style={{ background: "linear-gradient(to bottom, #F8FBFF, #F0F6FC)" }}
        >
          <div className={INNER}>
            <div className="rounded-xl bg-white border border-[#005A9C]/20 p-8 text-center shadow-sm">
              <h2
                className="font-serif text-2xl font-semibold mb-2"
                style={{ color: "#333333" }}
              >
                Are You a Water Hauler in {cityName}?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                List your business free and connect with customers looking for bulk water delivery in {cityName} and surrounding areas.
              </p>
              <Link
                href="/for-haulers"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: "#005A9C" }}
              >
                List Your Business Free
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}