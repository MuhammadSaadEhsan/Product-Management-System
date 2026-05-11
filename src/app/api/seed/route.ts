import { NextResponse } from 'next/server';
import { seedAdmin } from '@/lib/seed';

export async function POST() {
  try {
    await seedAdmin();
    return NextResponse.json({ success: true, message: 'Admin seeded' });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
