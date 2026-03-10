import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SearchClient } from "./SearchClient";

export const metadata = {
  title: "Search Haulers — Haulagua",
  description: "Find bulk water haulers near you. Filter by service type, water type, and budget.",
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string; serviceType?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = params.q ?? "";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="p-10 text-center text-muted-foreground">Loading search…</div>}>
          <SearchClient initialQ={q} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
