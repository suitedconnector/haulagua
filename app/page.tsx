import { Navbar } from "@/components/navbar";
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
