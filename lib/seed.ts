import { getClientes, createCliente, createTurno, createPrecio } from './db';
import type { Client, Turno, Precio } from './types';

/**
 * Seed the database with sample data if it is empty.
 * Safe to call on every startup — only inserts when the clientes table has
 * zero rows.
 *
 * @returns A summary of inserted rows: { clients, turnos, precios }.
 *          All counts are 0 when seeding was skipped (data already exists).
 */
export function seedData(): { clients: number; turnos: number; precios: number } {
  if (getClientes().length > 0) {
    return { clients: 0, turnos: 0, precios: 0 };
  }

  // -----------------------------------------------------------------------
  // Sample clientes
  // -----------------------------------------------------------------------
  const sampleClientes: Omit<Client, 'id' | 'cancel'>[] = [
    {
      nombre: 'María García',
      wpp: '11 2345-6789',
      edad: 29,
      dir: 'Palermo',
      ig: '@mariagarcia',
      alerg: '',
      emb: 0,
      cond: '',
      forma: '',
      largo: '',
      servHab: '',
      notas: '',
      fav: 1,
      nueva: 0,
    },
    {
      nombre: 'Laura Martínez',
      wpp: '11 3456-7890',
      edad: 34,
      dir: 'Belgrano',
      ig: '@lauram',
      alerg: 'Látex',
      emb: 0,
      cond: '',
      forma: 'stiletto',
      largo: 'largo',
      servHab: 'soft_gel',
      notas: '',
      fav: 0,
      nueva: 0,
    },
    {
      nombre: 'Carla Rodríguez',
      wpp: '11 4567-8901',
      edad: 25,
      dir: 'Recoleta',
      ig: '@carlarod',
      alerg: '',
      emb: 1,
      cond: '',
      forma: 'cuadrada',
      largo: 'corto',
      servHab: 'esculpidas',
      notas: '',
      fav: 1,
      nueva: 0,
    },
    {
      nombre: 'Sol Pérez',
      wpp: '11 5678-9012',
      edad: 31,
      dir: 'Nuñez',
      ig: '@solperez',
      alerg: '',
      emb: 0,
      cond: 'Diabetes tipo 2',
      forma: 'coffin',
      largo: 'medio',
      servHab: 'semipermanente',
      notas: '',
      fav: 0,
      nueva: 0,
    },
    {
      nombre: 'Lucrecia Fernández',
      wpp: '11 6789-0123',
      edad: 27,
      dir: 'Palermo',
      ig: '@lucref',
      alerg: 'Acrílico',
      emb: 0,
      cond: '',
      forma: 'almendra',
      largo: 'largo',
      servHab: 'kapping',
      notas: '',
      fav: 1,
      nueva: 0,
    },
    {
      nombre: 'Valentina Gómez',
      wpp: '11 7890-1234',
      edad: 22,
      dir: 'Belgrano',
      ig: '',
      alerg: '',
      emb: 0,
      cond: '',
      forma: '',
      largo: '',
      servHab: '',
      notas: '',
      fav: 0,
      nueva: 1,
    },
  ];

  // -----------------------------------------------------------------------
  // Sample turnos (relative to today)
  // -----------------------------------------------------------------------
  const hoy = new Date().toISOString().slice(0, 10);
  const af = (d: number): string => {
    const r = new Date();
    r.setDate(r.getDate() + d);
    return r.toISOString().slice(0, 10);
  };

  const sampleTurnos: Omit<Turno, 'id'>[] = [
    {
      cid: 1,
      fec: hoy,
      hor: '10:00',
      serv: 'kapping',
      reconst: 0,
      remoc: 0,
      tot: 18000,
      met: 'efectivo',
      pg: 'pagado',
      est: 'completado',
      notas: '',
      mot: '',
    },
    {
      cid: 2,
      fec: hoy,
      hor: '11:30',
      serv: 'soft_gel',
      reconst: 0,
      remoc: 0,
      tot: 22000,
      met: 'mercado_pago',
      pg: 'seña',
      est: 'confirmado',
      notas: '',
      mot: '',
    },
    {
      cid: 3,
      fec: hoy,
      hor: '14:00',
      serv: 'esculpidas',
      reconst: 0,
      remoc: 0,
      tot: 35000,
      met: 'efectivo',
      pg: 'pagado',
      est: 'completado',
      notas: '',
      mot: '',
    },
    {
      cid: 4,
      fec: hoy,
      hor: '16:00',
      serv: 'reconstruccion',
      reconst: 2,
      remoc: 0,
      tot: 5000,
      met: '',
      pg: 'pendiente',
      est: 'cancelado',
      notas: '',
      mot: 'Canceló por emergencia',
    },
    {
      cid: 5,
      fec: af(1),
      hor: '17:30',
      serv: 'kapping',
      reconst: 0,
      remoc: 0,
      tot: 18000,
      met: '',
      pg: 'pendiente',
      est: 'agendado',
      notas: '',
      mot: '',
    },
    {
      cid: 1,
      fec: af(2),
      hor: '10:00',
      serv: 'soft_gel',
      reconst: 0,
      remoc: 0,
      tot: 22000,
      met: '',
      pg: 'pendiente',
      est: 'agendado',
      notas: '',
      mot: '',
    },
    {
      cid: 3,
      fec: af(3),
      hor: '15:00',
      serv: 'esculpidas',
      reconst: 0,
      remoc: 0,
      tot: 35000,
      met: '',
      pg: 'seña',
      est: 'confirmado',
      notas: '',
      mot: '',
    },
    {
      cid: 6,
      fec: af(4),
      hor: '09:30',
      serv: 'kapping',
      reconst: 0,
      remoc: 0,
      tot: 18000,
      met: '',
      pg: 'pendiente',
      est: 'agendado',
      notas: '',
      mot: '',
    },
  ];

  // -----------------------------------------------------------------------
  // Sample precios
  // -----------------------------------------------------------------------
  const samplePrecios: Omit<Precio, 'id'>[] = [
    { serv: 'kapping', pre: 18000, act: 1 },
    { serv: 'soft_gel', pre: 22000, act: 1 },
    { serv: 'esculpidas', pre: 35000, act: 1 },
    { serv: 'semipermanente', pre: 12000, act: 1 },
    { serv: 'nail_art', pre: 5000, act: 1 },
    { serv: 'reconstruccion', pre: 3000, act: 1 },
    { serv: 'remocion', pre: 2000, act: 1 },
    { serv: 'otro', pre: 0, act: 1 },
  ];

  // ---- insert ----

  for (const c of sampleClientes) createCliente(c);
  for (const t of sampleTurnos) createTurno(t);
  for (const p of samplePrecios) createPrecio(p);

  return {
    clients: sampleClientes.length,
    turnos: sampleTurnos.length,
    precios: samplePrecios.length,
  };
}
