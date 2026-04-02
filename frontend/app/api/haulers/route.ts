import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function sendCertificateNotification(haulerName: string, certUrl: string) {
  if (!WEB3FORMS_KEY) return;
  try {
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `Insurance Certificate Uploaded — ${haulerName} — Haulagua`,
        from_name: 'Haulagua',
        message: [
          `Hauler: ${haulerName}`,
          `Certificate URL: ${certUrl}`,
          '',
          'Review and verify in Strapi admin.',
        ].join('\n'),
      }),
    });
  } catch (err) {
    console.error('Web3Forms notification failed:', err);
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const {
    name, email, phone, website, city, state, zip, description, serviceArea,
    minFee, truckCapacity, hoseLength, waterType, industries, insuranceCertificate,
  } = body as Record<string, unknown>;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: 'Business name is required' }, { status: 400 });
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }

  const haulerName = (name as string).trim();

  const payload = {
    data: {
      name: haulerName,
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
      insuranceCertificate: typeof insuranceCertificate === 'string' && insuranceCertificate.trim()
        ? insuranceCertificate.trim()
        : null,
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

    // Fire-and-forget notification when a certificate was uploaded
    if (payload.data.insuranceCertificate) {
      sendCertificateNotification(haulerName, payload.data.insuranceCertificate);
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error('Hauler create error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
