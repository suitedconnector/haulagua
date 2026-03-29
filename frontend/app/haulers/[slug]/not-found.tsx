import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Droplets, Search } from "lucide-react";

export default function HaulerNotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{ backgroundColor: "#005A9C10" }}
          >
            <Droplets className="h-10 w-10" style={{ color: "#005A9C" }} />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-3">
            Hauler not found
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            This hauler profile doesn't exist or may have been removed. Try
            searching for water haulers in your area.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="gap-2 text-white font-semibold" style={{ backgroundColor: "#005A9C" }}>
              <Link href="/search">
                <Search className="h-4 w-4" />
                Search haulers
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
