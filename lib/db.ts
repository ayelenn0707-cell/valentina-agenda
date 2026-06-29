import { createClient } from "@libsql/client";
import type { Client, Turno, Precio } from "./types";

let turso: ReturnType<typeof createClient> | null = null;

export function getDB() {
  if (!turso) {
    const url =
      process.env.TURSO_DB_URL ??
      `file:${process.env.DB_PATH ?? "./data.db"}`;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    turso = createClient({ url, ...(authToken ? { authToken } : {}) });
  }
  return turso;
}

async function ensureSchema() {
  const db = getDB();
  const tables = await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='clientes'"
  );
  if (tables.rows.length > 0) return;

  await db.execute(
    `CREATE TABLE clientes (
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
    )`
  );
  await db.execute(
    `CREATE TABLE turnos (
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
    )`
  );
  await db.execute(
    `CREATE TABLE precios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      serv TEXT NOT NULL DEFAULT '',
      pre INTEGER NOT NULL DEFAULT 0,
      act INTEGER NOT NULL DEFAULT 1
    )`
  );
  await db.execute(
    `CREATE TABLE config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`
  );
}

function rowToClient(row: any): Client {
  return { ...row } as Client;
}
function rowToTurno(row: any): Turno {
  return { ...row } as Turno;
}
function rowToPrecio(row: any): Precio {
  return { ...row } as Precio;
}

// ---- Clientes ----

export async function getClientes(): Promise<Client[]> {
  const res = await getDB().execute("SELECT * FROM clientes ORDER BY nombre");
  return res.rows.map(rowToClient);
}

export async function getCliente(id: number): Promise<Client | undefined> {
  const res = await getDB().execute({ sql: "SELECT * FROM clientes WHERE id = ?", args: [id] });
  return res.rows[0] ? rowToClient(res.rows[0]) : undefined;
}

export async function createCliente(data: Omit<Client, "id" | "cancel">): Promise<Client> {
  const res = await getDB().execute({
    sql: `INSERT INTO clientes (nombre, wpp, edad, dir, ig, alerg, emb, cond, forma, largo, servHab, notas, fav, nueva)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [data.nombre, data.wpp, data.edad, data.dir, data.ig, data.alerg, data.emb, data.cond, data.forma, data.largo, data.servHab, data.notas, data.fav, data.nueva],
  });
  return (await getCliente(Number(res.lastInsertRowid)))!;
}

export async function updateCliente(id: number, data: Partial<Client>): Promise<void> {
  const keys = Object.keys(data) as (keyof Client)[];
  if (keys.length === 0) return;
  const setClause = keys.map((k) => `${k} = ?`).join(", ");
  const values = keys.map((k) => data[k]);
  await getDB().execute({
    sql: `UPDATE clientes SET ${setClause} WHERE id = ?`,
    args: [...values, id],
  });
}

// ---- Turnos ----

export async function getTurnosPorFecha(fec?: string): Promise<Turno[]> {
  const date = fec ?? new Date().toISOString().slice(0, 10);
  const res = await getDB().execute({ sql: "SELECT * FROM turnos WHERE fec = ? ORDER BY hor", args: [date] });
  return res.rows.map(rowToTurno);
}

export async function getTurnosPorRango(fecDesde: string, fecHasta: string): Promise<Turno[]> {
  const res = await getDB().execute({
    sql: "SELECT * FROM turnos WHERE fec BETWEEN ? AND ? ORDER BY fec, hor",
    args: [fecDesde, fecHasta],
  });
  return res.rows.map(rowToTurno);
}

export async function getTurnosPorCliente(cid: number): Promise<Turno[]> {
  const res = await getDB().execute({
    sql: "SELECT * FROM turnos WHERE cid = ? ORDER BY fec DESC, hor DESC",
    args: [cid],
  });
  return res.rows.map(rowToTurno);
}

export async function getTurno(id: number): Promise<Turno | undefined> {
  const res = await getDB().execute({ sql: "SELECT * FROM turnos WHERE id = ?", args: [id] });
  return res.rows[0] ? rowToTurno(res.rows[0]) : undefined;
}

export async function createTurno(data: Omit<Turno, "id">): Promise<Turno> {
  const res = await getDB().execute({
    sql: `INSERT INTO turnos (cid, fec, hor, serv, reconst, remoc, tot, met, pg, est, notas, mot)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [data.cid, data.fec, data.hor, data.serv, data.reconst, data.remoc, data.tot, data.met, data.pg, data.est, data.notas, data.mot],
  });
  return (await getTurno(Number(res.lastInsertRowid)))!;
}

export async function updateTurno(id: number, data: Partial<Turno>): Promise<void> {
  const keys = Object.keys(data) as (keyof Turno)[];
  if (keys.length === 0) return;
  const setClause = keys.map((k) => `${k} = ?`).join(", ");
  const values = keys.map((k) => data[k]);
  await getDB().execute({
    sql: `UPDATE turnos SET ${setClause} WHERE id = ?`,
    args: [...values, id],
  });
}

// ---- Precios ----

export async function getPrecios(onlyActive?: boolean): Promise<Precio[]> {
  const sql = onlyActive
    ? "SELECT * FROM precios WHERE act = 1 ORDER BY serv"
    : "SELECT * FROM precios ORDER BY serv";
  const res = await getDB().execute(sql);
  return res.rows.map(rowToPrecio);
}

export async function createPrecio(data: Omit<Precio, "id">): Promise<Precio> {
  const res = await getDB().execute({
    sql: "INSERT INTO precios (serv, pre, act) VALUES (?, ?, ?)",
    args: [data.serv, data.pre, data.act],
  });
  const r2 = await getDB().execute({
    sql: "SELECT * FROM precios WHERE id = ?",
    args: [Number(res.lastInsertRowid)],
  });
  return rowToPrecio(r2.rows[0]);
}

export async function updatePrecio(id: number, data: Partial<Precio>): Promise<void> {
  const keys = Object.keys(data) as (keyof Precio)[];
  if (keys.length === 0) return;
  const setClause = keys.map((k) => `${k} = ?`).join(", ");
  const values = keys.map((k) => data[k]);
  await getDB().execute({
    sql: `UPDATE precios SET ${setClause} WHERE id = ?`,
    args: [...values, id],
  });
}

export async function deletePrecio(id: number): Promise<void> {
  await getDB().execute({ sql: "DELETE FROM precios WHERE id = ?", args: [id] });
}

// ---- Config ----

export async function getConfig(key: string): Promise<string | undefined> {
  const res = await getDB().execute({ sql: "SELECT value FROM config WHERE key = ?", args: [key] });
  return res.rows[0]?.value as string | undefined;
}

export async function setConfig(key: string, value: string): Promise<void> {
  await getDB().execute({
    sql: "INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)",
    args: [key, value],
  });
}

// ---- Init ----

let schemaEnsured = false;

export async function ensureInitialized(): Promise<void> {
  if (schemaEnsured) return;
  await ensureSchema();
  schemaEnsured = true;
}
