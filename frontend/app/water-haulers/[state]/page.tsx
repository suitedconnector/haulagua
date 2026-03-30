import type { Metadata } from "next";
import Link from "next/link";
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
  toCitySlug,
  getAllStatesWithCounts,
} from "@/lib/location";

type PageProps = { params: Promise<{ state: string }> };

export async function generateStaticParams() {
  const states = await getAllStatesWithCounts();
  return states.map(({ abbr }) => ({ state: abbr.toLowerCase() }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state } = await params;
  const abbr = fromStateSlug(state);
  const name = STATE_NAMES[state] ?? abbr;
  return {
    title: `Water Haulers in ${name} | HaulAgua`,
    description: `Find trusted bulk water haulers in ${name}. Compare verified pros for pool fills, construction, potable water and more.`,
    openGraph: {
      title: `Water Haulers in ${name} | HaulAgua`,
      description: `Find trusted bulk water haulers in ${name}. Compare verified pros for pool fills, construction, potable water and more.`,
      url: `https://haulagua.com/water-haulers/${state}`,
      siteName: "HaulAgua",
      type: "website",
    },
  };
}

export default async function StatePage({ params }: PageProps) {
  const { state } = await params;
  const abbr = fromStateSlug(state);
  const stateName = STATE_NAMES[state] ?? abbr;
  const haulers = await getHaulersByState(abbr);
  const cities = groupHaulersByCity(haulers);
  const intro = STATE_INTROS[state] ?? STATE_INTRO_DEFAULT;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
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
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{intro}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              {haulers.length} hauler{haulers.length !== 1 ? "s" : ""} found in {stateName}
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
          {/* Cities */}
          {cities.length > 0 && (
            <div>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                Browse by City
              </h2>
              <div className="flex flex-wrap gap-3">
                {cities.map(({ city, slug, count }) => (
                  <Link
                    key={city}
                    href={`/water-haulers/${state}/${slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-white hover:border-[#005A9C] hover:text-[#005A9C] transition-colors text-sm font-medium text-foreground"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    {city}
                    <span className="text-muted-foreground ml-1">({count})</span>
                  </Link>
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
