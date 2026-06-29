import { NextResponse } from 'next/server';
import {
  getTurnosPorFecha,
  getTurnosPorRango,
  getTurnosPorCliente,
  createTurno,
} from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fec = searchParams.get('fec');
    const fecDesde = searchParams.get('fecDesde');
    const fecHasta = searchParams.get('fecHasta');
    const cid = searchParams.get('cid');

    let turnos;
    if (fec) {
      turnos = getTurnosPorFecha(fec);
    } else if (fecDesde && fecHasta) {
      turnos = getTurnosPorRango(fecDesde, fecHasta);
    } else if (cid) {
      turnos = getTurnosPorCliente(parseInt(cid));
    } else {
      turnos = getTurnosPorFecha();
    }

    return NextResponse.json(turnos);
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener turnos' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const turno = createTurno(data);
    return NextResponse.json(turno, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Error al crear turno' },
      { status: 500 },
    );
  }
}
