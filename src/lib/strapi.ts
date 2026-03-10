const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

type FetchOptions = {
  path: string;
  params?: Record<string, string>;
  cache?: RequestCache;
  tags?: string[];
};

export async function strapiGet<T>({ path, params, cache = 'force-cache', tags }: FetchOptions): Promise<T> {
  const url = new URL(`/api${path}`, STRAPI_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  }

  const res = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
    },
    cache,
    ...(tags ? { next: { tags } } : {}),
  });

  if (!res.ok) {
    throw new Error(`Strapi fetch failed: ${res.status} ${res.statusText} — ${url}`);
  }

  return res.json() as Promise<T>;
}
