import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "List Your Business Free — Haulagua for Haulers",
  description: "Join Haulagua and connect with customers who need bulk water delivery. Free basic listing, verified Pro badge available, full equipment specs profile.",
  openGraph: {
    title: "List Your Business Free — Haulagua for Haulers",
    description: "Stop chasing unqualified leads. List your bulk water hauling business free on Haulagua.",
    url: "https://haulagua.com/for-haulers",
    siteName: "Haulagua",
    type: "website",
  },
};
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  ArrowRight,
  CheckCircle,
  Star,
  Briefcase,
  UserCheck,
  Megaphone,
  ClipboardList,
  ShieldCheck,
  PhoneCall,
} from "lucide-react";

// ── Benefits ─────────────────────────────────────────────────────────────────

const benefits = [
  {
    icon: Megaphone,
    title: "Qualified Leads",
    description:
      "Customers who land on Haulagua already understand what bulk water delivery is and know what they need. No educating, no tire-kickers — just real inquiries from people ready to hire.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Pro Badge",
    description:
      "Stand out from the competition with a Verified Pro badge displayed on your profile. It signals credibility to customers and boosts your placement in search results.",
  },
  {
    icon: Briefcase,
    title: "Your Full Profile",
    description:
      "Showcase your trucks, tank sizes, service areas, and case studies. Give customers everything they need to choose you with confidence before they even pick up the phone.",
  },
];

// ── Pricing ──────────────────────────────────────────────────────────────────

const freeTierFeatures = [
  "Business name & location",
  "Service types listed",
  "Contact information",
  "Basic profile page",
];

const proTierFeatures = [
  "Everything in Free",
  "Verified Pro badge",
  "Priority placement in search",
  "Full profile with photos",
  "Truck & equipment details",
  "Case studies & testimonials",
  "Service area map",
  "Lead notification alerts",
];

// ── How it works ─────────────────────────────────────────────────────────────

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Create Your Profile",
    description:
      "Sign up for free and fill in your business details — name, location, services, and contact info. It takes less than 5 minutes.",
  },
  {
    icon: UserCheck,
    step: "02",
    title: "Get Verified",
    description:
      "Upgrade to Verified Pro by submitting your business credentials. Our team reviews and approves within 1–2 business days.",
  },
  {
    icon: PhoneCall,
    step: "03",
    title: "Start Receiving Leads",
    description:
      "Your profile goes live in our directory. Customers searching in your area will find you, review your profile, and reach out directly.",
  },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────

const faqs = [
  {
    question: "How much does it cost to list my business?",
    answer:
      "Creating a basic listing on Haulagua is completely free and always will be. You can list your business name, location, services, and contact details at no charge. The Verified Pro upgrade, which includes priority placement, a badge, and a full profile, is available for a monthly subscription fee. Pricing details are available during sign-up.",
  },
  {
    question: "How does the verification process work?",
    answer:
      "When you upgrade to Verified Pro, you'll be asked to submit basic business documentation (such as a business license or proof of operation). Our team reviews your submission within 1–2 business days. Once approved, your Verified Pro badge appears on your profile immediately. Verification is renewed annually.",
  },
  {
    question: "What areas does Haulagua cover?",
    answer:
      "Haulagua currently covers rural and semi-rural areas across the United States where bulk water hauling is a common need — typically properties on wells, off-grid homes, construction sites, and agricultural operations. If your service area isn't listed yet, sign up anyway — we're expanding coverage continuously and will notify you when your region goes live.",
  },
  {
    question: "How do leads come in — will I be bombarded with calls?",
    answer:
      "Leads come in organically: customers find your profile in search results and choose to contact you directly via phone or a contact form. You're never cold-called or signed up for shared lead lists. You control your contact preferences and can update your availability at any time from your dashboard.",
  },
  {
    question: "How do I edit or update my listing?",
    answer:
      "Once you create an account, you have access to a simple dashboard where you can update your profile at any time — change your services, expand your service area, add photos, or edit your contact details. Changes go live immediately. Just log in and head to 'Edit Profile'.",
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ForHaulersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="bg-primary py-12 md:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <Badge
              className="mb-6 bg-accent text-accent-foreground font-semibold uppercase tracking-widest text-xs px-3 py-1"
            >
              For Water Hauling Professionals
            </Badge>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
              Grow Your Water Hauling Business
            </h1>
            <p className="mt-6 text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Haulagua connects you with serious customers who are actively searching for bulk water
              delivery in your area — no cold calls, no wasted time.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-base px-8"
              >
                <Link href="/for-haulers/signup">
                  Create Your Free Listing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 font-semibold text-base px-8"
              >
                <Link href="#how-it-works">See How It Works</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Benefits ── */}
        <section className="py-10 md:py-12 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                Why List on Haulagua?
              </h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                Built specifically for bulk water haulers — not a generic contractor directory
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit) => (
                <Card
                  key={benefit.title}
                  className="border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="font-serif text-xl text-foreground">
                      {benefit.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="py-10 md:py-12 bg-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                Simple, Transparent Pricing
              </h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                Start free. Upgrade when you're ready to stand out.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free tier */}
              <Card className="border border-border shadow-sm flex flex-col">
                <CardHeader className="pb-4">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Free
                  </p>
                  <CardTitle className="font-serif text-3xl font-bold text-foreground mt-1">
                    $0
                    <span className="text-base font-normal text-muted-foreground ml-1">
                      / forever
                    </span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Get listed and start showing up in searches.
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <ul className="space-y-3 flex-1">
                    {freeTierFeatures.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm text-foreground">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    variant="outline"
                    className="mt-8 w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Link href="/for-haulers/signup">Get Started Free</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Verified Pro tier */}
              <Card className="border-2 border-primary shadow-lg flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wide">
                  Most Popular
                </div>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-primary uppercase tracking-wide">
                      Verified Pro
                    </p>
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="font-serif text-3xl font-bold text-foreground mt-1">
                    Ask us
                    <span className="text-base font-normal text-muted-foreground ml-1">
                      / month
                    </span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Everything to convert browsers into customers.
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <ul className="space-y-3 flex-1">
                    {proTierFeatures.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm text-foreground">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    size="lg"
                    className="mt-8 w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Link href="/for-haulers/signup?plan=pro">
                      Get Verified Pro
                      <Star className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" className="py-10 md:py-12 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                How It Works
              </h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                From sign-up to your first lead in just a few steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
              {/* Connector line (desktop only) */}
              <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-border" />

              {steps.map((step, index) => (
                <div key={step.step} className="relative text-center">
                  <div className="relative inline-flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4 relative z-10">
                      <step.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center z-20">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mt-2">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-10 md:py-12 bg-card">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                Frequently Asked Questions
              </h2>
              <p className="mt-3 text-muted-foreground">
                Everything haulers ask before joining
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="border border-border rounded-lg px-4 bg-background"
                >
                  <AccordionTrigger className="font-medium text-foreground text-left hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ── Bottom CTA Banner ── */}
        <section className="py-10 md:py-12" style={{ background: "#0461AA" }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-background">
              Ready to Grow Your Business?
            </h2>
            <p className="mt-4 text-lg text-background/80 max-w-xl mx-auto">
              Join Haulagua today and get in front of customers who are actively looking for a
              hauler like you.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-base px-8"
              >
                <Link href="/for-haulers/signup">
                  Create Your Free Listing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-background/40 text-background hover:bg-background/10 font-semibold text-base px-8"
              >
                <Link href="/search">Browse the Directory</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
