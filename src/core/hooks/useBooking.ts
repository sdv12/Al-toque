"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useAdapter } from "../adapters/context";
import type { Slot } from "../adapters/types";
import { AGENDA_POR_DEFECTO, diasConAtencion, iniciosDelDia, profesionalesPara, serviciosPara } from "../lib/agenda";
import { hoyISO, type FechaISO } from "../lib/fechas";
import { linkWhatsApp, mensajeTurno } from "../lib/mensajes";
import {
  CUALQUIERA,
  crearReductorReserva,
  estadoInicial,
  ordenReserva,
  pasoActual,
  puedeAvanzar,
  reservaCompleta,
  type PasoReserva,
  type Preseleccion,
} from "../lib/reserva";
import type { LandingConfig } from "../schema/landing-config";

type Opciones = {
  config: LandingConfig;
  /** Orden de pasos que prefiere la plantilla (se omite "profesional" si no hay equipo). */
  orden: readonly PasoReserva[];
  preseleccion?: Preseleccion;
  ahora?: () => Date;
};

type Horarios = { estado: "inactivo" | "cargando" | "listo" | "error"; slots: Slot[] };

export type ResultadoReserva = { id: string; mensaje: string; linkWhatsApp: string };

/**
 * Lógica completa de un turno: pasos, elecciones dependientes, días con atención, horarios del
 * adaptador y armado del mensaje de WhatsApp. La presentación la pone cada plantilla.
 */
export function useBooking({ config, orden: ordenPreferido, preseleccion, ahora = () => new Date() }: Opciones) {
  const adapter = useAdapter();
  const agenda = config.agenda ?? AGENDA_POR_DEFECTO;
  const catalogo = useMemo(
    () => ({ servicios: config.contenido.servicios ?? [], equipo: config.contenido.equipo ?? [] }),
    [config.contenido.servicios, config.contenido.equipo],
  );
  const orden = useMemo(() => ordenReserva(catalogo, ordenPreferido), [catalogo, ordenPreferido]);
  const reductor = useMemo(() => crearReductorReserva(catalogo), [catalogo]);
  const [estado, dispatch] = useReducer(reductor, undefined, () => estadoInicial(catalogo, orden, preseleccion));

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoReserva | null>(null);

  const servicio = catalogo.servicios.find((s) => s.id === estado.servicioId);
  const profesionalElegido =
    estado.profesionalId && estado.profesionalId !== CUALQUIERA
      ? catalogo.equipo.find((p) => p.id === estado.profesionalId)
      : undefined;

  const profesionales = useMemo(
    () => (servicio ? profesionalesPara(servicio, catalogo.equipo) : [...catalogo.equipo]),
    [servicio, catalogo.equipo],
  );
  const servicios = useMemo(
    () => serviciosPara(profesionalElegido?.id, catalogo.servicios),
    [profesionalElegido?.id, catalogo.servicios],
  );

  // Momento de referencia fijo mientras el flujo está abierto.
  const [momento] = useState(ahora);
  const hoy = hoyISO(momento);
  const dias = useMemo<FechaISO[]>(() => {
    const quienes = profesionalElegido ? [profesionalElegido] : profesionales;
    const duracionMin = servicio?.duracionMin ?? agenda.intervaloMin;
    return diasConAtencion({ agenda, profesionales: quienes, desde: hoy }).filter((fecha) =>
      (quienes.length ? quienes : [undefined]).some(
        (p) => iniciosDelDia({ agenda, profesional: p, fecha, duracionMin, ahora: momento }).length > 0,
      ),
    );
  }, [agenda, profesionalElegido, profesionales, servicio?.duracionMin, hoy, momento]);

  // Horarios del día elegido. El estado "cargando" se deriva: hay consulta pero todavía no
  // llegó la respuesta para esa misma consulta.
  const [intento, setIntento] = useState(0);
  const consulta =
    estado.fecha && estado.servicioId ? `${estado.servicioId}|${profesionalElegido?.id ?? ""}|${estado.fecha}|${intento}` : null;
  const [respuesta, setRespuesta] = useState<{ consulta: string; estado: "listo" | "error"; slots: Slot[] } | null>(null);

  useEffect(() => {
    if (!estado.fecha || !estado.servicioId || !consulta) return;
    let vigente = true;
    adapter
      .getHorariosDisponibles({
        servicioId: estado.servicioId,
        fecha: estado.fecha,
        ...(profesionalElegido ? { profesionalId: profesionalElegido.id } : {}),
      })
      .then((slots) => vigente && setRespuesta({ consulta, estado: "listo", slots }))
      .catch(() => vigente && setRespuesta({ consulta, estado: "error", slots: [] }));
    return () => {
      vigente = false;
    };
  }, [adapter, consulta, estado.fecha, estado.servicioId, profesionalElegido]);

  const horarios: Horarios = !consulta
    ? { estado: "inactivo", slots: [] }
    : respuesta?.consulta === consulta
      ? { estado: respuesta.estado, slots: respuesta.slots }
      : { estado: "cargando", slots: [] };

  const confirmar = useCallback(async (opciones: { extras?: string[] } = {}) => {
    if (!reservaCompleta(estado) || !servicio || !estado.slot) return;
    setEnviando(true);
    setError(null);
    const profesionalId = profesionalElegido?.id ?? estado.slot.profesionalId;
    const r = await adapter.crearTurno({
      servicioId: servicio.id,
      inicio: estado.slot.inicio,
      cliente: { nombre: estado.nombre.trim() },
      ...(profesionalId ? { profesionalId } : {}),
      ...(estado.nota.trim() ? { nota: estado.nota.trim() } : {}),
    });
    setEnviando(false);
    if (!r.ok) {
      setError(r.error);
      setIntento((n) => n + 1); // vuelve a pedir horarios: el elegido ya no está libre
      dispatch({ tipo: "ir", paso: "horario" });
      return;
    }
    const profesional = catalogo.equipo.find((p) => p.id === profesionalId);
    const mensaje = mensajeTurno({
      negocio: config.negocio,
      servicio,
      inicio: estado.slot.inicio,
      cliente: { nombre: estado.nombre },
      nota: estado.nota,
      ...(profesional ? { profesional } : {}),
      ...(opciones.extras?.length ? { extras: opciones.extras } : {}),
    });
    setResultado({ id: r.valor.id, mensaje, linkWhatsApp: linkWhatsApp(config.negocio.whatsapp, mensaje) });
  }, [adapter, catalogo.equipo, config.negocio, estado, profesionalElegido, servicio]);

  return {
    estado,
    paso: pasoActual(estado),
    indice: estado.indice,
    total: estado.orden.length,
    esUltimo: estado.indice === estado.orden.length - 1,
    puedeAvanzar: puedeAvanzar(estado),
    completa: reservaCompleta(estado),
    servicio,
    profesional: profesionalElegido,
    profesionales,
    servicios,
    dias,
    horarios,
    enviando,
    error,
    resultado,
    elegirProfesional: (id: string) => dispatch({ tipo: "profesional", id }),
    elegirServicio: (id: string) => dispatch({ tipo: "servicio", id }),
    elegirFecha: (fecha: string) => dispatch({ tipo: "fecha", fecha }),
    elegirSlot: (slot: Slot) => dispatch({ tipo: "slot", slot }),
    setNombre: (valor: string) => dispatch({ tipo: "nombre", valor }),
    setNota: (valor: string) => dispatch({ tipo: "nota", valor }),
    avanzar: () => dispatch({ tipo: "avanzar" }),
    retroceder: () => dispatch({ tipo: "retroceder" }),
    irA: (paso: PasoReserva) => dispatch({ tipo: "ir", paso }),
    preseleccionar: (pre: Preseleccion) => {
      setResultado(null);
      setError(null);
      dispatch({ tipo: "preseleccionar", pre });
    },
    reiniciar: () => {
      setResultado(null);
      setError(null);
      dispatch({ tipo: "reiniciar", estado: estadoInicial(catalogo, orden) });
    },
    confirmar,
  };
}

export type Booking = ReturnType<typeof useBooking>;
