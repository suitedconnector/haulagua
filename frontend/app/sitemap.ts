import type { MetadataRoute } from "next";
import { strapiGet } from "@/src/lib/strapi";
import {
  getAllStatesWithCounts,
  getHaulersByState,
  groupHaulersByCity,
  toStateSlug,
  toCitySlug,
} from "@/lib/location";

const BASE_URL = "https://www.haulagua.com";

type StrapiItem = { id: number; attributes: { slug: string } };
type StrapiListResponse = { data: StrapiItem[] };

async function getHaulerSlugs(): Promise<string[]> {
  try {
    const data = await strapiGet<StrapiListResponse>({
      path: "/haulers",
      params: {
        "filters[isActive][$eq]": "true",
        "fields[0]": "slug",
        "pagination[pageSize]": "1000",
      },
      cache: "no-store",
    });
    return (data.data ?? []).map((h) => h.attributes.slug).filter(Boolean);
  } catch {
    return [];
  }
}

async function getBlogSlugs(): Promise<string[]> {
  try {
    const data = await strapiGet<StrapiListResponse>({
      path: "/blog-posts",
      params: {
        "fields[0]": "slug",
        "pagination[pageSize]": "1000",
      },
      cache: "no-store",
    });
    return (data.data ?? []).map((p) => p.attributes.slug).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ─── Static pages ────────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/search`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/water-haulers`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/resources`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/for-haulers`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/for-haulers/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  // ─── Location pages ──────────────────────────────────────────────────────────
  const locationPages: MetadataRoute.Sitemap = [];
  const states = await getAllStatesWithCounts();

  for (const { abbr } of states) {
    const stateSlug = toStateSlug(abbr);
    locationPages.push({
      url: `${BASE_URL}/water-haulers/${stateSlug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });

    const haulers = await getHaulersByState(abbr.toUpperCase());
    const cities = groupHaulersByCity(haulers);
    for (const { slug: citySlug } of cities) {
      locationPages.push({
        url: `${BASE_URL}/water-haulers/${stateSlug}/${citySlug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  // ─── Hauler profiles ─────────────────────────────────────────────────────────
  const haulerSlugs = await getHaulerSlugs();
  const haulerPages: MetadataRoute.Sitemap = haulerSlugs.map((slug) => ({
    url: `${BASE_URL}/haulers/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // ─── Blog posts ──────────────────────────────────────────────────────────────
  const blogSlugs = await getBlogSlugs();
  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/resources/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...locationPages, ...haulerPages, ...blogPages];
}
