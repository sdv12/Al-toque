/*
 * Agenda al toque: modelo de datos (portado de Agenda Rápida). Fechas "AAAA-MM-DD", horas "HH:MM",
 * duraciones en minutos y plata en pesos enteros. Todo vive en el navegador mientras sea demo.
 */
import type { IdDiseno } from "./disenos";
import type { IdProfesion } from "./profesiones";

/** Franja de atención: [desde, hasta] en "HH:MM". */
export type Franja = [string, string];
/** Franjas por día de la semana (0 = domingo … 6 = sábado). */
export type Horarios = Record<number, Franja[]>;

export interface Negocio {
  nombre: string;
  profesion: IdProfesion;
  diseno: IdDiseno;
  descripcion: string;
  direccion: string;
  whatsapp: string;
  /** Cada cuántos minutos arranca un turno. */
  intervalo: number;
  /** Minutos mínimos de anticipación para reservar en el día. */
  anticipacion: number;
  sena: number;
  horarios: Horarios;
  /** PIN del panel (demo). */
  pin: string;
  /** Logo en data URL (192 px). */
  logo?: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  duracion: number;
  precio: number;
  activo: boolean;
}

export interface Cliente {
  id: string;
  nombre: string;
  tel: string;
  notas: string;
}

export type EstadoTurno = "pendiente" | "confirmado" | "atendido" | "ausente" | "cancelado";
export type Metodo = "efectivo" | "transferencia" | "mercadopago" | "tarjeta";

export interface Turno {
  id: string;
  servicioId: string;
  fecha: string;
  hora: string;
  duracion: number;
  precio: number;
  clienteId: string;
  estado: EstadoTurno;
  origen: "web" | "manual";
  creado: string;
  pago: { monto: number; metodo: Metodo } | null;
  notas: string;
}

export interface Movimiento {
  id: string;
  fecha: string;
  hora: string;
  tipo: "ingreso" | "egreso";
  monto: number;
  metodo: Metodo;
  concepto: string;
  turnoId?: string;
}

export interface Cierre {
  id: string;
  fecha: string;
  esperado: number;
  contado: number;
  diferencia: number;
  nota: string;
}

export interface Bloqueo {
  id: string;
  fecha: string;
  desde: string;
  hasta: string;
  motivo?: string;
}

export interface Espera {
  id: string;
  nombre: string;
  tel: string;
  servicioId?: string;
  preferencia: string;
  creado: string;
}

export interface Db {
  negocio: Negocio;
  servicios: Servicio[];
  clientes: Cliente[];
  turnos: Turno[];
  movimientos: Movimiento[];
  cierres: Cierre[];
  bloqueos: Bloqueo[];
  espera: Espera[];
}
