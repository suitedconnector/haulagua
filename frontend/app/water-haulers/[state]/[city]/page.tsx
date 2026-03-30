import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HaulerCard } from "@/components/hauler-card";
import { MapPin, ArrowLeft } from "lucide-react";
import {
  STATE_NAMES,
  CITY_INTRO_DEFAULT,
  fromStateSlug,
  fromCitySlug,
  getHaulersByState,
  getHaulersByCity,
  groupHaulersByCity,
  getAllStatesWithCounts,
} from "@/lib/location";

type PageProps = { params: Promise<{ state: string; city: string }> };

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state, city } = await params;
  const abbr = fromStateSlug(state);
  const stateName = STATE_NAMES[state] ?? abbr;
  const cityName = fromCitySlug(city);
  return {
    title: `Water Haulers in ${cityName}, ${stateName} | HaulAgua`,
    description: `Find trusted bulk water haulers in ${cityName}, ${stateName}. Compare verified pros for pool fills, construction, potable water and more.`,
    openGraph: {
      title: `Water Haulers in ${cityName}, ${stateName} | HaulAgua`,
      description: `Find trusted bulk water haulers in ${cityName}, ${stateName}. Compare verified pros for pool fills, construction, potable water and more.`,
      url: `https://haulagua.com/water-haulers/${state}/${city}`,
      siteName: "HaulAgua",
      type: "website",
    },
  };
}

export default async function CityPage({ params }: PageProps) {
  const { state, city } = await params;
  const abbr = fromStateSlug(state);
  const stateName = STATE_NAMES[state] ?? abbr;
  const cityName = fromCitySlug(city);
  const haulers = await getHaulersByCity(abbr, cityName);
  const intro = CITY_INTRO_DEFAULT(cityName, stateName);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="py-12 md:py-16 bg-white border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link
              href={`/water-haulers/${state}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 hover:underline"
              style={{ color: "#005A9C" }}
            >
              <ArrowLeft className="h-4 w-4" />
              All {stateName} Haulers
            </Link>
            <h1
              className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold"
              style={{ color: "#005A9C" }}
            >
              Bulk Water Delivery in {cityName}, {stateName}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{intro}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              {haulers.length} hauler{haulers.length !== 1 ? "s" : ""} found in {cityName}
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {haulers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#005A9C1A" }}
              >
                <MapPin className="w-8 h-8" style={{ color: "#005A9C" }} />
              </div>
              <h2 className="font-serif text-xl font-semibold">No haulers found in {cityName}</h2>
              <p className="text-muted-foreground max-w-sm">
                We don't have any haulers listed in {cityName} yet.{" "}
                <Link href={`/water-haulers/${state}`} className="underline" style={{ color: "#005A9C" }}>
                  Browse all {stateName} haulers
                </Link>{" "}
                or{" "}
                <Link href="/for-haulers" className="underline" style={{ color: "#005A9C" }}>
                  list your business free
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {haulers.map((hauler) => (
                <HaulerCard key={hauler.id} hauler={hauler} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
