import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import haulersData from '@/data/haulers-flat.json';

const allHaulers = haulersData as Array<{ name: string; email?: string | null }>;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'tal@trezian.com';

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function sendSignupNotification(payload: Record<string, unknown>) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[haulers] RESEND_API_KEY missing — skipping notification');
    return;
  }

  const lines = [
    `Business Name: ${payload.name || '—'}`,
    `Owner Name: ${payload.industries?.ownerName || '—'}`,
    `Email: ${payload.email || '—'}`,
    `Phone: ${payload.phone || '—'}`,
    `Street Address: ${payload.address || '—'}`,
    `City: ${payload.city || '—'}`,
    `State: ${payload.state || '—'}`,
    `ZIP: ${payload.zip || '—'}`,
    `Website: ${payload.website || '—'}`,
    `Year Founded: ${payload.industries?.yearFounded || '—'}`,
    `Services: ${payload.industries?.serviceTypes?.join(', ') || '—'}`,
    `Truck Capacity: ${payload.truckCapacity || '—'} gal`,
    `Hose Length: ${payload.hoseLength || '—'} ft`,
    `Min Fee: $${payload.minFee || '—'}`,
    `Water Source: ${payload.industries?.waterSource || '—'}`,
    `Water Type: ${payload.waterType || '—'}`,
    `Potable Certified: ${payload.industries?.potableCertified ? 'Yes' : 'No'}`,
    `Overflow Prevention: ${payload.industries?.overflowPrevention ? 'Yes' : 'No'}`,
    `Description: ${payload.description || '—'}`,
    `Service Area: ${payload.serviceArea || '—'}`,
    `Insurance Certificate: ${payload.insuranceCertificate || '—'}`,
  ];

  try {
    console.log('[haulers] Sending Resend notification...');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: 'Haulagua <notifications@haulagua.com>',
      to: ADMIN_EMAIL,
      subject: `New Hauler Signup — ${payload.name} — Haulagua`,
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
    name, email, phone, website, city, state, zip, address, description, serviceArea,
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
      h.name.toLowerCase() === haulerName.toLowerCase() ||
      (h.email && h.email.toLowerCase() === haulerEmail)
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

  await sendSignupNotification(body);

  const webhookUrl = "https://script.google.com/macros/s/AKfycbyjtx2HW0uWh-7FabAZHXxRxKHpdpuuwsxRAcxppJysZYYWLGKY6hQampCbIUJXEOwJ/exec";
  try {
    const payload = {
      name: haulerName,
      email: haulerEmail,
      phone: phone ?? null,
      website: website ?? null,
      address: typeof address === 'string' ? address.trim() || null : null,
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
    };
    console.log('[haulers] Sending webhook payload:', JSON.stringify(payload));
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log('[haulers] Webhook response status:', response.status);
    const responseText = await response.text();
    console.log('[haulers] Webhook response:', responseText);
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error('[haulers] Webhook error:', error);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
