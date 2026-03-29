import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

async function sendClaimNotification({
  haulerSlug,
  ownerName,
  email,
  phone,
  message,
}: {
  haulerSlug: string;
  ownerName: string;
  email: string;
  phone: string | null;
  message: string | null;
}) {
  if (!WEB3FORMS_KEY) return;

  const summary = [
    `Business Slug: ${haulerSlug}`,
    `Owner Name:    ${ownerName}`,
    `Email:         ${email}`,
    `Phone:         ${phone ?? '—'}`,
    `Message:       ${message ?? '—'}`,
  ].join('\n');

  try {
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `New Listing Claim - ${haulerSlug} - Haulagua.com`,
        from_name: ownerName,
        email,
        message: summary,
      }),
    });
  } catch (err) {
    // Non-blocking — log but don't surface to the user
    console.error('Web3Forms notification failed:', err);
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { haulerSlug, ownerName, email, phone, message } = body as Record<string, unknown>;

  if (!haulerSlug || typeof haulerSlug !== 'string' || !haulerSlug.trim()) {
    return NextResponse.json({ error: 'haulerSlug is required' }, { status: 400 });
  }
  if (!ownerName || typeof ownerName !== 'string' || ownerName.trim().length < 2) {
    return NextResponse.json({ error: 'Owner name is required' }, { status: 400 });
  }
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`${STRAPI_URL}/api/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        data: {
          haulerSlug: haulerSlug.trim(),
          ownerName: ownerName.trim(),
          email: (email as string).trim().toLowerCase(),
          phone: typeof phone === 'string' ? phone.trim() || null : null,
          message: typeof message === 'string' ? message.trim() || null : null,
          status: 'pending',
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Strapi claims error:', err);
      return NextResponse.json({ error: 'Failed to submit claim' }, { status: 500 });
    }

    // Fire-and-forget — does not block the response
    sendClaimNotification({
      haulerSlug: haulerSlug.trim(),
      ownerName: ownerName.trim(),
      email: (email as string).trim().toLowerCase(),
      phone: typeof phone === 'string' ? phone.trim() || null : null,
      message: typeof message === 'string' ? message.trim() || null : null,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('Claims route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
