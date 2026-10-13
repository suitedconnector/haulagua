import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

type BlogPost = {
  id: number;
  attributes: {
    title: string;
    excerpt: string | null;
    category: string | null;
    slug: string;
    body: string | null;
    publishedAt: string | null;
  };
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getPost(slug: string): Promise<BlogPost | null> {
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) {
    return {
      title: "Post Not Found — Haulagua",
      robots: { index: false, follow: false },
    };
  }
  const a = post.attributes;
  const title = `${a.title} — Haulagua`;
  const description = a.excerpt ?? `Read ${a.title} on the Haulagua Resource Center.`;
  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://www.haulagua.com/resources/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.haulagua.com/resources/${slug}`,
      siteName: "Haulagua",
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-white">
        {/* Header */}
        <section
          className="py-12 md:py-16 border-b border-border"
          style={{ backgroundColor: "#F8F9FA" }}
        >
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Link
              href="/resources"
              className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 hover:underline"
              style={{ color: "#005A9C" }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Resources
            </Link>
            {post.attributes.category && (
              <div className="mb-4">
                <Badge
                  className="text-white text-xs"
                  style={{ backgroundColor: "#F2A900" }}
                >
                  {post.attributes.category}
                </Badge>
              </div>
            )}
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground leading-tight">
              {post.attributes.title}
            </h1>
            {post.attributes.excerpt && (
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {post.attributes.excerpt}
              </p>
            )}
            {post.attributes.publishedAt && (
              <p className="mt-4 text-sm text-muted-foreground">
                {new Date(post.attributes.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
        </section>

        {/* Body */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            {post.attributes.body ? (
              <div className="prose prose-slate max-w-none prose-headings:font-serif prose-a:text-[#005A9C] prose-strong:text-foreground">
                {post.attributes.body.split("\n").map((line, i) => {
                  if (line.startsWith("**") && line.endsWith("**")) {
                    return (
                      <h2 key={i} className="font-serif text-xl font-semibold text-foreground mt-8 mb-3">
                        {line.replace(/\*\*/g, "")}
                      </h2>
                    );
                  }
                  if (line.startsWith("- ")) {
                    return (
                      <li key={i} className="ml-5 text-foreground leading-relaxed list-disc">
                        {line.slice(2)}
                      </li>
                    );
                  }
                  if (line.trim() === "") return <br key={i} />;
                  return (
                    <p key={i} className="text-foreground leading-relaxed">
                      {line}
                    </p>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">No content available.</p>
            )}

            <div className="mt-12 pt-8 border-t border-border">
              <Link
                href="/resources"
                className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                style={{ color: "#005A9C" }}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Resources
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
