import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Haulagua — Find Bulk Water Haulers Near You",
  description: "Search and compare verified bulk water haulers for pool fills, construction, agriculture, and emergencies. Free to search across Texas and Arizona.",
  openGraph: {
    title: "Haulagua — Find Bulk Water Haulers Near You",
    description: "Search and compare verified bulk water haulers for pool fills, construction, agriculture, and emergencies.",
    url: "https://haulagua.com",
    siteName: "Haulagua",
    type: "website",
  },
};
import { HeroSection } from "@/components/hero-section";
import WaterCalculatorQuiz from "@/components/WaterCalculatorQuiz";
import { TrustBanner } from "@/components/trust-banner";
import { HowItWorks } from "@/components/how-it-works";
import { FeaturedArticle } from "@/components/featured-article";
import { HaulerCta } from "@/components/hauler-cta";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <section className="py-16 px-4 bg-white">
          <div className="max-w-2xl mx-auto">
            <WaterCalculatorQuiz />
          </div>
        </section>
        <TrustBanner />
        <HowItWorks />
        <FeaturedArticle />
        <HaulerCta />
      </main>
      <Footer />
    </div>
  );
}
