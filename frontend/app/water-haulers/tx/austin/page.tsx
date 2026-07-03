import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HaulerCard } from "@/components/hauler-card";
import { WaveDivider } from "@/components/WaveDivider";
import { ArrowLeft, MapPin, CheckCircle2 } from "lucide-react";
import haulersFlatData from "@/data/haulers-flat.json";

const INNER = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

export const metadata: Metadata = {
  title: "Find Verified Water Haulers in Austin, Texas — Potable, Pool Fill, Emergency 24/7",
  description: "Connect with TCEQ-compliant bulk water haulers in Austin for potable delivery, pool fills, construction, and emergency service. Verified listings, transparent pricing, same-day availability.",
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://www.haulagua.com/water-haulers/tx/austin",
  },
  openGraph: {
    title: "Find Verified Water Haulers in Austin, Texas",
    description: "TCEQ-compliant bulk water delivery for cisterns, pools, construction, and emergencies.",
    url: "https://www.haulagua.com/water-haulers/tx/austin",
    siteName: "HaulAgua",
    type: "website",
  },
};

export default function AustinWaterHaulerPage() {
  const haulers = (haulersFlatData as any[])
    .filter((h) => h.state === "TX" && h.city.toLowerCase() === "austin" && h.isActive !== false)
    .sort((a, b) => (b.isVerifiedPro ? 1 : -1));

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.haulagua.com" },
      { "@type": "ListItem", position: 2, name: "Texas Water Haulers", item: "https://www.haulagua.com/water-haulers/tx" },
      { "@type": "ListItem", position: 3, name: "Austin Water Haulers", item: "https://www.haulagua.com/water-haulers/tx/austin" },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Find Verified Water Haulers in Austin, Texas — Potable, Pool Fill, Emergency 24/7",
    description: "Comprehensive guide to bulk water delivery in Austin: TCEQ compliance, pricing, service types, and verified hauler directory.",
    image: "https://www.haulagua.com/og-image.png",
    datePublished: new Date().toISOString(),
    author: { "@type": "Organization", name: "HaulAgua" },
    publisher: { "@type": "Organization", name: "HaulAgua" },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much does bulk water delivery cost in Austin?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Pricing varies: $200–$400 for standard potable delivery (3,000–6,000 gallons), $150–$300 for non-potable pool fills, and $400–$800+ for emergency/after-hours service. Mileage, water source, and access constraints add to the total.",
        },
      },
      {
        "@type": "Question",
        name: "What is TCEQ compliance for water haulers?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "TCEQ (Texas Commission on Environmental Quality) requires potable water haulers to: source from approved municipal supplies, maintain sanitized food-grade tanks, test water quality, and maintain proper labeling. Always verify TCEQ compliance before ordering potable water.",
        },
      },
      {
        "@type": "Question",
        name: "How long does it take to fill a 20,000-gallon pool in Austin?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Plan 2–4 hours for a standard residential pool. A 20,000-gallon pool requires 3–4 tanker loads (6,000-gallon capacity each). Lead time: 24–48 hours standard; same-day emergency available at premium rates.",
        },
      },
      {
        "@type": "Question",
        name: "Can I get emergency water delivery at night or on weekends?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Many Austin haulers offer 24/7 emergency service for boil-water notices, well failures, and construction emergencies. Expect 1.5–2× standard pricing for after-hours/weekend calls. Call ahead for fastest response.",
        },
      },
      {
        "@type": "Question",
        name: "What's the difference between potable and non-potable bulk water?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Potable water is safe to drink: TCEQ-certified, sanitized tanks, food-grade quality. Non-potable is for pools, dust control, construction: lower cost, not safe for drinking. Confirm which type you need before ordering.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col suppressHydrationWarning">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="py-6 md:py-8" style={{ background: "linear-gradient(to bottom, #005A9C, #2A7FC1)" }}>
          <div className={INNER}>
            <Link
              href="/water-haulers/tx"
              className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              All Texas Haulers
            </Link>

            <div className="max-w-3xl">
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                Find Verified Water Haulers in Austin, Texas
              </h1>
              <p className="mt-4 text-lg text-white/85 max-w-2xl">
                Connect with TCEQ-compliant bulk water haulers for potable delivery, pool fills, construction, and emergency service. Verified listings, transparent pricing, same-day availability.
              </p>
              <p className="mt-3 text-sm text-white/60">
                {haulers.length} verified hauler{haulers.length !== 1 ? "s" : ""} serving Austin, Travis, Hays, and Williamson Counties
              </p>
            </div>
          </div>
        </section>

        {/* wave */}
        <div style={{ backgroundColor: "#F0F6FC" }}>
          <WaveDivider topColor="#2A7FC1" />
        </div>

        {/* ── Quick Answer ── */}
        <section className="py-8 md:py-8 bg-white scroll-mt-20" style={{ background: "linear-gradient(to bottom, #F0F6FC, #ffffff)" }}>
          <div className={INNER}>
            <h2 className="font-serif text-2xl font-semibold mb-6" style={{ color: "#333333" }}>
              Quick Answer: Who Delivers Bulk Water in Austin Right Now?
            </h2>

            <div className="space-y-6 mb-8">
              <div>
                <h3 className="font-semibold text-base mb-3" style={{ color: "#005A9C" }}>
                  Potable Water Delivery (Safe to Drink)
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  TCEQ-compliant sources for cisterns, wells, restaurants, healthcare, special events. Ask about tank sanitization history and backflow prevention.
                </p>
                {haulers.filter((h) => h.waterType === "potable" || h.waterType === "both").length > 0 && (
                  <div className="space-y-2">
                    {haulers
                      .filter((h) => h.waterType === "potable" || h.waterType === "both")
                      .slice(0, 2)
                      .map((h) => (
                        <Link
                          key={h.slug}
                          href={`/haulers/${h.slug}`}
                          className="block p-4 rounded-lg bg-[#005A9C]/5 border border-[#005A9C]/20 hover:border-[#005A9C]/40 transition-colors"
                        >
                          <div className="font-semibold text-sm" style={{ color: "#005A9C" }}>
                            {h.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {h.serviceArea || `${h.city}, ${h.state}`} • {h.truckCapacity ? `${h.truckCapacity} gal` : "Verified"} • {h.isVerifiedPro ? "Pro" : "Listed"}
                          </div>
                        </Link>
                      ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-base mb-3" style={{ color: "#005A9C" }}>
                  Pool Fill & Non-Potable
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Residential & commercial pools, dust control, landscaping. Potable or non-potable. Standard lead time: 24–48 hours.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-base mb-3" style={{ color: "#005A9C" }}>
                  Emergency 24/7 Service
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Boil-water notices, well failures, construction emergencies. Rapid response available. Call ahead for fastest turnaround.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Services ── */}
        <div style={{ backgroundColor: "#F0F6FC" }}>
          <WaveDivider topColor="white" />
        </div>
        <section className="py-8 md:py-8" style={{ background: "linear-gradient(to bottom, #F0F6FC, #ffffff)" }}>
          <div className={INNER}>
            <h2 className="font-serif text-2xl font-semibold mb-6" style={{ color: "#333333" }}>
              Service Types in Austin
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="rounded-lg bg-white p-6 shadow-sm border-l-4" style={{ borderColor: "#005A9C" }}>
                <h3 className="font-semibold text-base mb-2" style={{ color: "#005A9C" }}>Potable Water</h3>
                <p className="text-sm text-muted-foreground mb-3">Safe drinking water for cisterns, wells, restaurants, events.</p>
                <p className="text-xs text-muted-foreground"><strong>Tank size:</strong> 3,000–6,500 gal. <strong>Lead time:</strong> 24–48 hrs.</p>
              </div>

              <div className="rounded-lg bg-white p-6 shadow-sm border-l-4" style={{ borderColor: "#005A9C" }}>
                <h3 className="font-semibold text-base mb-2" style={{ color: "#005A9C" }}>Pool Fills</h3>
                <p className="text-sm text-muted-foreground mb-3">Residential and commercial pools. Potable or non-potable.</p>
                <p className="text-xs text-muted-foreground"><strong>Typical load:</strong> 3–4 tanker trips per 20K-gal pool. <strong>Time:</strong> 2–4 hrs.</p>
              </div>

              <div className="rounded-lg bg-white p-6 shadow-sm border-l-4" style={{ borderColor: "#005A9C" }}>
                <h3 className="font-semibold text-base mb-2" style={{ color: "#005A9C" }}>Construction/Dust</h3>
                <p className="text-sm text-muted-foreground mb-3">Job sites, industrial, dust suppression.</p>
                <p className="text-xs text-muted-foreground"><strong>Flexibility:</strong> Large volumes, flexible schedule. Non-potable OK.</p>
              </div>

              <div className="rounded-lg bg-white p-6 shadow-sm border-l-4" style={{ borderColor: "#005A9C" }}>
                <h3 className="font-semibold text-base mb-2" style={{ color: "#005A9C" }}>Agricultural</h3>
                <p className="text-sm text-muted-foreground mb-3">Livestock, irrigation, drought relief.</p>
                <p className="text-xs text-muted-foreground"><strong>Scale:</strong> High volume. <strong>Timing:</strong> Flexible for season/need.</p>
              </div>

              <div className="rounded-lg bg-white p-6 shadow-sm border-l-4" style={{ borderColor: "#005A9C" }}>
                <h3 className="font-semibold text-base mb-2" style={{ color: "#005A9C" }}>Emergency 24/7</h3>
                <p className="text-sm text-muted-foreground mb-3">Boil-water, well failure, urgent need.</p>
                <p className="text-xs text-muted-foreground"><strong>Rate:</strong> 1.5–2× standard. <strong>Call ahead.</strong></p>
              </div>

              <div className="rounded-lg bg-white p-6 shadow-sm border-l-4" style={{ borderColor: "#005A9C" }}>
                <h3 className="font-semibold text-base mb-2" style={{ color: "#005A9C" }}>Oil & Gas / Industrial</h3>
                <p className="text-sm text-muted-foreground mb-3">Oilfield work, hydrostatic testing, process water.</p>
                <p className="text-xs text-muted-foreground"><strong>Source:</strong> Non-potable. Specialized equipment.</p>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="rounded-xl bg-white p-8 shadow-sm border border-[#005A9C]/10 mb-8">
              <h3 className="font-semibold text-lg mb-4" style={{ color: "#333333" }}>
                Pricing in Austin: What to Expect
              </h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex gap-4 pb-4 border-b border-gray-200">
                  <div className="font-semibold min-w-fit" style={{ color: "#005A9C" }}>Standard Load</div>
                  <div>
                    <strong>Potable:</strong> $250–$400 (3,000–6,000 gal). <strong>Non-potable:</strong> $150–$300. Price varies by water source, distance, mileage fees.
                  </div>
                </div>
                <div className="flex gap-4 pb-4 border-b border-gray-200">
                  <div className="font-semibold min-w-fit" style={{ color: "#005A9C" }}>Emergency</div>
                  <div>After-hours, weekend, holiday: add 50–100% to standard rate. Same-day service may incur rush fee.</div>
                </div>
                <div className="flex gap-4 pb-4 border-b border-gray-200">
                  <div className="font-semibold min-w-fit" style={{ color: "#005A9C" }}>Distance/Access</div>
                  <div>Mileage fees, hose-run charges, standby time for difficult access. Always clarify site constraints upfront.</div>
                </div>
                <div className="flex gap-4">
                  <div className="font-semibold min-w-fit" style={{ color: "#005A9C" }}>Multiple Loads</div>
                  <div>Large projects (20K-gal pool, construction): negotiate bulk rates. 3–4 loads often cheaper per-gallon than single loads.</div>
                </div>
              </div>
            </div>

            {/* Compliance Checklist */}
            <div className="rounded-xl bg-white p-8 shadow-sm border border-[#005A9C]/10">
              <h3 className="font-semibold text-lg mb-4" style={{ color: "#333333" }}>
                TCEQ Compliance Checklist (Before You Order)
              </h3>
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#005A9C" }} />
                  <div>
                    <strong className="text-sm">Approved water source:</strong>
                    <p className="text-xs text-muted-foreground">Ask hauler: "Is this from a TCEQ-approved municipal source or private well?"</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#005A9C" }} />
                  <div>
                    <strong className="text-sm">Tank sanitation:</strong>
                    <p className="text-xs text-muted-foreground">Request proof of tank cleaning. Food-grade tanks only for potable water.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#005A9C" }} />
                  <div>
                    <strong className="text-sm">Chlorine residuals:</strong>
                    <p className="text-xs text-muted-foreground">TCEQ may require free chlorine residual (0.2–1.0 ppm). Confirm with your hauler.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#005A9C" }} />
                  <div>
                    <strong className="text-sm">Backflow prevention:</strong>
                    <p className="text-xs text-muted-foreground">Hauler's equipment must prevent water from flowing back into municipal lines.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#005A9C" }} />
                  <div>
                    <strong className="text-sm">Labeling:</strong>
                    <p className="text-xs text-muted-foreground">Tank must be labeled "Potable Water" or "Non-Potable" clearly.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#005A9C" }} />
                  <div>
                    <strong className="text-sm">Hauler license:</strong>
                    <p className="text-xs text-muted-foreground">Verify the hauler's TCEQ permit and insurance. Ask for documentation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Haulers ── */}
        <div style={{ backgroundColor: "#F0F6FC" }}>
          <WaveDivider topColor="white" />
        </div>
        <section id="all-haulers" className="py-8 md:py-8 bg-white scroll-mt-20" style={{ background: "linear-gradient(to bottom, #F0F6FC, #ffffff)" }}>
          <div className={INNER}>
            {haulers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#005A9C1A" }}>
                  <MapPin className="w-8 h-8" style={{ color: "#005A9C" }} />
                </div>
                <h2 className="font-serif text-xl font-semibold">No haulers found</h2>
                <p className="text-muted-foreground max-w-sm">
                  Check back soon for Austin listings, or{" "}
                  <Link href="/for-haulers" className="underline" style={{ color: "#005A9C" }}>
                    add your business free
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <>
                <h2 className="font-serif text-2xl font-semibold mb-6" style={{ color: "#333333" }}>
                  Verified Water Haulers in Austin
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {haulers.map((hauler) => (
                    <HaulerCard key={hauler.slug} hauler={hauler as any} refPath="/water-haulers/tx/austin" />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── CTA ── */}
        <div style={{ backgroundColor: "#F8FBFF" }}>
          <WaveDivider topColor="#ffffff" />
        </div>
        <section className="py-8 md:py-8" style={{ background: "linear-gradient(to bottom, #F8FBFF, #F0F6FC)" }}>
          <div className={INNER}>
            <div className="rounded-xl bg-white border border-[#005A9C]/20 p-8 text-center shadow-sm">
              <h2 className="font-serif text-2xl font-semibold mb-2" style={{ color: "#333333" }}>
                Are You a Water Hauler in Austin?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                List your business free and connect with customers looking for bulk water delivery in Austin and surrounding areas.
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
