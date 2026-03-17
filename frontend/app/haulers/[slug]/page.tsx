import { notFound } from "next/navigation";
import Link from "next/link";
import { strapiGet } from "@/src/lib/strapi";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ContactPanel } from "./ContactPanel";
import {
  CheckCircle2,
  Truck,
  Ruler,
  Droplets,
  DollarSign,
  MapPin,
  ChevronLeft,
  ImageIcon,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type StrapiService = {
  id: number;
  attributes: {
    type: string;
    waterSource: string | null;
    truckCapacity: number | null;
    hoseLength: number | null;
  };
};

type StrapiCaseStudy = {
  id: number;
  attributes: {
    title: string;
    description: string | null;
  };
};

type StrapiHauler = {
  id: number;
  attributes: {
    name: string;
    slug: string;
    description: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    address: string | null;
    city: string;
    state: string;
    zip: string | null;
    serviceArea: string | null;
    minFee: number | null;
    truckCapacity: number | null;
    hoseLength: number | null;
    waterType: "potable" | "non-potable" | "both";
    isVerifiedPro: boolean;
    industries: string[] | null;
    services: { data: StrapiService[] };
    caseStudies: { data: StrapiCaseStudy[] };
  };
};

type StrapiResponse = {
  data: StrapiHauler[];
  meta: { pagination: { total: number } };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SERVICE_LABEL: Record<string, string> = {
  pool: "Swimming Pool",
  construction: "Construction",
  potable: "Potable Water",
  agricultural: "Agricultural",
  emergency: "Emergency",
  events: "Events",
};

const SERVICE_ICON: Record<string, string> = {
  pool: "🏊",
  construction: "🏗️",
  potable: "🚰",
  agricultural: "🌾",
  emergency: "🚨",
  events: "🎉",
};

const INDUSTRY_LABEL: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  agricultural: "Agricultural",
  "oil-gas": "Oil & Gas",
  municipal: "Municipal",
  "emergency-management": "Emergency Mgmt",
};

const INDUSTRY_COLOR: Record<string, string> = {
  residential: "bg-sky-100 text-sky-800",
  commercial: "bg-indigo-100 text-indigo-800",
  agricultural: "bg-lime-100 text-lime-800",
  "oil-gas": "bg-yellow-100 text-yellow-800",
  municipal: "bg-teal-100 text-teal-800",
  "emergency-management": "bg-red-100 text-red-800",
};

const WATER_TYPE_LABEL: Record<string, string> = {
  potable: "Potable",
  "non-potable": "Non-Potable",
  both: "Potable & Non-Potable",
};

// ─── Photo Gallery Placeholder ────────────────────────────────────────────────

function GalleryPlaceholder() {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="col-span-2 row-span-2 bg-muted rounded-xl flex flex-col items-center justify-center h-48 border border-border">
        <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground mt-2">Primary Photo</p>
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="bg-muted rounded-xl flex items-center justify-center h-24 border border-border">
          <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const data = await strapiGet<StrapiResponse>({
      path: "/haulers",
      params: {
        "filters[slug][$eq]": slug,
        "populate[services][fields][0]": "type",
        "pagination[pageSize]": "1",
      },
      cache: "force-cache",
      tags: [`hauler-${slug}`],
    });
    const hauler = data.data?.[0];
    if (!hauler) return {};
    const a = hauler.attributes;
    return {
      title: `${a.name} — Bulk Water Hauling in ${a.city}, ${a.state} | Haulagua`,
      description: a.description?.slice(0, 160) ?? `${a.name} provides bulk water hauling services in ${a.city}, ${a.state}.`,
    };
  } catch {
    return {};
  }
}

export default async function HaulerProfilePage({ params }: PageProps) {
  const { slug } = await params;

  let hauler: StrapiHauler | null = null;

  try {
    const data = await strapiGet<StrapiResponse>({
      path: "/haulers",
      params: {
        "filters[slug][$eq]": slug,
        "populate[services][fields][0]": "type",
        "populate[services][fields][1]": "waterSource",
        "populate[services][fields][2]": "truckCapacity",
        "populate[services][fields][3]": "hoseLength",
        "populate[caseStudies][fields][0]": "title",
        "populate[caseStudies][fields][1]": "description",
        "pagination[pageSize]": "1",
      },
      cache: "no-store",
    });
    hauler = data.data?.[0] ?? null;
  } catch {
    notFound();
  }

  if (!hauler) notFound();

  const a = hauler.attributes;
  const services = a.services?.data ?? [];
  const caseStudies = a.caseStudies?.data ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <span>/</span>
              <Link href="/search" className="hover:text-foreground">Find Haulers</Link>
              <span>/</span>
              <span className="text-foreground font-medium truncate">{a.name}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back link */}
          <Link
            href="/search"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 group"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to results
          </Link>

          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* ── LEFT (70%) ── */}
            <div className="flex-[7] min-w-0 space-y-8">
              {/* Header */}
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="font-serif text-3xl font-bold text-foreground">{a.name}</h1>
                  {a.isVerifiedPro && (
                    <span className="inline-flex items-center gap-1.5 bg-accent/20 text-amber-700 text-sm font-medium px-3 py-1 rounded-full">
                      <CheckCircle2 className="h-4 w-4" />
                      Verified Pro
                    </span>
                  )}
                </div>
                <p className="flex items-center gap-1.5 text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  {a.address ? `${a.address}, ` : ""}{a.city}, {a.state} {a.zip}
                </p>
                {a.industries && a.industries.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {a.industries.map((ind) => (
                      <span
                        key={ind}
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${INDUSTRY_COLOR[ind] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {INDUSTRY_LABEL[ind] ?? ind}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Photo Gallery */}
              <section>
                <GalleryPlaceholder />
              </section>

              {/* About */}
              {a.description && (
                <section>
                  <h2 className="font-serif text-xl font-bold mb-3">About</h2>
                  <p className="text-foreground/80 leading-relaxed">{a.description}</p>
                  {a.serviceArea && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Service area:</span>{" "}
                      {a.serviceArea}
                    </p>
                  )}
                </section>
              )}

              {/* Services */}
              {services.length > 0 && (
                <section>
                  <h2 className="font-serif text-xl font-bold mb-4">Services Offered</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {services.map((s) => (
                      <div
                        key={s.id}
                        className="bg-white border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{SERVICE_ICON[s.attributes.type] ?? "💧"}</span>
                          <h3 className="font-semibold">
                            {SERVICE_LABEL[s.attributes.type] ?? s.attributes.type}
                          </h3>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {s.attributes.waterSource && (
                            <p>
                              <span className="text-foreground font-medium">Source:</span>{" "}
                              {s.attributes.waterSource}
                            </p>
                          )}
                          {s.attributes.truckCapacity && (
                            <p>
                              <span className="text-foreground font-medium">Capacity:</span>{" "}
                              {s.attributes.truckCapacity.toLocaleString()} gal
                            </p>
                          )}
                          {s.attributes.hoseLength && (
                            <p>
                              <span className="text-foreground font-medium">Hose:</span>{" "}
                              {s.attributes.hoseLength} ft
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Case Studies */}
              {caseStudies.length > 0 && (
                <section>
                  <h2 className="font-serif text-xl font-bold mb-4">Case Studies</h2>
                  <div className="space-y-4">
                    {caseStudies.map((cs) => (
                      <div
                        key={cs.id}
                        className="bg-white border border-border rounded-xl p-5 border-l-4 border-l-primary"
                      >
                        <h3 className="font-serif font-semibold text-base mb-2">
                          {cs.attributes.title}
                        </h3>
                        {cs.attributes.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {cs.attributes.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* ── RIGHT (30%) ── */}
            <div className="flex-[3] min-w-0 lg:max-w-xs space-y-5 lg:sticky lg:top-6 lg:self-start">
              {/* Contact Card */}
              <div className="bg-white rounded-xl border border-border shadow-sm p-5">
                <h2 className="font-serif font-bold text-base mb-4">Contact</h2>
                <ContactPanel phone={a.phone} website={a.website} name={a.name} />
                {a.email && (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    or email{" "}
                    <a href={`mailto:${a.email}`} className="underline hover:text-foreground">
                      {a.email}
                    </a>
                  </p>
                )}
              </div>

              {/* At-a-Glance Specs */}
              <div className="bg-white rounded-xl border border-border shadow-sm p-5">
                <h2 className="font-serif font-bold text-base mb-4">At a Glance</h2>
                <dl className="space-y-3">
                  {a.minFee != null && (
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        Starting fee
                      </dt>
                      <dd className="font-semibold text-primary">${a.minFee}</dd>
                    </div>
                  )}
                  {a.truckCapacity != null && (
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Truck className="h-4 w-4" />
                        Truck capacity
                      </dt>
                      <dd className="font-semibold">{a.truckCapacity.toLocaleString()} gal</dd>
                    </div>
                  )}
                  {a.hoseLength != null && (
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Ruler className="h-4 w-4" />
                        Hose length
                      </dt>
                      <dd className="font-semibold">{a.hoseLength} ft</dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Droplets className="h-4 w-4" />
                      Water type
                    </dt>
                    <dd className="font-semibold text-sm">{WATER_TYPE_LABEL[a.waterType] ?? a.waterType}</dd>
                  </div>
                </dl>
              </div>

              {/* Verified Pro Badge Card */}
              {a.isVerifiedPro && (
                <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-amber-800">Verified Pro</p>
                    <p className="text-xs text-amber-700/80 mt-0.5">
                      This hauler has been verified by the Haulagua team for licensing, insurance, and quality standards.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
