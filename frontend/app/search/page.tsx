import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SearchClient } from "./SearchClient";
import type { StrapiHauler } from "@/components/hauler-card";
import haulersData from "@/data/haulers.json";

export const metadata: Metadata = {
  title: "Find Bulk Water Haulers | Search by Location & Service | Haulagua",
  description:
    "Search verified bulk water haulers in Texas and Arizona. Filter by pool fills, potable water, construction, agricultural and more.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://www.haulagua.com/search',
  },
  openGraph: {
    title: "Find Bulk Water Haulers | Search by Location & Service | Haulagua",
    description:
      "Search verified bulk water haulers in Texas and Arizona. Filter by pool fills, potable water, construction, agricultural and more.",
    url: "https://www.haulagua.com/search",
    siteName: "Haulagua",
    type: "website",
  },
};

const allHaulers = (haulersData as { data: StrapiHauler[] }).data;

function getInitialHaulers(params: {
  zip?: string;
  serviceType?: string;
  state?: string;
  city?: string;
}): StrapiHauler[] {
  const q = (params.zip ?? "").toLowerCase().trim();
  const state = params.state ?? "";
  const city = params.city ?? "";
  const serviceType = params.serviceType ?? "";

  return allHaulers.filter((h) => {
    const a = h.attributes;
    if (state && a.state !== state) return false;
    if (city && a.city !== city) return false;
    if (q) {
      const fields = [a.city, a.state, a.zip, a.serviceArea];
      if (!fields.some((f) => f?.toLowerCase().includes(q))) return false;
    }
    if (serviceType) {
      const types = a.services?.data?.map((s) => s.attributes.type) ?? [];
      if (!types.includes(serviceType)) return false;
    }
    return true;
  });
}

type SearchPageProps = {
  searchParams: Promise<{ zip?: string; serviceType?: string; state?: string; city?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const zip = params.zip ?? "";
  const serviceType = params.serviceType ?? "";
  const state = params.state ?? "";
  const city = params.city ?? "";

  const initialHaulers = getInitialHaulers({ zip, serviceType, state, city });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="p-10 text-center text-muted-foreground">Loading search…</div>}>
          <SearchClient
            initialZip={zip}
            initialServiceType={serviceType}
            initialHaulers={initialHaulers}
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
