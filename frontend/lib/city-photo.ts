const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

/**
 * Fetches a city photo URL via Google Places API.
 *
 * Flow:
 * 1. Text Search → get place_id + photo_reference
 * 2. Places Photos → follow redirect → resolve final CDN URL
 *
 * Results are cached via Next.js fetch cache (force-cache) so the
 * API is only called once per city across builds/requests.
 *
 * Returns null if no key is configured, the city has no photos,
 * or any API call fails.
 */
export async function fetchCityPhoto(
  city: string,
  state: string
): Promise<string | null> {
  if (!API_KEY) return null;

  try {
    // Step 1: Text search for the city
    const searchUrl =
      `https://maps.googleapis.com/maps/api/place/textsearch/json` +
      `?query=${encodeURIComponent(`${city}, ${state}`)}&key=${API_KEY}`;

    const searchRes = await fetch(searchUrl, { cache: "force-cache" });
    if (!searchRes.ok) return null;

    const searchData = await searchRes.json();
    const photoRef: string | undefined =
      searchData.results?.[0]?.photos?.[0]?.photo_reference;

    if (!photoRef) return null;

    // Step 2: Resolve the Places photo redirect to a stable CDN URL
    const photoUrl =
      `https://maps.googleapis.com/maps/api/place/photo` +
      `?maxwidth=800&photoreference=${photoRef}&key=${API_KEY}`;

    const photoRes = await fetch(photoUrl, {
      redirect: "follow",
      cache: "force-cache",
    });

    if (!photoRes.ok) return null;

    // The final URL after redirect is the actual image CDN URL
    return photoRes.url;
  } catch {
    return null;
  }
}
