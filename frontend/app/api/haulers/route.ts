import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL =
  process.env.STRAPI_URL ??
  process.env.NEXT_PUBLIC_STRAPI_URL ??
  'http://localhost:1337';

// Use production token when available, fall back to local token
const STRAPI_TOKEN =
  process.env.STRAPI_PROD_API_TOKEN ?? process.env.STRAPI_API_TOKEN;

// Prefer non-prefixed server-only var; fall back to NEXT_PUBLIC for backwards compat
const WEB3FORMS_KEY =
  process.env.WEB3FORMS_KEY ?? process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

const STRAPI_HEADERS = {
  'Content-Type': 'application/json',
  ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
};

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function patchCertificate(haulerId: number, certUrl: string): Promise<void> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/haulers/${haulerId}`, {
      method: 'PUT',
      headers: STRAPI_HEADERS,
      body: JSON.stringify({ data: { insuranceCertificate: certUrl } }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[haulers] PATCH certificate failed:', err);
    } else {
      console.log('[haulers] insuranceCertificate patched on hauler', haulerId);
    }
  } catch (err) {
    console.error('[haulers] PATCH certificate error:', err);
  }
}

async function sendSignupNotification({
  haulerName,
  email,
  city,
  state,
  phone,
  certUrl,
}: {
  haulerName: string;
  email: string;
  city: string | null;
  state: string | null;
  phone: unknown;
  certUrl: string | null;
}) {
  console.log('[haulers] WEB3FORMS_KEY set:', !!WEB3FORMS_KEY);
  if (!WEB3FORMS_KEY) {
    console.warn('[haulers] WEB3FORMS_KEY missing — skipping notification');
    return;
  }

  const subject = certUrl
    ? `New Hauler Signup + Certificate — ${haulerName} — Haulagua`
    : `New Hauler Signup — ${haulerName} — Haulagua`;

  const lines = [
    `Hauler:   ${haulerName}`,
    `Email:    ${email}`,
    `Phone:    ${typeof phone === 'string' ? phone : '—'}`,
    `Location: ${[city, state].filter(Boolean).join(', ') || '—'}`,
  ];
  if (certUrl) lines.push(`Certificate: ${certUrl}`);
  lines.push('', 'Review in Strapi admin: https://haulagua.onrender.com/admin');

  try {
    console.log('[haulers] Sending Web3Forms notification...');
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject,
        from_name: 'Haulagua',
        email,
        message: lines.join('\n'),
      }),
    });
    const responseBody = await res.json().catch(() => ({}));
    console.log('[haulers] Web3Forms response:', res.status, JSON.stringify(responseBody));
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.log('[haulers] Web3Forms error:', error.message);
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
  const haulerEmail = (email as string).trim().toLowerCase();
  const haulerCity = typeof city === 'string' ? city.trim() || null : null;
  const haulerState = typeof state === 'string' ? state.trim() || null : null;
  const certUrl =
    typeof insuranceCertificate === 'string' && insuranceCertificate.trim()
      ? insuranceCertificate.trim()
      : null;

  const payload = {
    data: {
      name: haulerName,
      slug: toSlug(haulerName),
      email: haulerEmail,
      phone: phone ?? null,
      website: website ?? null,
      city: haulerCity,
      state: haulerState,
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
      // Include in creation payload; will also be patched separately to guarantee it saves
      insuranceCertificate: certUrl,
    },
  };

  try {
    const res = await fetch(`${STRAPI_URL}/api/haulers`, {
      method: 'POST',
      headers: STRAPI_HEADERS,
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[haulers] Strapi POST error:', data);
      return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
    }

    const haulerId: number | undefined = data?.data?.id;

    // If a cert URL was provided, explicitly PATCH the hauler to guarantee the field is saved.
    if (certUrl && haulerId) {
      await patchCertificate(haulerId, certUrl);
    }

    // Await notification so logs aren't cut off before Vercel sends the response
    await sendSignupNotification({
      haulerName,
      email: haulerEmail,
      city: haulerCity,
      state: haulerState,
      phone,
      certUrl,
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error('[haulers] create error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
