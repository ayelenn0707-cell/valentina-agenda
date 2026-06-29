import { NextResponse } from 'next/server';
import { checkSession } from '@/lib/auth';

export async function GET() {
  try {
    const authenticated = await checkSession();
    return NextResponse.json({ authenticated });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
