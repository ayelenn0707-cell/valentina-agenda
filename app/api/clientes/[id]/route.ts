import { NextResponse } from 'next/server';
import { getCliente, updateCliente } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const cliente = await getCliente(parseInt(id));

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 },
      );
    }

    return NextResponse.json(cliente);
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener cliente' },
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
    await updateCliente(parseInt(id), data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Error al actualizar cliente' },
      { status: 500 },
    );
  }
}
