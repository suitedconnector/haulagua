import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HaulerCard } from "@/components/hauler-card";
import { WaveDivider } from "@/components/WaveDivider";
import { ArrowLeft, MapPin } from "lucide-react";
import { STATE_NAMES, fromStateSlug, fromCitySlug, toCitySlug } from "@/lib/location";
import haulersFlatData from "@/data/haulers-flat.json";

type PageProps = { params: Promise<{ state: string; city: string; service: string }> };

const INNER = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

// ─── Service Content ──────────────────────────────────────────────────────────

const SERVICE_CONTENT: Record<string, { intro: string; faqs: Array<{ question: string; answer: string }>; ctaButton: string }> = {
  "pool-fill": {
    intro: "Need to fill or top off a pool? HaulAgua connects you with reliable water delivery services in [City], [State]. From new pool fills to seasonal maintenance, find vetted professionals who deliver potable water quickly and affordably.",
    faqs: [
      { question: "How long does it take to fill a 20,000 gallon pool?", answer: "Most pool fills take 1-3 hours depending on truck capacity and distance. Contact local haulers for a precise timeline." },
      { question: "What's the average cost to fill a pool?", answer: "Costs vary by location and water source, typically ranging from $150–$500 for a residential pool. Contact haulers for exact pricing." },
      { question: "Do you deliver potable or non-potable water?", answer: "Most pool fills use potable water. Confirm water type with your hauler before scheduling." },
      { question: "Can you fill on weekends/evenings?", answer: "Many haulers offer weekend and evening service. Check availability with local providers in your area." },
    ],
    ctaButton: "Find Pool Fill Services Near You",
  },
  construction: {
    intro: "Managing dust on a construction site? Find local water haulers who specialize in dust suppression, site preparation, and emergency water delivery. Fast response times, bulk capacity, experienced operators.",
    faqs: [
      { question: "What's the cost per load for dust control?", answer: "Pricing depends on truck size and distance. Most haulers charge $200–$600 per load. Request quotes from local services." },
      { question: "How quickly can you respond to an emergency fill?", answer: "Many haulers offer same-day emergency response. Call ahead for fastest availability." },
      { question: "What truck sizes are available?", answer: "Trucks typically range from 2,000–8,000+ gallons. Larger capacities available for ongoing projects." },
      { question: "Do you offer recurring service contracts?", answer: "Yes, many haulers provide recurring contracts for construction projects. Discuss terms directly with providers." },
    ],
    ctaButton: "Request Dust Control Service",
  },
  potable: {
    intro: "Reliable potable water delivery for your home, farm, or business. HaulAgua connects you with certified water haulers who deliver safe, tested drinking water for cisterns, tanks, and emergency situations.",
    faqs: [
      { question: "Is the water certified safe to drink?", answer: "Yes, potable water is certified and tested to meet EPA drinking water standards. Confirm certification details with your hauler." },
      { question: "What's included in potable water delivery?", answer: "Delivery includes filling your tank or container with certified potable water. Some haulers offer additional services like tank cleaning." },
      { question: "How much does potable water cost per gallon?", answer: "Rates typically range from $0.50–$2.00 per gallon depending on location and delivery distance. Get quotes from local haulers." },
      { question: "Do you serve [specific county/region]?", answer: "Service areas vary by hauler. Search for your location or contact providers directly to confirm coverage." },
    ],
    ctaButton: "Get Potable Water Delivery",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getHaulersByCityAndService(
  state: string,
  city: string,
  service: string
): typeof haulersFlatData {
  return (haulersFlatData as typeof haulersFlatData).filter((h) => {
    if (h.state.toLowerCase() !== state.toLowerCase()) return false;
    if (h.city.toLowerCase() !== city.toLowerCase()) return false;
    if (h.isActive === false) return false;

    const description = (h.description || "").toLowerCase();

    if (service === "pool-fill") {
      return description.includes("pool") || description.includes("fill");
    } else if (service === "construction") {
      return description.includes("construction") || description.includes("dust") || description.includes("site");
    } else if (service === "potable") {
      return h.waterType === "potable" || h.waterType === "both" || description.includes("potable") || description.includes("drinking");
    }
    return false;
  });
}

// ─── Static Params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const services = ["pool-fill", "construction", "potable"];
  const cityStateMap = new Map<string, Set<string>>();

  for (const h of haulersFlatData as typeof haulersFlatData) {
    if (h.isActive === false) continue;
    const key = h.state.toLowerCase();
    if (!cityStateMap.has(key)) cityStateMap.set(key, new Set());
    cityStateMap.get(key)!.add(toCitySlug(h.city));
  }

  const result: { state: string; city: string; service: string }[] = [];
  for (const [state, cities] of cityStateMap) {
    for (const city of cities) {
      for (const service of services) {
        result.push({ state, city, service });
      }
    }
  }
  return result;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state, city, service } = await params;
  const stateName = STATE_NAMES[state] ?? state.toUpperCase();
  const cityName = fromCitySlug(city);
  const serviceTitle = {
    "pool-fill": "Pool Fill",
    construction: "Construction & Dust Control",
    potable: "Potable Water Delivery",
  }[service] || service;

  const title = `${serviceTitle} in ${cityName}, ${stateName} | HaulAgua`;
  const description = `Find reliable water haulers for ${serviceTitle.toLowerCase()} services in ${cityName}, ${stateName}. Fast, professional delivery.`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `https://www.haulagua.com/water-haulers/${state}/${city}/services/${service}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.haulagua.com/water-haulers/${state}/${city}/services/${service}`,
      siteName: "HaulAgua",
      type: "website",
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CityServicePage({ params }: PageProps) {
  const { state, city, service } = await params;
  const stateName = STATE_NAMES[state] ?? state.toUpperCase();
  const cityName = fromCitySlug(city);
  const content = SERVICE_CONTENT[service];

  if (!content) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Service not found</h1>
            <p className="text-muted-foreground mt-2">The service you're looking for doesn't exist.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const haulers = getHaulersByCityAndService(state, cityName, service);
  const serviceTitle = {
    "pool-fill": "Pool Fill",
    construction: "Construction & Dust Control",
    potable: "Potable Water Delivery",
  }[service] || service;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="py-6 md:py-8" style={{ background: "linear-gradient(to bottom, #005A9C, #2A7FC1)" }}>
          <div className={INNER}>
            <Link
              href={`/water-haulers/${state}/${city}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              All {cityName} Haulers
            </Link>

            <div className="max-w-3xl">
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                {serviceTitle} in {cityName}, {stateName}
              </h1>
              <p className="mt-4 text-lg text-white/85 max-w-xl">
                {content.intro.replace("[City]", cityName).replace("[State]", stateName)}
              </p>
              <p className="mt-3 text-sm text-white/60">
                {haulers.length} hauler{haulers.length !== 1 ? "s" : ""} found in {cityName}
              </p>
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
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#005A9C1A" }}>
                  <MapPin className="w-8 h-8" style={{ color: "#005A9C" }} />
                </div>
                <h2 className="font-serif text-xl font-semibold">No haulers found</h2>
                <p className="text-muted-foreground max-w-sm">
                  We don't have {serviceTitle.toLowerCase()} services listed in {cityName} yet.{" "}
                  <Link href={`/water-haulers/${state}/${city}`} className="underline" style={{ color: "#005A9C" }}>
                    Browse all {cityName} haulers
                  </Link>{" "}
                  or{" "}
                  <Link href="/for-haulers" className="underline" style={{ color: "#005A9C" }}>
                    list your business free
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <>
                <h2 className="font-serif text-2xl font-semibold mb-6" style={{ color: "#333333" }}>
                  {serviceTitle} Providers in {cityName}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {haulers.map((hauler) => (
                    <HaulerCard
                      key={hauler.slug}
                      hauler={hauler as any}
                      refPath={`/water-haulers/${state}/${city}/services/${service}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── FAQs ── */}
        {haulers.length > 0 && (
          <>
            <div style={{ backgroundColor: "#C8DCF0" }}>
              <WaveDivider topColor="white" />
            </div>
            <section className="py-8 md:py-8" style={{ background: "linear-gradient(to bottom, #C8DCF0, #ffffff" }}>
              <div className={INNER}>
                <h2 className="font-serif text-2xl font-semibold mb-6" style={{ color: "#333333" }}>
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {content.faqs.map(({ question, answer }) => (
                    <div key={question} className="rounded-xl bg-white p-6 shadow-sm">
                      <h3 className="font-semibold text-base mb-2" style={{ color: "#333333" }}>
                        {question}
                      </h3>
                      <p className="text-sm text-muted-foreground">{answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* ── CTA ── */}
        {haulers.length > 0 && (
          <>
            <div style={{ backgroundColor: "#F8FBFF" }}>
              <WaveDivider topColor="#ffffff" />
            </div>
            <section className="py-8 md:py-8" style={{ background: "linear-gradient(to bottom, #F8FBFF, #F0F6FC)" }}>
              <div className={INNER}>
                <div className="rounded-xl bg-white border border-[#005A9C]/20 p-8 text-center shadow-sm">
                  <h2 className="font-serif text-2xl font-semibold mb-2" style={{ color: "#333333" }}>
                    Ready to Get {serviceTitle}?
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Contact the haulers above or explore more options in {cityName}, {stateName}.
                  </p>
                  <Link
                    href={`/water-haulers/${state}/${city}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90"
                    style={{ backgroundColor: "#005A9C" }}
                  >
                    {content.ctaButton}
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
