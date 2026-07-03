import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbList } from "schema-dts";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HaulerCard } from "@/components/hauler-card";
import { ArrowLeft, MapPin } from "lucide-react";
import { WaveDivider } from "@/components/WaveDivider";
import haulersFlatData from "@/data/haulers-flat.json";

const INNER = "mx-auto max-w-4xl px-4 sm:px-6 lg:px-8";

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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much does bulk water delivery cost in Austin?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Pricing varies: $250–$400 for standard potable delivery (3,000–6,000 gallons), $150–$300 for non-potable pool fills. Mileage, water source, and access constraints add to the total. Emergency/after-hours service costs 50–100% more.",
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
        name: "How long does it take to fill a pool in Austin?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A 20,000-gallon pool requires 3–4 tanker loads (6,000-gallon capacity each) and typically takes 2–4 hours. Standard lead time is 24–48 hours; same-day emergency service available at premium rates.",
        },
      },
      {
        "@type": "Question",
        name: "Can I get emergency water delivery at night or weekends?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Many Austin haulers offer 24/7 emergency service for boil-water notices, well failures, and construction emergencies. Expect 1.5–2× standard pricing for after-hours service. Call ahead for fastest response.",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section
          className="py-6 md:py-8"
          style={{ background: "linear-gradient(to bottom, #005A9C, #2A7FC1)" }}
        >
          <div className={INNER}>
            <Link
              href="/water-haulers/tx"
              className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              All Texas Haulers
            </Link>

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
        </section>

        {/* wave */}
        <div style={{ backgroundColor: "#F8F9FA" }}>
          <WaveDivider topColor="#2A7FC1" />
        </div>

        {/* ── Content ── */}
        <section
          className="py-8 md:py-12"
          style={{ background: "linear-gradient(to bottom, #F8F9FA, #ffffff)" }}
        >
          <div className={INNER}>
            <div className="prose prose-sm max-w-none mb-12">
              <h2 className="font-serif text-2xl font-semibold mb-4" style={{ color: "#333333" }}>
                Quick Answer: Who Delivers Bulk Water in Austin Right Now?
              </h2>
              <p className="text-base text-muted-foreground mb-6">
                These verified haulers serve Austin and surrounding areas. Listings show service type, capacity, and last verification date.
              </p>

              <h3 className="font-semibold text-lg mb-3" style={{ color: "#005A9C" }}>
                Potable Water Delivery
              </h3>
              <p className="text-base text-muted-foreground mb-4">
                Safe drinking water for cisterns, wells, restaurants, healthcare, and special events. TCEQ-compliant sources, sanitized food-grade tanks. Ask about tank sanitization history and backflow prevention.
              </p>

              <h3 className="font-semibold text-lg mb-3" style={{ color: "#005A9C" }}>
                Pool Fills & Non-Potable
              </h3>
              <p className="text-base text-muted-foreground mb-4">
                Residential and commercial pools, landscaping, dust control. Potable or non-potable options. Standard lead time: 24–48 hours. A 20,000-gallon pool requires 3–4 tanker loads and 2–4 hours to fill.
              </p>

              <h3 className="font-semibold text-lg mb-3" style={{ color: "#005A9C" }}>
                Emergency 24/7 Service
              </h3>
              <p className="text-base text-muted-foreground mb-6">
                Boil-water notices, well failures, construction emergencies. Rapid response available. Expect 1.5–2× standard pricing. Call ahead for fastest turnaround.
              </p>

              <h2 className="font-serif text-2xl font-semibold mb-4 mt-8" style={{ color: "#333333" }}>
                Water Hauling Services in Austin
              </h2>

              <h3 className="font-semibold text-lg mb-3" style={{ color: "#005A9C" }}>
                Service Types
              </h3>
              <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground mb-6">
                <li><strong>Potable water:</strong> Safe drinking water for cisterns, wells, restaurants, events. Tank size: 3,000–6,500 gal. Lead time: 24–48 hrs.</li>
                <li><strong>Pool fills:</strong> Residential and commercial. Potable or non-potable. Typical: 3–4 tanker trips per 20K-gal pool. Time: 2–4 hrs.</li>
                <li><strong>Construction/Dust:</strong> Job sites, industrial uses. Large volumes, flexible schedule. Non-potable acceptable.</li>
                <li><strong>Agricultural:</strong> Livestock, irrigation, drought relief. High volume. Flexible timing for season/need.</li>
                <li><strong>Emergency 24/7:</strong> Boil-water, well failure, urgent need. Rate: 1.5–2× standard. Call ahead.</li>
                <li><strong>Oil & Gas/Industrial:</strong> Oilfield work, hydrostatic testing, process water. Non-potable, specialized equipment.</li>
              </ul>

              <h3 className="font-semibold text-lg mb-3" style={{ color: "#005A9C" }}>
                Pricing in Austin: What to Expect
              </h3>
              <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground mb-6">
                <li><strong>Standard load:</strong> Potable $250–$400 (3,000–6,000 gal). Non-potable $150–$300. Price varies by water source, distance, mileage.</li>
                <li><strong>Emergency:</strong> After-hours, weekend, holiday: add 50–100% to standard rate.</li>
                <li><strong>Distance/Access:</strong> Mileage fees, hose-run charges, standby time for difficult access. Clarify site constraints upfront.</li>
                <li><strong>Multiple loads:</strong> Large projects (20K-gal pool, construction): negotiate bulk rates. 3–4 loads often cheaper per-gallon.</li>
              </ul>

              <h3 className="font-semibold text-lg mb-3" style={{ color: "#005A9C" }}>
                TCEQ Compliance Checklist
              </h3>
              <p className="text-base text-muted-foreground mb-3">Before you order, verify these TCEQ requirements for potable water:</p>
              <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground mb-6">
                <li><strong>Approved water source:</strong> Ask hauler: "Is this from a TCEQ-approved municipal source or private well?"</li>
                <li><strong>Tank sanitation:</strong> Request proof of tank cleaning. Food-grade tanks only for potable water.</li>
                <li><strong>Chlorine residuals:</strong> TCEQ may require free chlorine residual (0.2–1.0 ppm). Confirm with your hauler.</li>
                <li><strong>Backflow prevention:</strong> Hauler's equipment must prevent water from flowing back into municipal lines.</li>
                <li><strong>Labeling:</strong> Tank must be labeled "Potable Water" or "Non-Potable" clearly.</li>
                <li><strong>Hauler license:</strong> Verify the hauler's TCEQ permit and insurance. Ask for documentation.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* wave */}
        <div style={{ backgroundColor: "#F0F6FC" }}>
          <WaveDivider topColor="white" />
        </div>

        {/* ── Haulers ── */}
        <section
          className="py-8 md:py-12 scroll-mt-20"
          style={{ background: "linear-gradient(to bottom, #F0F6FC, #ffffff)" }}
        >
          <div className={INNER}>
            {haulers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#005A9C1A" }}
                >
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
        <section
          className="py-8 md:py-12"
          style={{ background: "linear-gradient(to bottom, #ffffff, #F8F9FA)" }}
        >
          <div className={INNER}>
            <div className="rounded-lg bg-white p-8 text-center shadow-sm" style={{ borderTop: "4px solid #005A9C" }}>
              <h2 className="font-serif text-2xl font-semibold mb-2" style={{ color: "#333333" }}>
                Are You a Water Hauler in Austin?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                List your business free and connect with customers looking for bulk water delivery in Austin and surrounding areas.
              </p>
              <Link
                href="/for-haulers"
                className="inline-flex px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90"
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
