import { NextRequest, NextResponse } from 'next/server';

// STRAPI_URL (server-only) takes precedence; falls back to the public var, then localhost
const STRAPI_URL =
  process.env.STRAPI_URL ??
  process.env.NEXT_PUBLIC_STRAPI_URL ??
  'http://localhost:1337';

// Use production token when available (live site), fall back to local token
const STRAPI_TOKEN =
  process.env.STRAPI_PROD_API_TOKEN ?? process.env.STRAPI_API_TOKEN;

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  let file: File | null = null;
  try {
    const form = await req.formData();
    file = form.get('file') as File | null;
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Only PDF, JPG, and PNG files are accepted' },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File must be under 10 MB' }, { status: 400 });
  }

  try {
    const strapiForm = new FormData();
    strapiForm.append('files', file);

    const res = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      headers: {
        ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      },
      body: strapiForm,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Strapi upload error:', err);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    const data = await res.json();
    const uploaded = Array.isArray(data) ? data[0] : data;
    const rawUrl: string | undefined = uploaded?.url;

    if (!rawUrl) {
      return NextResponse.json({ error: 'No URL returned from upload' }, { status: 500 });
    }

    // Strapi returns relative paths locally, absolute URLs in production
    const url = rawUrl.startsWith('http') ? rawUrl : `${STRAPI_URL}${rawUrl}`;

    return NextResponse.json({ url }, { status: 200 });
  } catch (err) {
    console.error('Upload route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
