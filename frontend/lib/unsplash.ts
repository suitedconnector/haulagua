const ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

type UnsplashPhoto = {
  urls: { regular: string; small: string };
  alt_description: string | null;
};

type UnsplashResponse = {
  results: UnsplashPhoto[];
};

/**
 * Fetch a single city photo from Unsplash.
 * Results are cached indefinitely via Next.js fetch cache (force-cache).
 * Returns null if no key is set, API fails, or no results found.
 */
export async function fetchCityPhoto(
  city: string,
  state: string
): Promise<string | null> {
  if (!ACCESS_KEY) return null;

  const query = encodeURIComponent(`${city} ${state} city`);
  const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=1&orientation=landscape`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
      cache: "force-cache",
    });
    if (!res.ok) return null;
    const data: UnsplashResponse = await res.json();
    return data.results?.[0]?.urls?.small ?? null;
  } catch {
    return null;
  }
}
