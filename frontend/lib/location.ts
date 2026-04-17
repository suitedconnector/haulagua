import { strapiGet } from "@/src/lib/strapi";
import type { StrapiHauler } from "@/components/hauler-card";

export const STATE_NAMES: Record<string, string> = {
  tx: "Texas",
  az: "Arizona",
  ca: "California",
  fl: "Florida",
  co: "Colorado",
  nm: "New Mexico",
  ok: "Oklahoma",
  nv: "Nevada",
  ut: "Utah",
  id: "Idaho",
  mt: "Montana",
  wy: "Wyoming",
  nd: "North Dakota",
  sd: "South Dakota",
  ne: "Nebraska",
  ks: "Kansas",
  mo: "Missouri",
  ia: "Iowa",
  mn: "Minnesota",
  wi: "Wisconsin",
  il: "Illinois",
  mi: "Michigan",
  in: "Indiana",
  oh: "Ohio",
  ky: "Kentucky",
  tn: "Tennessee",
  al: "Alabama",
  ms: "Mississippi",
  ar: "Arkansas",
  la: "Louisiana",
  ga: "Georgia",
  sc: "South Carolina",
  nc: "North Carolina",
  va: "Virginia",
  wv: "West Virginia",
  pa: "Pennsylvania",
  ny: "New York",
  nj: "New Jersey",
  de: "Delaware",
  md: "Maryland",
  ct: "Connecticut",
  ri: "Rhode Island",
  ma: "Massachusetts",
  nh: "New Hampshire",
  vt: "Vermont",
  me: "Maine",
  wa: "Washington",
  or: "Oregon",
  ak: "Alaska",
  hi: "Hawaii",
};

export const STATE_INTROS: Record<string, string> = {
  tx: "Texas is one of the largest markets for bulk water delivery in the country. From the Hill Country to the Permian Basin, water haulers serve pool fills, ranches, construction sites, and rural properties across every region of the Lone Star State.",
  az: "Arizona's hot, arid climate makes reliable water delivery essential for homeowners, builders, and farmers alike. From Phoenix to Tucson and the rural communities beyond, water haulers keep operations running through even the driest months.",
};

export const STATE_INTRO_DEFAULT =
  "Bulk water haulers in this state serve a wide range of needs — from residential pool fills to large-scale construction and agricultural water delivery. Browse all verified haulers below.";

export const CITY_INTRO_DEFAULT = (city: string, state: string) =>
  `Looking for bulk water delivery in ${city}, ${state}? Browse verified haulers serving the ${city} area for pool fills, construction, potable water, and more.`;

export function toStateSlug(abbr: string) {
  return abbr.toLowerCase();
}

export function toCitySlug(city: string) {
  return city
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function fromStateSlug(slug: string): string {
  return slug.toUpperCase();
}

export function fromCitySlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

type StrapiListResponse = { data: StrapiHauler[]; meta: { pagination: { total: number } } };

export async function getHaulersByState(stateAbbr: string): Promise<StrapiHauler[]> {
  try {
    const data = await strapiGet<StrapiListResponse>({
      path: "/haulers",
      params: {
        "filters[state][$eq]": stateAbbr.toUpperCase(),
        "filters[isActive][$eq]": "true",
        "populate[services][fields][0]": "type",
        "pagination[pageSize]": "100",
        "sort[0]": "isVerifiedPro:desc",
      },
      cache: "no-store",
      tags: [`haulers-state-${stateAbbr}`],
    });
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function getHaulersByCity(
  stateAbbr: string,
  city: string
): Promise<StrapiHauler[]> {
  try {
    const data = await strapiGet<StrapiListResponse>({
      path: "/haulers",
      params: {
        "filters[state][$eq]": stateAbbr.toUpperCase(),
        "filters[city][$containsi]": city,
        "filters[isActive][$eq]": "true",
        "populate[services][fields][0]": "type",
        "pagination[pageSize]": "100",
        "sort[0]": "isVerifiedPro:desc",
      },
      cache: "no-store",
      tags: [`haulers-city-${stateAbbr}-${city}`],
    });
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function getAllStatesWithCounts(): Promise<{ abbr: string; name: string; count: number }[]> {
  try {
    const data = await strapiGet<StrapiListResponse>({
      path: "/haulers",
      params: {
        "filters[isActive][$eq]": "true",
        "fields[0]": "state",
        "pagination[pageSize]": "1000",
      },
      cache: "no-store",
      tags: ["haulers-states"],
    });
    const counts: Record<string, number> = {};
    for (const h of data.data ?? []) {
      const abbr = h.attributes.state?.toLowerCase();
      if (abbr) counts[abbr] = (counts[abbr] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([abbr, count]) => ({
        abbr,
        name: STATE_NAMES[abbr] ?? abbr.toUpperCase(),
        count,
      }))
      .sort((a, b) => b.count - a.count);
  } catch {
    return [];
  }
}

export function groupHaulersByCity(
  haulers: StrapiHauler[]
): { city: string; slug: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const h of haulers) {
    const city = h.attributes.city;
    if (city) counts[city] = (counts[city] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([city, count]) => ({ city, slug: toCitySlug(city), count }))
    .sort((a, b) => b.count - a.count);
}
