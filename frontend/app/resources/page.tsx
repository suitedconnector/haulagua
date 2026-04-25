import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { strapiGet } from "@/src/lib/strapi";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Resource Center — Haulagua",
  description: "Guides, tips, and articles about bulk water hauling, pool fills, construction water, and more.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://www.haulagua.com/resources',
  },
  openGraph: {
    title: "Resource Center — Haulagua",
    description: "Guides, tips, and articles about bulk water hauling, pool fills, construction water, and more.",
    url: "https://www.haulagua.com/resources",
    siteName: "Haulagua",
    type: "website",
  },
};

type BlogPost = {
  id: number;
  attributes: {
    title: string;
    excerpt: string | null;
    category: string | null;
    slug: string;
    publishedAt: string | null;
  };
};

type StrapiResponse = {
  data: BlogPost[];
};

async function getPosts(): Promise<BlogPost[]> {
  try {
    const data = await strapiGet<StrapiResponse>({
      path: "/blog-posts",
      params: {
        "sort[0]": "publishedAt:desc",
        "pagination[pageSize]": "24",
        "fields[0]": "title",
        "fields[1]": "excerpt",
        "fields[2]": "category",
        "fields[3]": "slug",
        "fields[4]": "publishedAt",
      },
      cache: "force-cache",
      tags: ["blog-posts"],
    });
    return data.data ?? [];
  } catch {
    return [];
  }
}

export default async function ResourcesPage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="py-14 md:py-20 bg-white border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1
              className="font-serif text-3xl md:text-5xl font-bold"
              style={{ color: "#005A9C" }}
            >
              Resource Center
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Guides and articles to help you find, hire, and work with bulk water haulers.
            </p>
          </div>
        </section>

        {/* Posts grid */}
        <section className="py-14 md:py-20 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#005A9C1A" }}
                >
                  <BookOpen className="w-8 h-8" style={{ color: "#005A9C" }} />
                </div>
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  Articles coming soon
                </h2>
                <p className="text-muted-foreground max-w-sm">
                  We're working on helpful guides for water hauling customers and haulers alike. Check back soon.
                </p>
                <Link
                  href="/search"
                  className="mt-2 text-sm font-medium hover:underline"
                  style={{ color: "#005A9C" }}
                >
                  Find a hauler now →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => {
                  const a = post.attributes;
                  return (
                    <Card
                      key={post.id}
                      className="flex flex-col hover:shadow-md transition-shadow bg-white"
                    >
                      <CardHeader className="pb-3">
                        {a.category && (
                          <Badge
                            className="w-fit mb-2 text-white text-xs"
                            style={{ backgroundColor: "#F2A900" }}
                          >
                            {a.category}
                          </Badge>
                        )}
                        <h2 className="font-serif text-lg font-semibold text-foreground leading-snug">
                          {a.title}
                        </h2>
                      </CardHeader>
                      <CardContent className="flex flex-col flex-1 gap-4">
                        {a.excerpt && (
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                            {a.excerpt}
                          </p>
                        )}
                        <div className="mt-auto">
                          <Link
                            href={`/resources/${a.slug}`}
                            className="text-sm font-medium hover:underline"
                            style={{ color: "#005A9C" }}
                          >
                            Read more →
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
