import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        <Card className="w-full max-w-md shadow-md">
          <CardHeader className="text-center pb-2">
            <Link href="/" className="inline-block mb-4">
              <span className="font-serif text-2xl tracking-tight">
                <span className="font-bold" style={{ color: "#005A9C" }}>HAUL</span>
                <span className="font-light text-foreground">AGUA</span>
              </span>
            </Link>
            <CardTitle className="font-serif text-2xl text-foreground">
              Sign In
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome back — sign in to your account
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <form className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs hover:underline"
                    style={{ color: "#005A9C" }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full text-white font-semibold"
                style={{ backgroundColor: "#005A9C" }}
              >
                Sign In
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Are you a hauler?{" "}
              <Link
                href="/for-haulers/signup"
                className="font-medium hover:underline"
                style={{ color: "#005A9C" }}
              >
                Create a free listing
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
