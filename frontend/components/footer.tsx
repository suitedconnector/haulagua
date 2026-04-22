import Link from "next/link";
import { WaveDivider } from "@/components/WaveDivider";

const footerLinks = {
  services: {
    title: "Services",
    links: [
      { label: "Swimming Pool Fills", href: "/services/pool" },
      { label: "Construction Water", href: "/services/construction" },
      { label: "Emergency Delivery", href: "/services/emergency" },
      { label: "Agricultural Water", href: "/services/agricultural" },
      { label: "Potable Water", href: "/services/potable" },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { label: "Resource Center", href: "/resources" },
      { label: "New Pool Owner Guide", href: "/resources/new-pool-owner" },
      { label: "Water Calculator", href: "/resources/calculator" },
      { label: "FAQs", href: "/faqs" },
    ],
  },
  haulers: {
    title: "For Haulers",
    links: [
      { label: "Join Haulagua", href: "/for-haulers" },
      { label: "Pricing", href: "/for-haulers/pricing" },
      { label: "Hauler Dashboard", href: "/dashboard" },
      { label: "Success Stories", href: "/for-haulers/stories" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
};

export function Footer() {
  return (
    <>
      <WaveDivider topColor="#0461AA" bottomColor="white" />
      <footer className="bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo and tagline */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/">
              <span className="logo-haul">Haul</span><span className="logo-agua">agua</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              The Bulk Water Haulers Directory
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h4 className="font-serif font-semibold text-foreground mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Haulagua. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
