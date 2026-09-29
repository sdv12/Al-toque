import { AGENDA_POR_DEFECTO, iniciosDelDia, profesionalesPara } from "../lib/agenda";
import { azar, hash } from "../lib/aleatorio";
import { diasEntre, instanteISO, sumarDias, type FechaISO } from "../lib/fechas";
import { fallo, ok } from "../lib/resultado";
import type { LandingConfig } from "../schema/landing-config";
import type { Profesional } from "../schema/contenido";
import type { DataAdapter, Slot } from "./types";
import { addMinutes } from "date-fns";

type Opciones = {
  /** Semilla de los datos simulados (por defecto, el nombre del negocio). */
  semilla?: string;
  /** Simular ocupación (por defecto, solo si la config es una demo). */
  simular?: boolean;
  /** Proporción de horarios que aparecen ocupados al simular (0–1). */
  ocupacion?: number;
  ahora?: () => Date;
};

/**
 * Adaptador sin backend: agenda real del negocio. En configs de demo simula ocupación
 * determinista (mismo negocio, día y profesional → mismos huecos); en landings de clientes no
 * simula nada. Los turnos creados en la sesión quedan ocupados en memoria.
 */
export function crearDemoAdapter(config: LandingConfig, opciones: Opciones = {}): DataAdapter {
  const semilla = opciones.semilla ?? config.negocio.nombre;
  const simular = opciones.simular ?? config.demo === true;
  const ocupacion = simular ? (opciones.ocupacion ?? 0.35) : 0;
  const ahora = opciones.ahora ?? (() => new Date());
  const agenda = config.agenda ?? AGENDA_POR_DEFECTO;
  const servicios = config.contenido.servicios ?? [];
  const equipo = config.contenido.equipo ?? [];
  const reservados = new Set<string>();

  const clave = (profesionalId: string, inicioIso: string) => `${profesionalId}|${inicioIso}`;
  const libre = (profesionalId: string, inicioIso: string) =>
    !reservados.has(clave(profesionalId, inicioIso)) && azar(`${semilla}|${clave(profesionalId, inicioIso)}`) >= ocupacion;

  function slotsDe(servicioId: string, profesionalId: string | undefined, fecha: FechaISO): Slot[] {
    const servicio = servicios.find((s) => s.id === servicioId);
    if (!servicio) return [];

    const candidatos: (Profesional | undefined)[] = profesionalId
      ? equipo.filter((p) => p.id === profesionalId)
      : profesionalesPara(servicio, equipo);
    if (candidatos.length === 0 && equipo.length === 0) candidatos.push(undefined);

    // inicio ISO → profesionales que atienden en ese horario
    const porHorario = new Map<string, { fin: string; ids: string[] }>();
    for (const p of candidatos) {
      for (const inicio of iniciosDelDia({ agenda, profesional: p, fecha, duracionMin: servicio.duracionMin, ahora: ahora() })) {
        const iso = instanteISO(inicio);
        const entrada = porHorario.get(iso) ?? { fin: instanteISO(addMinutes(inicio, servicio.duracionMin)), ids: [] };
        entrada.ids.push(p?.id ?? "negocio");
        porHorario.set(iso, entrada);
      }
    }

    return [...porHorario.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([inicio, { fin, ids }]) => {
        const primeroLibre = ids.find((id) => libre(id, inicio));
        return {
          inicio,
          fin,
          disponible: primeroLibre !== undefined,
          ...(primeroLibre && primeroLibre !== "negocio" ? { profesionalId: primeroLibre } : {}),
        };
      });
  }

  /** Un bloqueo por semana y por casa (2 a 4 noches), en 6 de cada 10 semanas. */
  function bloqueada(propiedadId: string, fecha: FechaISO): boolean {
    if (!simular) return false;
    const semanaActual = Math.floor(diasEntre("2024-01-01", fecha) / 7);
    for (const semana of [semanaActual, semanaActual - 1]) {
      const h = hash(`${semilla}|${propiedadId}|${semana}`);
      if (h % 10 >= 6) continue;
      const inicio = sumarDias("2024-01-01", semana * 7 + ((h >>> 4) % 7));
      const largo = 2 + ((h >>> 8) % 3);
      const offset = diasEntre(inicio, fecha);
      if (offset >= 0 && offset < largo) return true;
    }
    return false;
  }

  return {
    nombre: "demo",

    async getHorariosDisponibles({ servicioId, profesionalId, fecha }) {
      return slotsDe(servicioId, profesionalId, fecha);
    },

    async getDiasBloqueados({ propiedadId, desde, hasta }) {
      const dias: FechaISO[] = [];
      for (let f = desde; f <= hasta; f = sumarDias(f, 1)) {
        if (bloqueada(propiedadId, f)) dias.push(f);
      }
      return dias;
    },

    async crearTurno(turno) {
      const fecha = turno.inicio.slice(0, 10);
      const slot = slotsDe(turno.servicioId, turno.profesionalId, fecha).find((s) => s.inicio === turno.inicio);
      if (!slot?.disponible) return fallo("Ese horario ya no está disponible. Elegí otro.");
      const profesionalId = turno.profesionalId ?? slot.profesionalId ?? "negocio";
      reservados.add(clave(profesionalId, turno.inicio));
      return ok({ id: `demo-${hash(`${semilla}|${profesionalId}|${turno.inicio}`).toString(36)}` });
    },

    async crearConsulta(consulta) {
      return ok({ id: `demo-${hash(`${semilla}|${consulta.propiedadId}|${consulta.desde}|${consulta.hasta}`).toString(36)}` });
    },
  };
}
