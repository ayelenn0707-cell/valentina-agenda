import { NextResponse } from 'next/server';
import { getTurno, updateTurno } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const turno = await getTurno(parseInt(id));

    if (!turno) {
      return NextResponse.json(
        { error: 'Turno no encontrado' },
        { status: 404 },
      );
    }

    return NextResponse.json(turno);
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener turno' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await request.json();
    await updateTurno(parseInt(id), data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Error al actualizar turno' },
      { status: 500 },
    );
  }
}
