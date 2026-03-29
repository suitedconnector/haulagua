import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SearchClient } from "./SearchClient";

export const metadata: Metadata = {
  title: "Search Haulers — Haulagua",
  description: "Find bulk water haulers near you. Filter by service type, price, and verified status.",
  openGraph: {
    title: "Search Haulers — Haulagua",
    description: "Find bulk water haulers near you. Filter by service type, price, and verified status.",
    url: "https://haulagua.com/search",
    siteName: "Haulagua",
    type: "website",
  },
};

type SearchPageProps = {
  searchParams: Promise<{ zip?: string; serviceType?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const zip = params.zip ?? "";
  const serviceType = params.serviceType ?? "";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="p-10 text-center text-muted-foreground">Loading search…</div>}>
          <SearchClient initialZip={zip} initialServiceType={serviceType} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
