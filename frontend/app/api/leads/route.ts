import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'Lead capture temporarily unavailable' }, { status: 503 });
}
