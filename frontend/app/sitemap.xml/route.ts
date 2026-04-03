import { NextResponse } from 'next/server';
import { strapiGet } from '@/src/lib/strapi';
import {
  getAllStatesWithCounts,
  getHaulersByState,
  groupHaulersByCity,
  toStateSlug,
} from '@/lib/location';

const BASE_URL = 'https://www.haulagua.com';

type StrapiItem = { id: number; attributes: { slug: string } };
type StrapiListResponse = { data: StrapiItem[] };

async function getHaulerSlugs(): Promise<string[]> {
  try {
    const data = await strapiGet<StrapiListResponse>({
      path: '/haulers',
      params: {
        'filters[isActive][$eq]': 'true',
        'fields[0]': 'slug',
        'pagination[pageSize]': '1000',
      },
      cache: 'no-store',
    });
    return (data.data ?? []).map((h) => h.attributes.slug).filter(Boolean);
  } catch {
    return [];
  }
}

async function getBlogSlugs(): Promise<string[]> {
  try {
    const data = await strapiGet<StrapiListResponse>({
      path: '/blog-posts',
      params: {
        'fields[0]': 'slug',
        'pagination[pageSize]': '1000',
      },
      cache: 'no-store',
    });
    return (data.data ?? []).map((p) => p.attributes.slug).filter(Boolean);
  } catch {
    return [];
  }
}

type UrlEntry = {
  url: string;
  lastmod: string;
  changefreq: string;
  priority: string;
};

function buildXml(entries: UrlEntry[]): string {
  const urlTags = entries
    .map(
      ({ url, lastmod, changefreq, priority }) =>
        `  <url>\n    <loc>${url}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlTags}\n</urlset>`;
}

export async function GET() {
  const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const entries: UrlEntry[] = [];

  // Static pages
  entries.push(
    { url: `${BASE_URL}/`, lastmod: now, changefreq: 'weekly', priority: '1.0' },
    { url: `${BASE_URL}/search`, lastmod: now, changefreq: 'daily', priority: '0.9' },
    { url: `${BASE_URL}/water-haulers`, lastmod: now, changefreq: 'weekly', priority: '0.9' },
    { url: `${BASE_URL}/resources`, lastmod: now, changefreq: 'weekly', priority: '0.7' },
    { url: `${BASE_URL}/for-haulers`, lastmod: now, changefreq: 'monthly', priority: '0.7' },
    { url: `${BASE_URL}/for-haulers/signup`, lastmod: now, changefreq: 'monthly', priority: '0.6' },
    { url: `${BASE_URL}/login`, lastmod: now, changefreq: 'monthly', priority: '0.3' }
  );

  // Location pages
  const states = await getAllStatesWithCounts();
  for (const { abbr } of states) {
    const stateSlug = toStateSlug(abbr);
    entries.push({ url: `${BASE_URL}/water-haulers/${stateSlug}`, lastmod: now, changefreq: 'weekly', priority: '0.8' });

    const haulers = await getHaulersByState(abbr.toUpperCase());
    const cities = groupHaulersByCity(haulers);
    for (const { slug: citySlug } of cities) {
      entries.push({ url: `${BASE_URL}/water-haulers/${stateSlug}/${citySlug}`, lastmod: now, changefreq: 'weekly', priority: '0.7' });
    }
  }

  // Hauler profiles
  const haulerSlugs = await getHaulerSlugs();
  for (const slug of haulerSlugs) {
    entries.push({ url: `${BASE_URL}/haulers/${slug}`, lastmod: now, changefreq: 'weekly', priority: '0.8' });
  }

  // Blog posts
  const blogSlugs = await getBlogSlugs();
  for (const slug of blogSlugs) {
    entries.push({ url: `${BASE_URL}/resources/${slug}`, lastmod: now, changefreq: 'monthly', priority: '0.6' });
  }

  return new NextResponse(buildXml(entries), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
