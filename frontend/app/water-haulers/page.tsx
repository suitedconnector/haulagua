import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getAllStatesWithCounts } from "@/lib/location";

export const metadata: Metadata = {
  title: "Find Bulk Water Haulers in Your State | Haulagua",
  description:
    "Haulagua is the only directory built specifically for bulk water hauling. Browse verified haulers by state for pool fills, construction water, potable delivery, agricultural use, and more.",
};

// ─── State data ──────────────────────────────────────────────────────────────
const STATE_LIST: { name: string; slug: string; abbr: string }[] = [
  { name: "Alabama", slug: "alabama", abbr: "AL" },
  { name: "Alaska", slug: "alaska", abbr: "AK" },
  { name: "Arizona", slug: "arizona", abbr: "AZ" },
  { name: "Arkansas", slug: "arkansas", abbr: "AR" },
  { name: "California", slug: "california", abbr: "CA" },
  { name: "Colorado", slug: "colorado", abbr: "CO" },
  { name: "Connecticut", slug: "connecticut", abbr: "CT" },
  { name: "Delaware", slug: "delaware", abbr: "DE" },
  { name: "Florida", slug: "florida", abbr: "FL" },
  { name: "Georgia", slug: "georgia", abbr: "GA" },
  { name: "Hawaii", slug: "hawaii", abbr: "HI" },
  { name: "Idaho", slug: "idaho", abbr: "ID" },
  { name: "Illinois", slug: "illinois", abbr: "IL" },
  { name: "Indiana", slug: "indiana", abbr: "IN" },
  { name: "Iowa", slug: "iowa", abbr: "IA" },
  { name: "Kansas", slug: "kansas", abbr: "KS" },
  { name: "Kentucky", slug: "kentucky", abbr: "KY" },
  { name: "Louisiana", slug: "louisiana", abbr: "LA" },
  { name: "Maine", slug: "maine", abbr: "ME" },
  { name: "Maryland", slug: "maryland", abbr: "MD" },
  { name: "Massachusetts", slug: "massachusetts", abbr: "MA" },
  { name: "Michigan", slug: "michigan", abbr: "MI" },
  { name: "Minnesota", slug: "minnesota", abbr: "MN" },
  { name: "Mississippi", slug: "mississippi", abbr: "MS" },
  { name: "Missouri", slug: "missouri", abbr: "MO" },
  { name: "Montana", slug: "montana", abbr: "MT" },
  { name: "Nebraska", slug: "nebraska", abbr: "NE" },
  { name: "Nevada", slug: "nevada", abbr: "NV" },
  { name: "New Hampshire", slug: "new-hampshire", abbr: "NH" },
  { name: "New Jersey", slug: "new-jersey", abbr: "NJ" },
  { name: "New Mexico", slug: "new-mexico", abbr: "NM" },
  { name: "New York", slug: "new-york", abbr: "NY" },
  { name: "North Carolina", slug: "north-carolina", abbr: "NC" },
  { name: "North Dakota", slug: "north-dakota", abbr: "ND" },
  { name: "Ohio", slug: "ohio", abbr: "OH" },
  { name: "Oklahoma", slug: "oklahoma", abbr: "OK" },
  { name: "Oregon", slug: "oregon", abbr: "OR" },
  { name: "Pennsylvania", slug: "pennsylvania", abbr: "PA" },
  { name: "Rhode Island", slug: "rhode-island", abbr: "RI" },
  { name: "South Carolina", slug: "south-carolina", abbr: "SC" },
  { name: "South Dakota", slug: "south-dakota", abbr: "SD" },
  { name: "Tennessee", slug: "tennessee", abbr: "TN" },
  { name: "Texas", slug: "texas", abbr: "TX" },
  { name: "Utah", slug: "utah", abbr: "UT" },
  { name: "Vermont", slug: "vermont", abbr: "VT" },
  { name: "Virginia", slug: "virginia", abbr: "VA" },
  { name: "Washington", slug: "washington", abbr: "WA" },
  { name: "West Virginia", slug: "west-virginia", abbr: "WV" },
  { name: "Wisconsin", slug: "wisconsin", abbr: "WI" },
  { name: "Wyoming", slug: "wyoming", abbr: "WY" },
];

// ─── FAQ data ─────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "How do I find bulk water haulers near me?",
    a: "Select your state from the list above to browse verified haulers in your area. Each listing shows the hauler's service area so you can confirm they cover your location. For the most precise results, use our search and enter your city or ZIP code directly.",
  },
  {
    q: "What states does Haulagua cover?",
    a: "Haulagua is currently live in Texas and Arizona, with haulers verified and listed in both states. We're actively expanding — Florida, California, Colorado, and Nevada are next on our roadmap. Select your state above to be notified when haulers are listed near you.",
  },
  {
    q: "What is bulk water hauling used for?",
    a: "Bulk water hauling serves a wide range of needs. The most common uses are swimming pool fills and top-offs, construction site water for dust control and compaction, potable drinking water delivery for homes and businesses off the municipal grid, agricultural water for livestock and irrigation, emergency water supply during droughts or infrastructure failures, and water for events and recreational use. Some haulers also serve the oil and gas industry.",
  },
  {
    q: "How much does bulk water delivery cost?",
    a: "Costs vary depending on your location, the volume of water needed, and the type of water (potable vs. non-potable). Most haulers charge a minimum fee — typically $150 to $400 — plus a per-gallon or per-load rate. Each hauler profile on Haulagua shows their minimum fee where available. We always recommend getting quotes from two or three haulers before booking.",
  },
  {
    q: "Are the haulers on Haulagua verified?",
    a: "Haulagua lists haulers we've researched and confirmed are actively operating in their service area. Verified Pro haulers have completed an additional review of their insurance, licensing, and equipment. Look for the Verified Pro badge on hauler profiles for added confidence.",
  },
];

// ─── JSON-LD schema ───────────────────────────────────────────────────────────
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

// ─── Page component ───────────────────────────────────────────────────────────
export default async function WaterHaulersPage() {
  const stateCounts = await getAllStatesWithCounts();
  const countByAbbr = Object.fromEntries(
    stateCounts.map(({ abbr, count }) => [abbr.toUpperCase(), count])
  );

  const STATES = STATE_LIST.map((s) => {
    const count = countByAbbr[s.abbr] ?? 0;
    return {
      ...s,
      haulerCount: count > 0 ? count : undefined,
      status: (count > 0 ? "live" : "soon") as "live" | "soon",
    };
  });

  const liveCount = STATES.filter((s) => s.status === "live").length;
  const totalHaulers = STATES.reduce((sum, s) => sum + (s.haulerCount ?? 0), 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
      {/* JSON-LD FAQ schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#0461AA] pt-16 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-montserrat text-4xl md:text-5xl font-bold text-white mb-4 leading-tighter">
            Find Bulk Water Haulers   
            <br className="hidden md:block" />
            in Your State
          </h1>
          <p className="font-lato text-lg text-blue-100 mb-3 max-w-2xl mx-auto">
            Haulagua is the most comprehensive directory built exclusively for bulk water
            hauling. Browse bulk water haulers across the USA — select
            your state to find pros near you.
          </p>

          {/* Live stat 
          <p className="font-lato text-sm text-blue-200 mb-10">
            {totalHaulers}+ verified haulers across {liveCount}{" "}
            {liveCount === 1 ? "state" : "states"} · expanding nationwide
          </p> */}

          {/* ── State list ─────────────────────────────────────────────── */}
          <div className="flex flex-wrap justify-center gap-x-1 gap-y-2 max-w-3xl mx-auto">
            {STATES.map((state, i) => {
              const isLast = i === STATES.length - 1;
              if (state.status === "live") {
                return (
                  <span key={state.slug} className="inline-flex items-center">
                    <Link
                      href={`/water-haulers/${state.abbr.toLowerCase()}`}
                      className="font-lato font-bold text-white underline underline-offset-2 decoration-[#F2A900] hover:text-[#F2A900] transition-colors"
                    >
                      {state.name}
                      <span className="ml-1.5 inline-flex items-center rounded-full bg-[#F2A900] px-2 py-0.5 text-xs font-semibold text-[#5a3d00] no-underline">
                        {state.haulerCount}
                      </span>
                    </Link>
                    {!isLast && (
                      <span className="ml-1 text-blue-300 select-none">·</span>
                    )}
                  </span>
                );
              }
              // coming soon — plain muted text, no link
              return (
                <span key={state.slug} className="inline-flex items-center">
                  <span className="font-lato text-blue-300 text-sm">
                    {state.name}
                  </span>
                  {!isLast && (
                    <span className="ml-1 text-blue-400 select-none">·</span>
                  )}
                </span>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-blue-200">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#F2A900]" />
              Haulers listed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-400/60" />
              Coming soon
            </span>
          </div>
        </div>
      </section>

      {/* ── SEO body copy ───────────────────────────────────────────────────── */}
      <section className="bg-white py-16 px-4">
        <article className="max-w-3xl mx-auto font-lato text-[#333333]">
          <h2 className="font-montserrat text-2xl font-bold text-[#0461AA] mb-6">
            What is bulk water hauling?
          </h2>
          <p className="text-base leading-relaxed mb-5">
            Bulk water hauling (aka bulk water delivery) is the delivery of large volumes of water by
            truck — typically 1,000 to 10,000 gallons per load — to locations
            that don&apos;t have access to a municipal supply or need more water
            than a tap can provide. It&apos;s one of the most essential and
            least talked-about industries in America. New pool owners need it
            for their first fill. Construction crews need it for dust control
            and soil compaction. Rural homeowners with dry wells or low cisterns
            depend on it to keep their families supplied with safe drinking
            water. Farmers and ranchers need it for livestock through a dry
            summer. When disasters strike, emergency responders rely on it to
            keep communities running.
          </p>
          <p className="text-base leading-relaxed mb-5">
            Until now, finding a bulk water hauler meant digging through Google
            results, calling numbers that went nowhere, and hoping whoever
            showed up had the right equipment for your job. There was no
            dedicated directory — no way to filter by service type, truck
            capacity, or water source. Haulagua was built to fix that. We verify
            haulers, document their specs, and make it easy to find the right
            pro for your specific job — whether that&apos;s a 5,000-gallon pool
            fill in Austin or emergency potable water delivery in rural Arizona.
          </p>
          <p className="text-base leading-relaxed">
            Select your state above to browse verified haulers in your area.
            Each hauler profile shows the services they offer, their truck
            capacity, hose length, minimum fee, and water source — everything
            you need to make a confident decision before you pick up the phone.
            We&apos;re currently live in Texas and Arizona, with more states
            coming soon.
          </p>
        </article>
      </section>

      {/* ── Service categories ──────────────────────────────────────────────── */}
      <section className="bg-[#F8F9FA] py-12 px-4 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-montserrat text-xl font-bold text-[#333333] mb-6 text-center">
            Services covered
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              { icon: "🏊", label: "Pool fills" },
              { icon: "🏗️", label: "Construction & dust control" },
              { icon: "🚰", label: "Potable water" },
              { icon: "🌾", label: "Agricultural & livestock" },
              { icon: "🚨", label: "Emergency response" },
              { icon: "🎪", label: "Events" },
              { icon: "🛢️", label: "Oil & gas" },
              { icon: "🏠", label: "Cisterns & tanks" },
            ].map((svc) => (
              <div
                key={svc.label}
                className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-center"
              >
                <span className="text-2xl block mb-1">{svc.icon}</span>
                <span className="font-lato text-sm text-[#333333]">
                  {svc.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-montserrat text-2xl font-bold text-[#0461AA] mb-8">
            Frequently asked questions
          </h2>
          <div className="divide-y divide-gray-100">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group py-4 cursor-pointer list-none"
              >
                <summary className="font-montserrat font-semibold text-[#333333] text-base flex items-center justify-between gap-4 marker:hidden [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span className="text-[#0461AA] shrink-0 text-xl leading-none group-open:rotate-45 transition-transform duration-200">
                    +
                  </span>
                </summary>
                <p className="font-lato text-[#333333] text-sm leading-relaxed mt-3">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hauler CTA ──────────────────────────────────────────────────────── */}
      <section className="bg-[#0461AA] py-14 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-montserrat text-2xl font-bold text-white mb-3">
            Are you a water hauler?
          </h2>
          <p className="font-lato text-blue-100 mb-6">
            Get your business in front of customers actively searching for bulk
            water delivery in your area. Free listings available now.
          </p>
          <Link
            href="/for-haulers"
            className="inline-block bg-[#F2A900] hover:bg-[#d99500] text-[#333333] font-montserrat font-bold px-8 py-3 rounded-lg transition-colors"
          >
            List your business →
          </Link>
        </div>
      </section>
      </main>
      <Footer />
    </div>
  );
}