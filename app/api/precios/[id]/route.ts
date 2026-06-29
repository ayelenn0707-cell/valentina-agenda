import { NextResponse } from 'next/server';
import { getPrecios, updatePrecio, deletePrecio } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const precios = await getPrecios();
    const precio = precios.find((p) => p.id === parseInt(id));

    if (!precio) {
      return NextResponse.json(
        { error: 'Precio no encontrado' },
        { status: 404 },
      );
    }

    return NextResponse.json(precio);
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener precio' },
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
    await updatePrecio(parseInt(id), data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Error al actualizar precio' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await deletePrecio(parseInt(id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Error al eliminar precio' },
      { status: 500 },
    );
  }
}
