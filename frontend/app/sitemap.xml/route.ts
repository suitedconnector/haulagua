import { NextResponse } from 'next/server';
import haulersData from '@/data/haulers-flat.json';
import {
  getIndexableStates,
  getIndexableCityPages,
  toStateSlug,
} from '@/lib/location';

const BASE_URL = 'https://www.haulagua.com';

function isExcludedFromSitemap(url: string): boolean {
  return url.includes('/login');
}

function addEntry(entries: UrlEntry[], entry: UrlEntry) {
  if (!isExcludedFromSitemap(entry.url)) {
    entries.push(entry);
  }
}

function getHaulerSlugs(): string[] {
  const haulers = haulersData as { slug: string; isActive: boolean }[];
  return haulers
    .filter((h) => h.isActive !== false)
    .map((h) => h.slug)
    .filter(Boolean);
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
  const now = new Date().toISOString().split('T')[0];
  const entries: UrlEntry[] = [];

  // Static pages
  addEntry(entries, { url: `${BASE_URL}/`, lastmod: now, changefreq: 'weekly', priority: '1.0' });
  addEntry(entries, { url: `${BASE_URL}/search`, lastmod: now, changefreq: 'daily', priority: '0.9' });
  addEntry(entries, { url: `${BASE_URL}/water-haulers`, lastmod: now, changefreq: 'weekly', priority: '0.9' });
  addEntry(entries, { url: `${BASE_URL}/resources`, lastmod: now, changefreq: 'weekly', priority: '0.7' });
  addEntry(entries, { url: `${BASE_URL}/for-haulers`, lastmod: now, changefreq: 'monthly', priority: '0.7' });
  addEntry(entries, { url: `${BASE_URL}/for-haulers/signup`, lastmod: now, changefreq: 'monthly', priority: '0.6' });

  // Location pages — only states above MIN_HAULERS_FOR_STATE_PAGE. Thin state
  // pages are still reachable and crawlable, just noindex, so they are excluded
  // here to match the robots directive the page itself emits.
  const states = await getIndexableStates();
  for (const { abbr } of states) {
    const stateSlug = toStateSlug(abbr);
    addEntry(entries, { url: `${BASE_URL}/water-haulers/${stateSlug}`, lastmod: now, changefreq: 'weekly', priority: '0.8' });
  }

  // City pages — only the ones that actually get statically built
  // (same >= MIN_HAULERS_FOR_CITY_PAGE filter as generateStaticParams
  // in water-haulers/[state]/[city]/page.tsx)
  const cityPages = await getIndexableCityPages();
  for (const { state: stateSlug, city: citySlug } of cityPages) {
    addEntry(entries, { url: `${BASE_URL}/water-haulers/${stateSlug}/${citySlug}`, lastmod: now, changefreq: 'weekly', priority: '0.7' });
  }

  // Hauler profiles
  const haulerSlugs = getHaulerSlugs();
  for (const slug of haulerSlugs) {
    addEntry(entries, { url: `${BASE_URL}/haulers/${slug}`, lastmod: now, changefreq: 'weekly', priority: '0.8' });
  }

  return new NextResponse(buildXml(entries), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}