import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

// Simple in-memory rate limiter: max 5 requests per IP per 60 seconds
const rateLimit = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.reset) {
    rateLimit.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ZIP_RE = /^\d{5}$/;

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, email, phone, zipCode, serviceType, estimatedGallons, optIn } = body as Record<string, unknown>;

  if (!name || typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 100) {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
  }
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  if (zipCode && (typeof zipCode !== 'string' || !ZIP_RE.test(zipCode))) {
    return NextResponse.json({ error: 'Invalid ZIP code' }, { status: 400 });
  }
  if (phone && (typeof phone !== 'string' || phone.length > 20)) {
    return NextResponse.json({ error: 'Invalid phone' }, { status: 400 });
  }

  try {
    const res = await fetch(`${STRAPI_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: typeof phone === 'string' ? phone.trim() : undefined,
          zipCode,
          serviceType,
          estimatedGallons,
          optIn: Boolean(optIn),
        },
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
