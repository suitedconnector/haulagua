import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
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
  getAllStatesWithCounts,
} from "@/lib/location";
import cityPhotoCache from "@/data/city-photos.json";

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

type CityWithPhoto = {
  city: string;
  slug: string;
  count: number;
  photo: string | null;
};

export default async function StatePage({ params }: PageProps) {
  const { state } = await params;
  const abbr = fromStateSlug(state);
  const stateName = STATE_NAMES[state] ?? abbr;
  const haulers = await getHaulersByState(abbr);
  const cities = groupHaulersByCity(haulers);
  const intro = STATE_INTROS[state] ?? STATE_INTRO_DEFAULT;

  // Look up city photos from local cache — zero API calls at runtime
  const cache = cityPhotoCache as Record<string, string>;
  const citiesWithPhotos: CityWithPhoto[] = cities.map(({ city, slug, count }) => ({
    city,
    slug,
    count,
    photo: cache[`${city}|${abbr}`] ?? null,
  }));

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

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-14">

          {/* City photo grid */}
          {citiesWithPhotos.length > 0 && (
            <div>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                Browse by City
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {citiesWithPhotos.map(({ city, slug, count, photo }) => (
                  <Link
                    key={city}
                    href={`/water-haulers/${state}/${slug}`}
                    className="group rounded-xl overflow-hidden border border-border hover:shadow-md hover:border-[#005A9C]/40 transition-all bg-white"
                  >
                    {/* Photo or fallback */}
                    <div className="relative h-40 w-full overflow-hidden">
                      {photo ? (
                        <Image
                          src={photo}
                          alt={`Bulk water delivery in ${city}, ${stateName}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: "#005A9C" }}
                        />
                      )}
                      {/* Gradient overlay for sign readability */}
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.65) 100%)" }} />
                      {/* Wave */}
                      <svg viewBox="0 0 390 44" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full" style={{ height: "44px" }} xmlns="http://www.w3.org/2000/svg">
                        <path d="M0,44 L0,28 C30,18 60,10 97,18 C134,26 160,38 195,38 C230,38 256,26 293,18 C330,10 360,18 390,28 L390,44 Z" fill="#0461AA" opacity="0.7"/>
                        <path d="M0,44 L0,34 C40,24 80,16 130,24 C180,32 210,40 260,36 C310,32 350,24 390,32 L390,44 Z" fill="#0461AA"/>
                      </svg>
                      {/* City welcome sign overlay */}
                      <div className="absolute inset-0 flex items-end justify-center pointer-events-none" style={{ paddingBottom: "0" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <div style={{
                            backgroundColor: "#2d6e2d",
                            border: "4px solid white",
                            borderRadius: "6px",
                            padding: "8px 18px",
                            textAlign: "center",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                            minWidth: "160px",
                            maxWidth: "88%",
                          }}>
                            <p style={{ color: "white", fontSize: "9px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "2px" }}>
                              Welcome to
                            </p>
                            <p style={{ color: "white", fontSize: "20px", fontWeight: 800, lineHeight: 1.1, fontFamily: "Georgia, serif" }}>
                              {city}
                            </p>
                            <p style={{ color: "white", fontSize: "9px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginTop: "2px" }}>
                              {stateName}
                            </p>
                          </div>
                          {/* Post */}
                          <div style={{ width: "8px", height: "28px", backgroundColor: "#a0a0a0", boxShadow: "inset -2px 0 3px rgba(0,0,0,0.2)" }} />
                        </div>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: "#0461AA" }}>
                      <p className="text-sm font-bold text-white">
                        {count} hauler{count !== 1 ? "s" : ""}
                      </p>
                      <i className="fa-solid fa-truck-droplet" style={{ color: "white", fontSize: "18px", opacity: 0.85 }} />
                    </div>
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
