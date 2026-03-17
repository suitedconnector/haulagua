import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Truck, ArrowRight } from "lucide-react";

const benefits = [
  "Get discovered by customers in your service area",
  "Showcase your services and equipment",
  "Build your reputation with verified reviews",
  "Free basic listing, premium options available",
];

export function HaulerCta() {
  return (
    <section className="py-16 md:py-20 bg-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Left content */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <Truck className="h-6 w-6 text-accent-foreground" />
              </div>
              <span className="text-sm font-medium text-accent uppercase tracking-wide">
                For Professionals
              </span>
            </div>
            
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-background">
              Are You a Water Hauler?
            </h2>
            <p className="mt-4 text-lg text-background/80">
              Join Haulagua and connect with customers looking for reliable bulk water delivery services.
            </p>

            <ul className="mt-8 space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-background/90">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Right card */}
          <Card className="bg-card border-0 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="font-serif text-2xl text-foreground">
                Join Haulagua
              </CardTitle>
              <p className="text-muted-foreground">
                Create your free listing in minutes
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90">
                <Link href="/for-haulers/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Log in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
