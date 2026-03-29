import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, email, phone, website, city, state, zip, description, serviceArea,
          minFee, truckCapacity, hoseLength, waterType, industries } = body as Record<string, unknown>;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: 'Business name is required' }, { status: 400 });
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }

  const payload = {
    data: {
      name: (name as string).trim(),
      slug: toSlug(name as string),
      email: (email as string).trim().toLowerCase(),
      phone: phone ?? null,
      website: website ?? null,
      city: city ?? null,
      state: state ?? null,
      zip: zip ?? null,
      description: description ?? null,
      serviceArea: serviceArea ?? null,
      minFee: minFee ? Number(minFee) : null,
      truckCapacity: truckCapacity ? Number(truckCapacity) : null,
      hoseLength: hoseLength ? Number(hoseLength) : null,
      waterType: waterType ?? null,
      isVerifiedPro: false,
      isActive: true,
      industries: industries ?? null,
    },
  };

  try {
    const res = await fetch(`${STRAPI_URL}/api/haulers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Strapi error:', data);
      return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error('Hauler create error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
