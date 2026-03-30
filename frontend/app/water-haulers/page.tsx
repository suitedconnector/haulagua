import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MapPin } from "lucide-react";
import { getAllStatesWithCounts, toStateSlug } from "@/lib/location";

export const metadata: Metadata = {
  title: "Find Water Haulers by State | HaulAgua",
  description:
    "Browse bulk water haulers across the US. Find verified pros for pool fills, construction, potable water delivery, and more in your state.",
  openGraph: {
    title: "Find Water Haulers by State | HaulAgua",
    description:
      "Browse bulk water haulers across the US. Find verified pros for pool fills, construction, and potable water delivery.",
    url: "https://haulagua.com/water-haulers",
    siteName: "HaulAgua",
    type: "website",
  },
};

export default async function WaterHaulersPage() {
  const states = await getAllStatesWithCounts();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="py-14 md:py-20 bg-white border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1
              className="font-serif text-3xl md:text-5xl font-bold"
              style={{ color: "#005A9C" }}
            >
              Find Water Haulers by State
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Browse verified bulk water haulers across the United States. Select your state to find pros near you.
            </p>
          </div>
        </section>

        {/* State grid */}
        <section className="py-14 md:py-20 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {states.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#005A9C1A" }}
                >
                  <MapPin className="w-8 h-8" style={{ color: "#005A9C" }} />
                </div>
                <h2 className="font-serif text-xl font-semibold">No haulers found yet</h2>
                <p className="text-muted-foreground max-w-sm">
                  Check back soon as we grow our directory of verified water haulers.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {states.map(({ abbr, name, count }) => (
                  <Link
                    key={abbr}
                    href={`/water-haulers/${toStateSlug(abbr)}`}
                    className="group bg-white rounded-xl border border-border p-5 text-center hover:shadow-md hover:border-[#005A9C]/40 transition-all"
                  >
                    <p className="font-serif font-bold text-lg text-foreground group-hover:text-[#005A9C] transition-colors">
                      {name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {count} hauler{count !== 1 ? "s" : ""}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
