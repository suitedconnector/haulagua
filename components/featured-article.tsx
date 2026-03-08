import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle } from "lucide-react";

export function FeaturedArticle() {
  return (
    <section className="py-16 md:py-20 bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border-border bg-card">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative h-64 md:h-auto min-h-[300px]">
              <Image
                src="/images/pool-article.jpg"
                alt="Beautiful backyard swimming pool being filled with water"
                fill
                className="object-cover"
              />
            </div>
            
            {/* Content */}
            <CardContent className="p-6 md:p-10 flex flex-col justify-center">
              <span className="text-sm font-medium text-primary uppercase tracking-wide">
                Featured Resource
              </span>
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground mt-2">
                New Pool Owner? Start Here
              </h3>
              <p className="mt-4 text-muted-foreground">
                Everything you need to know about filling your pool with bulk water delivery. From calculating water volume to choosing the right service.
              </p>
              
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  Calculate your pool water volume
                </li>
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  Understand potable vs. non-potable water
                </li>
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  Tips for working with water haulers
                </li>
              </ul>

              <Button asChild className="mt-8 w-fit bg-primary hover:bg-primary/90">
                <Link href="/resources/new-pool-owner">
                  Read the Guide
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </div>
        </Card>
      </div>
    </section>
  );
}
