import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const STRAPI_URL =
  process.env.STRAPI_URL ??
  process.env.NEXT_PUBLIC_STRAPI_URL ??
  'http://localhost:1337';

// Use production token when available, fall back to local token
const STRAPI_TOKEN =
  process.env.STRAPI_PROD_API_TOKEN ?? process.env.STRAPI_API_TOKEN;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'tal@trezian.com';
const resend = new Resend(process.env.RESEND_API_KEY);

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
  if (!process.env.RESEND_API_KEY) {
    console.warn('[haulers] RESEND_API_KEY missing — skipping notification');
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
    console.log('[haulers] Sending Resend notification...');
    const { error } = await resend.emails.send({
      from: 'Haulagua <notifications@haulagua.com>',
      to: ADMIN_EMAIL,
      subject,
      text: lines.join('\n'),
    });
    if (error) {
      console.log('[haulers] Resend error:', error.message);
    } else {
      console.log('[haulers] Resend notification sent');
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.log('[haulers] Resend error:', error.message);
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
      console.error('[haulers] Strapi POST error status:', res.status);
      console.error('[haulers] Strapi POST error body:', JSON.stringify(data, null, 2));

      const isUnique =
        data?.error?.message === 'This attribute must be unique' ||
        JSON.stringify(data).includes('unique');

      if (isUnique) {
        return NextResponse.json(
          { error: 'A listing with this business name or email already exists.' },
          { status: 409 }
        );
      }

      return NextResponse.json({ error: 'Failed to create listing', detail: data }, { status: 500 });
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
