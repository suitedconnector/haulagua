import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'tal@trezian.com';

async function sendClaimNotification({
  haulerSlug,
  ownerName,
  email,
  phone,
  message,
  insuranceCertificateUrl,
}: {
  haulerSlug: string;
  ownerName: string;
  email: string;
  phone: string | null;
  message: string | null;
  insuranceCertificateUrl: string | null;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const lines = [
    `Business Slug: ${haulerSlug}`,
    `Owner Name:    ${ownerName}`,
    `Email:         ${email}`,
    `Phone:         ${phone ?? '—'}`,
    `Message:       ${message ?? '—'}`,
  ];
  if (insuranceCertificateUrl) {
    lines.push(`Certificate:   ${insuranceCertificateUrl}`);
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: 'Haulagua <notifications@haulagua.com>',
      to: ADMIN_EMAIL,
      subject: insuranceCertificateUrl
        ? `New Listing Claim + Insurance Certificate — ${haulerSlug} — Haulagua`
        : `New Listing Claim — ${haulerSlug} — Haulagua`,
      text: lines.join('\n'),
    });
    if (error) console.error('[claims] Resend error:', error.message);
  } catch (err) {
    console.error('[claims] Resend error:', err);
  }
}

/** PATCH the hauler's insuranceCertificate field by slug. Fire-and-forget. */
async function patchHaulerCertificate(haulerSlug: string, certUrl: string) {
  try {
    // Find the hauler ID by slug
    const findRes = await fetch(
      `${STRAPI_URL}/api/haulers?filters[slug][$eq]=${encodeURIComponent(haulerSlug)}&fields[0]=slug`,
      { headers: { ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}) } }
    );
    const findData = await findRes.json();
    const haulerId: number | undefined = findData.data?.[0]?.id;
    if (!haulerId) return;

    await fetch(`${STRAPI_URL}/api/haulers/${haulerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      },
      body: JSON.stringify({ data: { insuranceCertificate: certUrl } }),
    });
  } catch (err) {
    console.error('Failed to patch hauler certificate:', err);
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

  const { haulerSlug, ownerName, email, phone, message, insuranceCertificateUrl } =
    body as Record<string, unknown>;

  if (!haulerSlug || typeof haulerSlug !== 'string' || !haulerSlug.trim()) {
    return NextResponse.json({ error: 'haulerSlug is required' }, { status: 400 });
  }
  if (!ownerName || typeof ownerName !== 'string' || ownerName.trim().length < 2) {
    return NextResponse.json({ error: 'Owner name is required' }, { status: 400 });
  }
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }

  const certUrl =
    typeof insuranceCertificateUrl === 'string' && insuranceCertificateUrl.trim()
      ? insuranceCertificateUrl.trim()
      : null;

  try {
    const res = await fetch(`${STRAPI_URL}/api/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        data: {
          haulerSlug: (haulerSlug as string).trim(),
          ownerName: (ownerName as string).trim(),
          email: (email as string).trim().toLowerCase(),
          phone: typeof phone === 'string' ? phone.trim() || null : null,
          message: typeof message === 'string' ? message.trim() || null : null,
          status: 'pending',
          insuranceCertificateUrl: certUrl,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Strapi claims error:', err);
      return NextResponse.json({ error: 'Failed to submit claim' }, { status: 500 });
    }

    // Fire-and-forget: patch the hauler cert URL and send notification
    if (certUrl) {
      patchHaulerCertificate((haulerSlug as string).trim(), certUrl);
    }

    await sendClaimNotification({
      haulerSlug: (haulerSlug as string).trim(),
      ownerName: (ownerName as string).trim(),
      email: (email as string).trim().toLowerCase(),
      phone: typeof phone === 'string' ? phone.trim() || null : null,
      message: typeof message === 'string' ? message.trim() || null : null,
      insuranceCertificateUrl: certUrl,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('Claims route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
