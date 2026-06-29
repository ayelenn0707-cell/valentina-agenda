import { NextResponse } from 'next/server';
import { verifyPin, createSession, initPin } from '@/lib/auth';
import { ensureInitialized } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    if (typeof pin !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'PIN requerido' },
        { status: 400 },
      );
    }

    await ensureInitialized();
    await initPin();

    if (!(await verifyPin(pin))) {
      return NextResponse.json(
        { ok: false, error: 'PIN incorrecto' },
        { status: 401 },
      );
    }

    await createSession();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Error interno' },
      { status: 500 },
    );
  }
}
