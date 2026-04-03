import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'tal@trezian.com';

async function sendReviewNotification({
  haulerSlug,
  reviewerName,
  rating,
  comment,
}: {
  haulerSlug: string;
  reviewerName: string;
  rating: number;
  comment: string;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const text = [
    `Hauler Slug:   ${haulerSlug}`,
    `Reviewer Name: ${reviewerName}`,
    `Rating:        ${rating}/5`,
    `Comment:       ${comment}`,
    ``,
    `Review this at: https://haulagua.com/haulers/${haulerSlug}`,
    `Approve or reject in Strapi admin.`,
  ].join('\n');

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: 'Haulagua <notifications@haulagua.com>',
      to: ADMIN_EMAIL,
      subject: `New Review (${rating}/5) for ${haulerSlug} — Haulagua.com`,
      text,
    });
    if (error) console.error('[reviews] Resend error:', error.message);
  } catch (err) {
    console.error('[reviews] Resend error:', err);
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { haulerSlug, reviewerName, rating, comment } = body as Record<string, unknown>;

  if (!haulerSlug || typeof haulerSlug !== 'string' || !haulerSlug.trim()) {
    return NextResponse.json({ error: 'haulerSlug is required' }, { status: 400 });
  }
  if (!reviewerName || typeof reviewerName !== 'string' || reviewerName.trim().length < 2) {
    return NextResponse.json({ error: 'Reviewer name is required (min 2 chars)' }, { status: 400 });
  }
  if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be an integer between 1 and 5' }, { status: 400 });
  }
  if (!comment || typeof comment !== 'string' || comment.trim().length < 10) {
    return NextResponse.json({ error: 'Comment is required (min 10 chars)' }, { status: 400 });
  }

  try {
    const res = await fetch(`${STRAPI_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        data: {
          haulerSlug: haulerSlug.trim(),
          reviewerName: reviewerName.trim(),
          rating,
          comment: comment.trim(),
          isApproved: false,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Strapi reviews error:', err);
      return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }

    await sendReviewNotification({
      haulerSlug: haulerSlug.trim(),
      reviewerName: reviewerName.trim(),
      rating,
      comment: comment.trim(),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('Reviews route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
