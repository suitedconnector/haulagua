import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claim Your Listing — Haulagua",
  description: "Claim your water hauling business listing on Haulagua. Verify your information, upload insurance, and get a verified badge.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://www.haulagua.com/haulers/[slug]/claim',
  },
};

export default function ClaimLayout({ children }: { children: React.ReactNode }) {
  return children;
}
