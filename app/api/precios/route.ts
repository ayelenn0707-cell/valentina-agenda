import { NextResponse } from 'next/server';
import { getPrecios, createPrecio } from '@/lib/db';

export async function GET() {
  try {
    const precios = getPrecios(true);
    return NextResponse.json(precios);
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener precios' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const precio = createPrecio(data);
    return NextResponse.json(precio, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Error al crear precio' },
      { status: 500 },
    );
  }
}
