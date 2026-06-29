import { NextResponse } from 'next/server';
import { getClientes, createCliente } from '@/lib/db';

export async function GET() {
  try {
    const clientes = getClientes();
    return NextResponse.json(clientes);
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener clientes' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const cliente = createCliente(data);
    return NextResponse.json(cliente, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Error al crear cliente' },
      { status: 500 },
    );
  }
}
