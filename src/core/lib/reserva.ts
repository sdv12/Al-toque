import type { Slot } from "../adapters/types";
import type { Profesional, Servicio } from "../schema/contenido";
import { serviciosPara } from "./agenda";

export type PasoReserva = "profesional" | "servicio" | "dia" | "horario" | "datos";

/** Valor de profesionalId cuando la persona no tiene preferencia. */
export const CUALQUIERA = "cualquiera";

export type EstadoReserva = {
  orden: readonly PasoReserva[];
  indice: number;
  profesionalId: string | null;
  servicioId: string | null;
  fecha: string | null;
  slot: Slot | null;
  nombre: string;
  nota: string;
};

export type AccionReserva =
  | { tipo: "profesional"; id: string }
  | { tipo: "servicio"; id: string }
  | { tipo: "fecha"; fecha: string }
  | { tipo: "slot"; slot: Slot }
  | { tipo: "nombre"; valor: string }
  | { tipo: "nota"; valor: string }
  | { tipo: "avanzar" }
  | { tipo: "retroceder" }
  | { tipo: "ir"; paso: PasoReserva }
  /** Elige servicio y/o profesional desde afuera del flujo y salta al primer paso pendiente. */
  | { tipo: "preseleccionar"; pre: Preseleccion }
  | { tipo: "reiniciar"; estado: EstadoReserva };

export type CatalogoReserva = { servicios: readonly Servicio[]; equipo: readonly Profesional[] };

export type Preseleccion = { profesionalId?: string; servicioId?: string };

export function ordenReserva(catalogo: CatalogoReserva, preferido: readonly PasoReserva[]): PasoReserva[] {
  return catalogo.equipo.length ? [...preferido] : preferido.filter((p) => p !== "profesional");
}

export function pasoCompleto(estado: EstadoReserva, paso: PasoReserva): boolean {
  switch (paso) {
    case "profesional":
      return estado.profesionalId !== null;
    case "servicio":
      return estado.servicioId !== null;
    case "dia":
      return estado.fecha !== null;
    case "horario":
      return estado.slot !== null;
    case "datos":
      return estado.nombre.trim().length >= 2;
  }
}

export function pasoActual(estado: EstadoReserva): PasoReserva {
  return estado.orden[Math.min(estado.indice, estado.orden.length - 1)]!;
}

export function puedeAvanzar(estado: EstadoReserva): boolean {
  return pasoCompleto(estado, pasoActual(estado));
}

/** Listo para confirmar: todos los pasos completos. */
export function reservaCompleta(estado: EstadoReserva): boolean {
  return estado.orden.every((p) => pasoCompleto(estado, p));
}

function puedeHacer(profesionalId: string | null, servicioId: string, catalogo: CatalogoReserva): boolean {
  if (!profesionalId || profesionalId === CUALQUIERA) return true;
  return serviciosPara(profesionalId, catalogo.servicios).some((s) => s.id === servicioId);
}

export function estadoInicial(
  catalogo: CatalogoReserva,
  orden: readonly PasoReserva[],
  pre: Preseleccion = {},
): EstadoReserva {
  const profesionalId = pre.profesionalId && catalogo.equipo.some((p) => p.id === pre.profesionalId) ? pre.profesionalId : null;
  const servicioId =
    pre.servicioId && catalogo.servicios.some((s) => s.id === pre.servicioId) && puedeHacer(profesionalId, pre.servicioId, catalogo)
      ? pre.servicioId
      : null;
  const base: EstadoReserva = { orden, indice: 0, profesionalId, servicioId, fecha: null, slot: null, nombre: "", nota: "" };
  // Arranca en el primer paso que falta completar.
  const primero = orden.findIndex((p) => !pasoCompleto(base, p));
  return { ...base, indice: primero === -1 ? 0 : primero };
}

/** Reducer puro. Cambiar una elección anterior invalida las que dependen de ella. */
export function crearReductorReserva(catalogo: CatalogoReserva) {
  return function reducir(estado: EstadoReserva, accion: AccionReserva): EstadoReserva {
    switch (accion.tipo) {
      case "profesional": {
        if (accion.id === estado.profesionalId) return estado;
        const servicioId = estado.servicioId && puedeHacer(accion.id, estado.servicioId, catalogo) ? estado.servicioId : null;
        return { ...estado, profesionalId: accion.id, servicioId, fecha: null, slot: null };
      }
      case "servicio": {
        if (accion.id === estado.servicioId) return estado;
        const profesionalId = puedeHacer(estado.profesionalId, accion.id, catalogo) ? estado.profesionalId : null;
        return { ...estado, servicioId: accion.id, profesionalId, fecha: null, slot: null };
      }
      case "fecha":
        return accion.fecha === estado.fecha ? estado : { ...estado, fecha: accion.fecha, slot: null };
      case "slot":
        return { ...estado, slot: accion.slot };
      case "nombre":
        return { ...estado, nombre: accion.valor };
      case "nota":
        return { ...estado, nota: accion.valor };
      case "avanzar":
        return puedeAvanzar(estado) && estado.indice < estado.orden.length - 1 ? { ...estado, indice: estado.indice + 1 } : estado;
      case "retroceder":
        return estado.indice > 0 ? { ...estado, indice: estado.indice - 1 } : estado;
      case "ir": {
        const destino = estado.orden.indexOf(accion.paso);
        // Solo se puede saltar hacia atrás o a un paso cuyos anteriores estén completos.
        const alcanzable = destino !== -1 && estado.orden.slice(0, destino).every((p) => pasoCompleto(estado, p));
        return alcanzable ? { ...estado, indice: destino } : estado;
      }
      case "preseleccionar": {
        const siguiente = estadoInicial(catalogo, estado.orden, accion.pre);
        return { ...siguiente, nombre: estado.nombre, nota: estado.nota };
      }
      case "reiniciar":
        return accion.estado;
    }
  };
}
