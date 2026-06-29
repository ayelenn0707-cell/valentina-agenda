import Database from 'better-sqlite3';
import path from 'path';
import type { Client, Turno, Precio } from './types';

// ---------------------------------------------------------------------------
// Singleton connection
// ---------------------------------------------------------------------------

let db: Database.Database | null = null;

function initSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL DEFAULT '',
      wpp TEXT NOT NULL DEFAULT '',
      edad INTEGER NOT NULL DEFAULT 0,
      dir TEXT NOT NULL DEFAULT '',
      ig TEXT NOT NULL DEFAULT '',
      alerg TEXT NOT NULL DEFAULT '',
      emb INTEGER NOT NULL DEFAULT 0,
      cond TEXT NOT NULL DEFAULT '',
      forma TEXT NOT NULL DEFAULT '',
      largo TEXT NOT NULL DEFAULT '',
      servHab TEXT NOT NULL DEFAULT '',
      notas TEXT NOT NULL DEFAULT '',
      fav INTEGER NOT NULL DEFAULT 0,
      nueva INTEGER NOT NULL DEFAULT 0,
      cancel INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS turnos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cid INTEGER NOT NULL,
      fec TEXT NOT NULL,
      hor TEXT NOT NULL,
      serv TEXT NOT NULL DEFAULT '',
      reconst INTEGER NOT NULL DEFAULT 0,
      remoc INTEGER NOT NULL DEFAULT 0,
      tot INTEGER NOT NULL DEFAULT 0,
      met TEXT NOT NULL DEFAULT '',
      pg TEXT NOT NULL DEFAULT 'pendiente',
      est TEXT NOT NULL DEFAULT 'agendado',
      notas TEXT NOT NULL DEFAULT '',
      mot TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (cid) REFERENCES clientes(id)
    );

    CREATE TABLE IF NOT EXISTS precios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      serv TEXT NOT NULL DEFAULT '',
      pre INTEGER NOT NULL DEFAULT 0,
      act INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export function getDB(): Database.Database {
  if (!db) {
    const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initSchema(db);
  }
  return db;
}

// ---------------------------------------------------------------------------
// Clientes
// ---------------------------------------------------------------------------

export function getClientes(): Client[] {
  return getDB().prepare('SELECT * FROM clientes ORDER BY nombre').all() as Client[];
}

export function getCliente(id: number): Client | undefined {
  return getDB().prepare('SELECT * FROM clientes WHERE id = ?').get(id) as Client | undefined;
}

export function createCliente(data: Omit<Client, 'id' | 'cancel'>): Client {
  const stmt = getDB().prepare(
    `INSERT INTO clientes (nombre, wpp, edad, dir, ig, alerg, emb, cond, forma, largo, servHab, notas, fav, nueva)
     VALUES (@nombre, @wpp, @edad, @dir, @ig, @alerg, @emb, @cond, @forma, @largo, @servHab, @notas, @fav, @nueva)`,
  );
  const result = stmt.run(data);
  return getCliente(result.lastInsertRowid as number)!;
}

export function updateCliente(id: number, data: Partial<Client>): void {
  const keys = Object.keys(data) as (keyof Client)[];
  if (keys.length === 0) return;
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => data[k]);
  getDB()
    .prepare(`UPDATE clientes SET ${setClause} WHERE id = ?`)
    .run(...values, id);
}

// ---------------------------------------------------------------------------
// Turnos
// ---------------------------------------------------------------------------

export function getTurnosPorFecha(fec?: string): Turno[] {
  const date = fec ?? new Date().toISOString().slice(0, 10);
  return getDB().prepare('SELECT * FROM turnos WHERE fec = ? ORDER BY hor').all(date) as Turno[];
}

export function getTurnosPorRango(fecDesde: string, fecHasta: string): Turno[] {
  return getDB()
    .prepare('SELECT * FROM turnos WHERE fec BETWEEN ? AND ? ORDER BY fec, hor')
    .all(fecDesde, fecHasta) as Turno[];
}

export function getTurnosPorCliente(cid: number): Turno[] {
  return getDB()
    .prepare('SELECT * FROM turnos WHERE cid = ? ORDER BY fec DESC, hor DESC')
    .all(cid) as Turno[];
}

export function getTurno(id: number): Turno | undefined {
  return getDB().prepare('SELECT * FROM turnos WHERE id = ?').get(id) as Turno | undefined;
}

export function createTurno(data: Omit<Turno, 'id'>): Turno {
  const stmt = getDB().prepare(
    `INSERT INTO turnos (cid, fec, hor, serv, reconst, remoc, tot, met, pg, est, notas, mot)
     VALUES (@cid, @fec, @hor, @serv, @reconst, @remoc, @tot, @met, @pg, @est, @notas, @mot)`,
  );
  const result = stmt.run(data);
  return getTurno(result.lastInsertRowid as number)!;
}

export function updateTurno(id: number, data: Partial<Turno>): void {
  const keys = Object.keys(data) as (keyof Turno)[];
  if (keys.length === 0) return;
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => data[k]);
  getDB()
    .prepare(`UPDATE turnos SET ${setClause} WHERE id = ?`)
    .run(...values, id);
}

// ---------------------------------------------------------------------------
// Precios
// ---------------------------------------------------------------------------

export function getPrecios(onlyActive?: boolean): Precio[] {
  if (onlyActive) {
    return getDB().prepare('SELECT * FROM precios WHERE act = 1 ORDER BY serv').all() as Precio[];
  }
  return getDB().prepare('SELECT * FROM precios ORDER BY serv').all() as Precio[];
}

export function createPrecio(data: Omit<Precio, 'id'>): Precio {
  const stmt = getDB().prepare('INSERT INTO precios (serv, pre, act) VALUES (@serv, @pre, @act)');
  const result = stmt.run(data);
  return getDB()
    .prepare('SELECT * FROM precios WHERE id = ?')
    .get(result.lastInsertRowid as number) as Precio;
}

export function updatePrecio(id: number, data: Partial<Precio>): void {
  const keys = Object.keys(data) as (keyof Precio)[];
  if (keys.length === 0) return;
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => data[k]);
  getDB()
    .prepare(`UPDATE precios SET ${setClause} WHERE id = ?`)
    .run(...values, id);
}

export function deletePrecio(id: number): void {
  getDB().prepare('DELETE FROM precios WHERE id = ?').run(id);
}

// ---------------------------------------------------------------------------
// Config (key‑value store)
// ---------------------------------------------------------------------------

export function getConfig(key: string): string | undefined {
  const row = getDB()
    .prepare('SELECT value FROM config WHERE key = ?')
    .get(key) as { value: string } | undefined;
  return row?.value;
}

export function setConfig(key: string, value: string): void {
  getDB().prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').run(key, value);
}
