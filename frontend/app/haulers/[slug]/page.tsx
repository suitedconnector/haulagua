import { notFound } from "next/navigation";
import Link from "next/link";
import { strapiGet } from "@/src/lib/strapi";
import { TRUCK_PLACEHOLDERS, getPlaceholderImage } from "@/src/lib/placeholders";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ContactPanel } from "./ContactPanel";
import { ReviewForm } from "./ReviewForm";
import {
  CheckCircle2,
  Truck,
  Ruler,
  Droplets,
  DollarSign,
  MapPin,
  ChevronLeft,
  ImageIcon,
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
    isClaimed: boolean;
    yearFounded: number | null;
    insuranceVerified: boolean;
    certification: string | null;
    insuranceCertificate: string | null;
    industries: string[] | null;
    services: { data: StrapiService[] };
    caseStudies: { data: StrapiCaseStudy[] };
    ada: boolean | null;
    lgbtqFriendly: boolean | null;
    veteranOwned: boolean | null;
    womenOwned: boolean | null;
    hours: string | null;
    plusCode: string | null;
  };
};

type StrapiResponse = {
  data: StrapiHauler[];
  meta: { pagination: { total: number } };
};

type StrapiReview = {
  id: number;
  attributes: {
    reviewerName: string;
    rating: number;
    comment: string;
    createdAt: string;
    isApproved: boolean;
  };
};

type ReviewsResponse = {
  data: StrapiReview[];
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

// ─── Photo Gallery Placeholder ────────────────────────────────────────────────

function GalleryPlaceholder({ name, city, state, slug }: { name: string; city: string; state: string; slug: string }) {
  const primary = getPlaceholderImage(slug);
  const secondary = TRUCK_PLACEHOLDERS[(slug.length + 1) % TRUCK_PLACEHOLDERS.length];
  const tertiary = TRUCK_PLACEHOLDERS[(slug.length + 2) % TRUCK_PLACEHOLDERS.length];
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="col-span-2 row-span-2 rounded-xl overflow-hidden h-48 relative">
        <img
          src={primary}
          alt={`${name} - bulk water delivery in ${city}, ${state}`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="rounded-xl overflow-hidden h-24 relative">
        <img
          src={secondary}
          alt={`${name} - water truck and equipment`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="rounded-xl overflow-hidden h-24 relative">
        <img
          src={tertiary}
          alt={`${name} - service area and operations`}
          className="w-full h-full object-cover"
        />
      </div>
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
    const title = `${a.name} — Bulk Water Hauling in ${a.city}, ${a.state} | Haulagua`;
    const description = a.description?.slice(0, 160) ?? `${a.name} provides bulk water hauling services in ${a.city}, ${a.state}.`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://haulagua.com/haulers/${slug}`,
        siteName: "Haulagua",
        type: "profile",
      },
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

  let approvedReviews: StrapiReview[] = [];
  try {
    const reviewData = await strapiGet<ReviewsResponse>({
      path: "/reviews",
      params: {
        "filters[haulerSlug][$eq]": slug,
        "filters[isApproved][$eq]": "true",
        "sort[0]": "createdAt:desc",
        "pagination[pageSize]": "20",
      },
      cache: "no-store",
    });
    approvedReviews = reviewData.data ?? [];
  } catch {
    // Non-critical — show page without reviews if Strapi call fails
  }

  const avgRating =
    approvedReviews.length > 0
      ? approvedReviews.reduce((sum, r) => sum + r.attributes.rating, 0) / approvedReviews.length
      : null;

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
                    <span
                      className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full"
                      style={{ backgroundColor: "#F2A900", color: "#fff" }}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Verified Pro
                    </span>
                  )}
                  {!a.isClaimed && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Unclaimed
                    </span>
                  )}
                  {a.ada && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                      ♿ ADA Accessible
                    </span>
                  )}
                  {a.lgbtqFriendly && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
                      🏳️‍🌈 LGBTQ+ Friendly
                    </span>
                  )}
                  {a.veteranOwned && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                      🎖️ Veteran Owned
                    </span>
                  )}
                  {a.womenOwned && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-pink-100 text-pink-700">
                      ⚡ Women Owned
                    </span>
                  )}
                </div>
                <p className="flex items-center gap-1.5 text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  {a.address ? `${a.address}, ` : ""}{a.city}, {a.state} {a.zip}
                </p>
                {a.plusCode && (
                  <a
                    href={`https://plus.codes/${a.plusCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#005A9C] mt-1"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    {a.plusCode} (Open in Maps)
                  </a>
                )}
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
                  <GalleryPlaceholder name={a.name} city={a.city} state={a.state} slug={a.slug} />
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

              {/* Reviews */}
              <section>
                {approvedReviews.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="font-serif text-xl font-bold">Reviews</h2>
                      <div className="flex items-center gap-2">
                        <StarRating rating={Math.round(avgRating!)} />
                        <span className="font-bold text-lg" style={{ color: "#005A9C" }}>
                          {avgRating!.toFixed(1)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({approvedReviews.length} review{approvedReviews.length !== 1 ? "s" : ""})
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {approvedReviews.map((review) => (
                        <div
                          key={review.id}
                          className="bg-white border border-border rounded-xl p-5"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <p className="font-semibold text-sm">{review.attributes.reviewerName}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {new Date(review.attributes.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                            <StarRating rating={review.attributes.rating} size={14} />
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {review.attributes.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <ReviewForm haulerSlug={slug} />
              </section>
            </div>

            {/* ── RIGHT (30%) ── */}
            <div className="flex-[3] min-w-0 lg:max-w-xs space-y-5 lg:sticky lg:top-6 lg:self-start">
              {/* Contact Card */}
              <div className="bg-white rounded-xl border border-border shadow-sm p-5">
                <h2 className="font-serif font-bold text-base mb-4">Contact</h2>
                <ContactPanel
                  phone={a.phone}
                  website={a.website}
                  email={a.email ?? null}
                  name={a.name}
                  slug={a.slug}
                  isClaimed={a.isClaimed}
                />
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
                  {a.yearFounded != null && (
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        Year founded
                      </dt>
                      <dd className="font-semibold">{a.yearFounded}</dd>
                    </div>
                  )}
                  {a.serviceArea && (
                    <div className="flex items-start justify-between gap-2">
                      <dt className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                        <MapPin className="h-4 w-4" />
                        Service area
                      </dt>
                      <dd className="font-semibold text-sm text-right">{a.serviceArea}</dd>
                    </div>
                  )}
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
                  {a.certification && (
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        Certification
                      </dt>
                      <dd className="font-semibold text-sm text-right">{a.certification}</dd>
                    </div>
                  )}
                  {a.hours && (
                    <div className="flex items-start justify-between gap-2">
                      <dt className="text-sm text-muted-foreground shrink-0">🕐 Hours</dt>
                      <dd className="text-sm text-right">
                        {a.hours.split(/(?=Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/).map((line, i) => (
                          <div key={i}>{line.trim()}</div>
                        ))}
                      </dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Droplets className="h-4 w-4" />
                      Water type
                    </dt>
                    <dd className="font-semibold text-sm">{WATER_TYPE_LABEL[a.waterType] ?? a.waterType}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4" />
                      Insurance
                    </dt>
                    <dd className="font-semibold text-sm">
                      {a.insuranceCertificate ? (
                        <a
                          href={a.insuranceCertificate}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:underline"
                        >
                          Verified
                        </a>
                      ) : (
                        <span className="text-muted-foreground">Unverified</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Claim This Listing CTA */}
              {!a.isClaimed && (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#333333]">Is this your business?</p>
                      <p className="text-xs text-gray-500 mt-0.5 mb-3">
                        Claim this listing to update your info, add photos, and manage your profile.
                      </p>
                      <Link
                        href={`/haulers/${a.slug}/claim`}
                        className="inline-flex items-center justify-center w-full rounded-lg border-2 border-[#005A9C] text-[#005A9C] text-sm font-semibold py-2 px-4 hover:bg-[#005A9C] hover:text-white transition-colors"
                      >
                        Claim This Listing
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Verified Pro Badge Card */}
              {a.isVerifiedPro && (
                <div
                  className="rounded-xl p-4 flex items-start gap-3"
                  style={{ backgroundColor: "#F2A90015", border: "1px solid #F2A90050" }}
                >
                  <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" style={{ color: "#F2A900" }} />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#9a6b00" }}>Verified Pro</p>
                    <p className="text-xs mt-0.5" style={{ color: "#a37300" }}>
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
