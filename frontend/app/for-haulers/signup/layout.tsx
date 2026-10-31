import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CREATE YOUR FREE LISTING | HAULAGUA",
  description: "Sign up as a water hauler on Haulagua. Create your free listing, showcase your equipment, and start connecting with customers today.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://www.haulagua.com/for-haulers/signup',
  },
  openGraph: {
    title: "CREATE YOUR FREE LISTING | HAULAGUA",
    description: "Sign up as a water hauler on Haulagua. Free listing, verified badge available.",
    url: "https://www.haulagua.com/for-haulers/signup",
    siteName: "Haulagua",
    type: "website",
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
