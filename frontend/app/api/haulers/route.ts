import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import haulersData from '@/data/haulers.json';

const allHaulers = (haulersData as { data: Array<{ attributes: { name: string; email: string | null } }> }).data;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'tal@trezian.com';

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
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

  try {
    console.log('[haulers] Sending Resend notification...');
    const resend = new Resend(process.env.RESEND_API_KEY);
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

export async function GET() {
  return NextResponse.json(haulersData, { status: 200 });
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

  const isDuplicate = allHaulers.some(
    (h) =>
      h.attributes.name.toLowerCase() === haulerName.toLowerCase() ||
      (h.attributes.email && h.attributes.email.toLowerCase() === haulerEmail)
  );
  if (isDuplicate) {
    return NextResponse.json(
      { error: 'A listing with this business name or email already exists.' },
      { status: 409 }
    );
  }

  // Log the submission so it can be added to the JSON manually
  console.log('[haulers] New signup:', JSON.stringify({
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
    industries: industries ?? null,
    insuranceCertificate: certUrl,
  }));

  await sendSignupNotification({
    haulerName,
    email: haulerEmail,
    city: haulerCity,
    state: haulerState,
    phone,
    certUrl,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
