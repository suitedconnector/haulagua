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
  console.log('[upload] STRAPI_URL:', STRAPI_URL);
  console.log('[upload] STRAPI_TOKEN set:', !!STRAPI_TOKEN);
  console.log('[upload] STRAPI_URL env:', process.env.STRAPI_URL);
  console.log('[upload] NEXT_PUBLIC_STRAPI_URL env:', process.env.NEXT_PUBLIC_STRAPI_URL);
  console.log('[upload] STRAPI_PROD_API_TOKEN set:', !!process.env.STRAPI_PROD_API_TOKEN);
  console.log('[upload] STRAPI_API_TOKEN set:', !!process.env.STRAPI_API_TOKEN);

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
  console.log('[upload] file name:', file.name, 'type:', file.type, 'size:', file.size);

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

    const uploadUrl = `${STRAPI_URL}/api/upload`;
    console.log('[upload] POSTing to:', uploadUrl);

    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      },
      body: strapiForm,
    });

    console.log('[upload] Strapi response status:', res.status);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[upload] Strapi upload error body:', JSON.stringify(err));
      return NextResponse.json({ error: 'Upload failed', detail: err }, { status: 500 });
    }

    const data = await res.json();
    const uploaded = Array.isArray(data) ? data[0] : data;
    const rawUrl: string | undefined = uploaded?.url;

    console.log('[upload] rawUrl from Strapi:', rawUrl);

    if (!rawUrl) {
      return NextResponse.json({ error: 'No URL returned from upload' }, { status: 500 });
    }

    // Strapi returns relative paths locally, absolute URLs in production
    const url = rawUrl.startsWith('http') ? rawUrl : `${STRAPI_URL}${rawUrl}`;

    return NextResponse.json({ url }, { status: 200 });
  } catch (err) {
    console.error('[upload] fetch threw:', err);
    return NextResponse.json({ error: 'Internal server error', detail: String(err) }, { status: 500 });
  }
}
