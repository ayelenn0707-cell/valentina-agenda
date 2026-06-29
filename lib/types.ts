// Shared types for Valentina Agenda

export interface Client {
  id: number;
  nombre: string;
  wpp: string;
  edad: number;
  dir: string;
  ig: string;
  alerg: string;
  emb: number;
  cond: string;
  forma: string;
  largo: string;
  servHab: string;
  notas: string;
  fav: number;
  nueva: number;
  cancel: number;
}

export interface Turno {
  id: number;
  cid: number;
  fec: string;
  hor: string;
  serv: string;
  reconst: number;
  remoc: number;
  tot: number;
  met: string;
  pg: string;
  est: string;
  notas: string;
  mot: string;
}

export interface Precio {
  id: number;
  serv: string;
  pre: number;
  act: number;
}

export const SL: Record<string, string> = {
  kapping: "Kapping",
  soft_gel: "Soft Gel",
  esculpidas: "Esculpidas",
  semipermanente: "Semipermanente",
  nail_art: "Nail Art",
  reconstruccion: "Reconstrucción",
  remocion: "Remoción",
  otro: "Otro",
};

export const PL: Record<string, string> = {
  pendiente: "Pendiente",
  seña: "Seña abonada",
  mitad: "Mitad pagado",
  pagado: "Pagado",
  paga_despues: "Paga después",
};

export const EL: Record<string, string> = {
  agendado: "Agendado",
  confirmado: "Confirmado",
  completado: "Completado",
  cancelado: "Cancelado",
  reprogramado: "Reprogramado",
};

export function fp(n: number): string {
  return "$" + n.toLocaleString("es-AR");
}

export const PIN_HASH = "$2a$10$8KzQKzQKzQKzQKzQKzQKzQKzQKzQKzQKzQKzQKzQKzQKzQKzQK"; // placeholder
