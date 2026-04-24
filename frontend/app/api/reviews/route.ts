import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'Reviews temporarily unavailable' }, { status: 503 });
}
