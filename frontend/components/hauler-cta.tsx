import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const benefits = [
  "Free basic listing",
  "Verified Pro badge available",
  "Your full profile with equipment specs",
];

export function HaulerCta() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Left content */}
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Are You a Water Hauler?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Stop chasing unqualified leads. List your business free and connect with customers who already know what they need.
            </p>

            <ul className="mt-8 space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-foreground">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: "#005A9C" }} />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Right card */}
          <div
            className="rounded-xl p-8 flex flex-col items-center gap-6 shadow-md bg-white"
            style={{ border: "2px solid #F2A900" }}
          >
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground font-serif">
                Start reaching customers today
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your free listing in minutes
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="w-full text-white font-semibold"
              style={{ backgroundColor: "#005A9C" }}
            >
              <Link href="/for-haulers">Get Listed Free</Link>
            </Button>
            <Link
              href="/for-haulers#learn-more"
              className="text-sm text-muted-foreground hover:underline"
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
