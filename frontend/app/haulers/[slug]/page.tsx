import { notFound } from "next/navigation";
import Link from "next/link";
import { TRUCK_PLACEHOLDERS, getPlaceholderImage } from "@/src/lib/placeholders";
import { toCitySlug, fromCitySlug, STATE_NAMES } from "@/lib/location";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ContactPanel } from "./ContactPanel";
import { ReviewForm } from "./ReviewForm";
import haulersData from "@/data/haulers-flat.json";
import {
  CheckCircle2,
  Truck,
  Ruler,
  Droplets,
  DollarSign,
  MapPin,
  ChevronLeft,
  ShieldAlert,
  Shield,
  Star,
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
  id?: number;
  name: string;
  slug: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  city: string;
  state: string;
  zip?: string | null;
  serviceArea?: string | null;
  minFee?: number | null;
  truckCapacity?: number | null | string;
  hoseLength?: number | null;
  waterType?: "potable" | "non-potable" | "both";
  isVerifiedPro: boolean;
  isClaimed: boolean;
  yearFounded?: number | null;
  insuranceVerified?: boolean;
  certification?: string | null;
  insuranceCertificate?: string | null;
  industries?: string[] | null;
  services?: { data: StrapiService[] };
  caseStudies?: { data: StrapiCaseStudy[] };
  ada?: boolean | null;
  lgbtqFriendly?: boolean | null;
  veteranOwned?: boolean | null;
  womenOwned?: boolean | null;
  hours?: string | null;
  plusCode?: string | null;
  isActive?: boolean;
  isClaimed?: boolean;
};

// ─── Static data ──────────────────────────────────────────────────────────────

const allHaulers = haulersData as StrapiHauler[];

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

// ─── Star Rating Display ──────────────────────────────────────────────────────

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          style={{
            width: size,
            height: size,
            fill: s <= rating ? "#F2A900" : "transparent",
            stroke: s <= rating ? "#F2A900" : "#d1d5db",
          }}
        />
      ))}
    </span>
  );
}

// ─── Photo Gallery ────────────────────────────────────────────────────────────

function GalleryPlaceholder({ name, city, state, slug }: { name: string; city: string; state: string; slug: string }) {
  const primary = getPlaceholderImage(slug);
  const secondary = TRUCK_PLACEHOLDERS[(slug.length + 1) % TRUCK_PLACEHOLDERS.length];
  const tertiary = TRUCK_PLACEHOLDERS[(slug.length + 2) % TRUCK_PLACEHOLDERS.length];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "60% 40%", gap: "8px", height: "320px" }}>
      <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden" }}>
        <img src={primary} alt={`${name} - bulk water delivery in ${city}, ${state}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: "8px", height: "100%" }}>
        <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden" }}>
          <img src={secondary} alt={`${name} - water truck and equipment`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden" }}>
          <img src={tertiary} alt={`${name} - service area and operations`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type PageProps = { params: Promise<{ slug: string }>; searchParams: Promise<{ ref?: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const hauler = allHaulers.find((h) => h.slug === slug) ?? null;
  if (!hauler) return {};
  const title = `${hauler.name} in ${hauler.city}, ${hauler.state}`;
  const description = hauler.description?.slice(0, 160) ?? `${hauler.name} provides bulk water hauling services in ${hauler.city}, ${hauler.state}.`;
  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://www.haulaguhauler.com/haulers/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.haulaguhauler.com/haulers/${slug}`,
      siteName: "Haulagua",
      type: "profile",
    },
  };
}

export default async function HaulerProfilePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { ref } = await searchParams;

  const hauler = allHaulers.find((h) => h.slug === slug) ?? null;
  if (!hauler) notFound();

  const services = hauler.services?.data ?? [];
  const caseStudies = hauler.caseStudies?.data ?? [];
  const approvedReviews: never[] = []; // Reviews not yet in static data
  const avgRating = null;

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
              <Link href="/water-haulers" className="hover:text-foreground">Water Haulers</Link>
              <span>/</span>
              <Link href={`/water-haulers/${hauler.state.toLowerCase()}`} className="hover:text-foreground">{hauler.state}</Link>
              <span>/</span>
              <Link href={`/water-haulers/${hauler.state.toLowerCase()}/${toCitySlug(hauler.city)}`} className="hover:text-foreground">{hauler.city}</Link>
              <span>/</span>
              <span className="text-foreground font-medium truncate">{hauler.name}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {(() => {
            let backHref = "/search";
            let backLabel = "Back to results";
            if (ref && ref.startsWith("/water-haulers/")) {
              backHref = ref;
              const parts = ref.split("/").filter(Boolean);
              if (parts.length === 2) {
                const stateName = STATE_NAMES[parts[1]] ?? parts[1].toUpperCase();
                backLabel = `All ${stateName} Haulers`;
              } else if (parts.length >= 3) {
                backLabel = `Back to ${fromCitySlug(parts[2])}`;
              }
            }
            return (
              <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 group">
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                {backLabel}
              </Link>
            );
          })()}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* ── LEFT (70%) ── */}
            <div className="flex-[7] min-w-0 space-y-8">
              {/* Header */}
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="font-serif text-3xl font-bold text-foreground">{hauler.name}</h1>
                  {hauler.isVerifiedPro && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: "#F2A900", color: "#fff" }}>
                      <CheckCircle2 className="h-4 w-4" />
                      Verified Pro
                    </span>
                  )}
                  {!hauler.isClaimed && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Unclaimed
                    </span>
                  )}
                  {hauler.ada && <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">♿ ADA Accessible</span>}
                  {hauler.lgbtqFriendly && <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">🏳️‍🌈 LGBTQ+ Friendly</span>}
                  {hauler.veteranOwned && <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-700">🎖️ Veteran Owned</span>}
                  {hauler.womenOwned && <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-pink-100 text-pink-700">⚡ Women Owned</span>}
                </div>
                <p className="flex items-center gap-1.5 text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  {hauler.address ? `${hauler.address}, ` : ""}{hauler.city}, {hauler.state} {hauler.zip}
                </p>
                {hauler.plusCode && (
                  <a href={`https://plus.codes/${hauler.plusCode}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#005A9C] mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {hauler.plusCode} (Open in Maps)
                  </a>
                )}
                {hauler.industries && hauler.industries.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {hauler.industries.map((ind) => (
                      <span key={ind} className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${INDUSTRY_COLOR[ind] ?? "bg-gray-100 text-gray-700"}`}>
                        {INDUSTRY_LABEL[ind] ?? ind}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Photo Gallery */}
              <section className="mb-6">
                <GalleryPlaceholder name={hauler.name} city={hauler.city} state={hauler.state} slug={hauler.slug} />
              </section>

              {/* About */}
              {hauler.description && (
                <section>
                  <h2 className="font-serif text-xl font-bold mb-3">About</h2>
                  <p className="text-foreground/80 leading-relaxed">{hauler.description}</p>
                  {hauler.serviceArea && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Service area:</span> {hauler.serviceArea}
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
                      <div key={s.id} className="bg-white border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{SERVICE_ICON[s.type] ?? "💧"}</span>
                          <h3 className="font-semibold">{SERVICE_LABEL[s.type] ?? s.type}</h3>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {s.waterSource && <p><span className="text-foreground font-medium">Source:</span> {s.waterSource}</p>}
                          {s.truckCapacity && <p><span className="text-foreground font-medium">Capacity:</span> {typeof s.truckCapacity === "string" ? s.truckCapacity : s.truckCapacity.toLocaleString()} gal</p>}
                          {s.hoseLength && <p><span className="text-foreground font-medium">Hose:</span> {s.hoseLength} ft</p>}
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
                      <div key={cs.id} className="bg-white border border-border rounded-xl p-5 border-l-4 border-l-primary">
                        <h3 className="font-serif font-semibold text-base mb-2">{cs.title}</h3>
                        {cs.description && <p className="text-sm text-muted-foreground leading-relaxed">{cs.description}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Reviews */}
              <section>
                <ReviewForm haulerSlug={slug} />
              </section>
            </div>

            {/* ── RIGHT (30%) ── */}
            <div className="flex-[3] min-w-0 lg:max-w-xs space-y-5 lg:sticky lg:top-6 lg:self-start">
              <div className="bg-white rounded-xl border border-border shadow-sm p-5">
                <h2 className="font-serif font-bold text-base mb-4">Contact</h2>
                <ContactPanel phone={hauler.phone} website={hauler.website} email={hauler.email ?? null} name={hauler.name} slug={hauler.slug} isClaimed={hauler.isClaimed} />
                {hauler.email && (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    or email <a href={`mailto:${hauler.email}`} className="underline hover:text-foreground">{hauler.email}</a>
                  </p>
                )}
              </div>

              <div className="bg-white rounded-xl border border-border shadow-sm p-5">
                <h2 className="font-serif font-bold text-base mb-4">At a Glance</h2>
                <dl className="space-y-3">
                  {hauler.yearFounded != null && (
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />Year founded</dt>
                      <dd className="font-semibold">{hauler.yearFounded}</dd>
                    </div>
                  )}
                  {hauler.serviceArea && (
                    <div className="flex items-start justify-between gap-2">
                      <dt className="flex items-center gap-2 text-sm text-muted-foreground shrink-0"><MapPin className="h-4 w-4" />Service area</dt>
                      <dd className="font-semibold text-sm text-right">{hauler.serviceArea}</dd>
                    </div>
                  )}
                  {hauler.minFee != null && (
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-2 text-sm text-muted-foreground"><DollarSign className="h-4 w-4" />Starting fee</dt>
                      <dd className="font-semibold text-primary">${hauler.minFee}</dd>
                    </div>
                  )}
                  {hauler.truckCapacity != null && (
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-2 text-sm text-muted-foreground"><Truck className="h-4 w-4" />Truck capacity</dt>
                      <dd className="font-semibold">{typeof hauler.truckCapacity === "string" ? hauler.truckCapacity : hauler.truckCapacity.toLocaleString()} gal</dd>
                    </div>
                  )}
                  {hauler.hoseLength != null && (
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-2 text-sm text-muted-foreground"><Ruler className="h-4 w-4" />Hose length</dt>
                      <dd className="font-semibold">{hauler.hoseLength} ft</dd>
                    </div>
                  )}
                  {hauler.certification && (
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-2 text-sm text-muted-foreground"><Shield className="h-4 w-4" />Certification</dt>
                      <dd className="font-semibold text-sm text-right">{hauler.certification}</dd>
                    </div>
                  )}
                  {hauler.hours && (
                    <div className="flex items-start justify-between gap-2">
                      <dt className="text-sm text-muted-foreground shrink-0">🕐 Hours</dt>
                      <dd className="text-sm text-right">
                        {hauler.hours.split(/(?=Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/).map((line, i) => (
                          <div key={i}>{line.trim()}</div>
                        ))}
                      </dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-2 text-sm text-muted-foreground"><Droplets className="h-4 w-4" />Water type</dt>
                    <dd className="font-semibold text-sm">{WATER_TYPE_LABEL[hauler.waterType] ?? hauler.waterType}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4" />Insurance</dt>
                    <dd className="font-semibold text-sm">
                      {hauler.insuranceCertificate ? (
                        <a href={hauler.insuranceCertificate} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Verified</a>
                      ) : (
                        <span className="text-muted-foreground">Unverified</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              {!hauler.isClaimed && (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#333333]">Is this your business?</p>
                      <p className="text-xs text-gray-500 mt-0.5 mb-3">Claim this listing to update your info, add photos, and manage your profile.</p>
                      <Link href={`/haulers/${hauler.slug}/claim`} className="inline-flex items-center justify-center w-full rounded-lg border-2 border-[#005A9C] text-[#005A9C] text-sm font-semibold py-2 px-4 hover:bg-[#005A9C] hover:text-white transition-colors">
                        Claim This Listing
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {hauler.isVerifiedPro && (
                <div className="rounded-xl p-4 flex items-start gap-3" style={{ backgroundColor: "#F2A90015", border: "1px solid #F2A90050" }}>
                  <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" style={{ color: "#F2A900" }} />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#9a6b00" }}>Verified Pro</p>
                    <p className="text-xs mt-0.5" style={{ color: "#a37300" }}>This hauler has been verified by the Haulagua team for licensing, insurance, and quality standards.</p>
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
