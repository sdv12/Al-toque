import type { Resultado } from "../lib/resultado";

/** Fechas de calendario como "yyyy-MM-dd"; instantes como ISO 8601 con offset de Córdoba (-03:00). */
export type FechaISO = string;
export type InstanteISO = string;

export type Slot = {
  inicio: InstanteISO;
  fin: InstanteISO;
  profesionalId?: string;
  disponible: boolean;
};

export type Cliente = {
  nombre: string;
  telefono?: string;
};

export type TurnoInput = {
  servicioId: string;
  profesionalId?: string;
  inicio: InstanteISO;
  cliente: Cliente;
  nota?: string;
};

export type ConsultaInput = {
  propiedadId: string;
  desde: FechaISO;
  hasta: FechaISO;
  huespedes: number;
  cliente: Cliente;
  nota?: string;
};

/**
 * Contrato de datos. Los componentes solo conocen esta interfaz; el adaptador concreto
 * (DemoAdapter en fase 1, SupabaseAdapter en fase 2) se inyecta por contexto.
 */
export interface DataAdapter {
  readonly nombre: "demo" | "supabase";
  getHorariosDisponibles(consulta: {
    servicioId: string;
    profesionalId?: string;
    fecha: FechaISO;
  }): Promise<Slot[]>;
  getDiasBloqueados(consulta: {
    propiedadId: string;
    desde: FechaISO;
    hasta: FechaISO;
  }): Promise<FechaISO[]>;
  crearTurno(turno: TurnoInput): Promise<Resultado<{ id: string }>>;
  crearConsulta(consulta: ConsultaInput): Promise<Resultado<{ id: string }>>;
}
