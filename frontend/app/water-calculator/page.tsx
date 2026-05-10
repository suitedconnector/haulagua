import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import PoolCalculator from "@/components/calculators/PoolCalculator";
import WaterCalculatorQuiz from "@/components/WaterCalculatorQuiz";

export const metadata: Metadata = {
  title:
    "Bulk Water Calculator | Free Pool Gallon Calculator & Water Estimate Tool | HaulAgua",
  description:
    "Free pool gallon calculator and bulk water estimate tool. Calculate exactly how many gallons your pool holds, or estimate water needs for construction, cisterns, agricultural, and emergency delivery. Get matched with local haulers in Texas and Arizona.",
  alternates: {
    canonical: "https://www.haulagua.com/water-calculator",
  },
  openGraph: {
    title: "Bulk Water Calculator | HaulAgua",
    description:
      "Free pool gallon calculator and bulk water estimate tool. Calculate pool gallons or estimate water needs for construction, cisterns, ag, and emergency delivery.",
    url: "https://www.haulagua.com/water-calculator",
    siteName: "HaulAgua",
    type: "website",
  },
};

const HAULER_LINKS = [
  {
    label: "Texas Water Haulers",
    href: "/water-haulers/tx",
    description:
      "Find verified haulers across Texas for pool fills, construction, rural cisterns, and more.",
  },
  {
    label: "Arizona Water Haulers",
    href: "/water-haulers/az",
    description:
      "Browse Arizona's top-rated bulk water haulers for potable delivery, pool fills, and desert property needs.",
  },
  {
    label: "Browse All Haulers",
    href: "/",
    description:
      "Search haulers in your area by zip code, city, or service type — free to use.",
  },
];

const MONTSERRAT = { fontFamily: "var(--font-montserrat, Montserrat, sans-serif)" };
const LATO       = { fontFamily: "var(--font-lato, Lato, sans-serif)" };

export default function WaterCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="bg-white py-12 px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h1
              className="text-3xl font-bold tracking-tight text-[#333333] sm:text-5xl"
              style={MONTSERRAT}
            >
              Bulk Water Calculator
            </h1>
            <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-[#F2A900]" />
            <p
              className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#333333]/70 sm:text-lg"
              style={LATO}
            >
              Estimate exactly how much bulk water you need for your pool fill,
              construction site, cistern, or agricultural use. Free to use —
              no signup required to see your estimate.
            </p>
          </div>
        </section>

        {/* ── Pool Gallon Calculator ── */}
        <section className="bg-[#F8F9FA] px-4 pb-12 sm:px-6 lg:px-8">
          <PoolCalculator />
        </section>

        {/* ── Gold divider ── */}
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <hr className="border-0 h-px bg-[#F2A900] opacity-60" />
          </div>
        </div>

        {/* ── Multi-service assessment ── */}
        <section className="bg-white px-4 pb-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2
              className="text-2xl font-bold text-[#333333] sm:text-3xl"
              style={MONTSERRAT}
            >
              Need help with construction, drinking water, or another use case?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-[#333333]/70" style={LATO}>
              Take our 5-step assessment to estimate water needs across all service
              types and connect with local haulers.
            </p>
          </div>
        </section>
        <section className="bg-[#F8F9FA] py-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <WaterCalculatorQuiz />
          </div>
        </section>

        {/* ── Related links ── */}
        <section className="bg-white py-14 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2
              className="mb-8 text-center text-2xl font-bold text-[#333333] sm:text-3xl"
              style={MONTSERRAT}
            >
              Find Bulk Water Haulers Near You
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {HAULER_LINKS.map(({ label, href, description }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex flex-col rounded-xl border-2 border-[#005A9C]/20 bg-white p-6 transition-all duration-200 hover:border-[#005A9C] hover:shadow-md"
                >
                  <span
                    className="mb-2 text-base font-semibold text-[#005A9C] group-hover:underline"
                    style={MONTSERRAT}
                  >
                    {label}
                  </span>
                  <span className="text-sm leading-relaxed text-[#333333]/70" style={LATO}>
                    {description}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
