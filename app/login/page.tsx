import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign In — Haulagua",
  description: "Sign in to your Haulagua account to manage your listing or saved haulers.",
  openGraph: {
    title: "Sign In — Haulagua",
    description: "Sign in to your Haulagua account.",
    url: "https://haulagua.com/login",
    siteName: "Haulagua",
    type: "website",
  },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4 bg-gray-50">
        <LoginForm />
      </main>
      <Footer />
    </div>
  );
}
