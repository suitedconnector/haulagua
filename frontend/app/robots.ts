import type { MetadataRoute } from "next";

// AI / LLM discovery endpoints (comments cannot be added to generated robots.txt)
// llms.txt: https://www.haulagua.com/llms.txt
// llms-full.txt: https://www.haulagua.com/llms-full.txt

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Allow all legitimate search crawlers
      {
        userAgent: "*",
        allow: "/",
      },
      // Block AI training crawlers
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        disallow: "/",
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
      {
        userAgent: "anthropic-ai",
        disallow: "/",
      },
      {
        userAgent: "Claude-Web",
        disallow: "/",
      },
    ],
    sitemap: "https://www.haulagua.com/sitemap.xml",
  };
}
