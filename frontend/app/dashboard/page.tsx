import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageSquare, Users, PenLine, CheckCircle, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard — Haulagua",
  description: "Manage your Haulagua listing, view stats, and update your profile.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://www.haulagua.com/dashboard',
  },
};

const stats = [
  { label: "Profile Views", value: "—", icon: Eye },
  { label: "Leads Received", value: "—", icon: Users },
  { label: "Inquiries", value: "—", icon: MessageSquare },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const user = session.user;
  const haulerName = user?.name || "Your Business";
  const haulerSlug = "your-listing"; // TODO: Get from user data
  const isClaimed = false; // TODO: Get from user data

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        {/* Header */}
        <section className="bg-white border-b border-border py-8 px-4">
          <div className="mx-auto max-w-5xl flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Welcome back</p>
              <h1 className="font-serif text-2xl md:text-3xl font-bold" style={{ color: "#005A9C" }}>
                {haulerName}
              </h1>
            </div>
            <form action="/api/auth/signout" method="post">
              <Button
                type="submit"
                variant="outline"
                className="text-sm"
              >
                Sign Out
              </Button>
            </form>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
          {/* Listing status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg text-foreground">Listing Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4">
              {isClaimed ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Listing claimed and active</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" style={{ color: "#F2A900" }} />
                  <span className="text-sm font-medium text-foreground">
                    Listing not yet claimed
                  </span>
                </div>
              )}
              <Badge
                className="w-fit text-white text-xs"
                style={{ backgroundColor: isClaimed ? "#005A9C" : "#F2A900" }}
              >
                {isClaimed ? "Verified Pro" : "Unclaimed"}
              </Badge>
              <div className="sm:ml-auto">
                <Button
                  asChild
                  className="gap-2 text-white"
                  style={{ backgroundColor: "#005A9C" }}
                >
                  <Link href={`/haulers/${haulerSlug}`}>
                    <PenLine className="h-4 w-4" />
                    Edit Listing
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground mb-4">Quick Stats</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.map(({ label, value, icon: Icon }) => (
                <Card key={label}>
                  <CardContent className="pt-6 flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "#005A9C1A" }}
                    >
                      <Icon className="h-5 w-5" style={{ color: "#005A9C" }} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{value}</p>
                      <p className="text-sm text-muted-foreground">{label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Get listed CTA if unclaimed */}
          {!isClaimed && (
            <Card className="border-2" style={{ borderColor: "#F2A900" }}>
              <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Claim your listing</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Verify your business to unlock stats, leads, and a Verified Pro badge.
                  </p>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="border-2 font-semibold flex-shrink-0"
                  style={{ borderColor: "#F2A900", color: "#005A9C" }}
                >
                  <Link href={`/haulers/${haulerSlug}/claim`}>Claim Now</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
