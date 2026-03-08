import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
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
        <TrustBanner />
        <HowItWorks />
        <FeaturedArticle />
        <HaulerCta />
      </main>
      <Footer />
    </div>
  );
}
