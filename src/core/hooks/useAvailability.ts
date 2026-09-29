"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdapter } from "../adapters/context";
import { mesDe, sumarMeses, type MesISO } from "../lib/calendario";
import {
  RANGO_VACIO,
  elegirDia as elegirDiaRango,
  estimar,
  maxHuespedes,
  noches as contarNoches,
  problemasEstadia,
  salidaPosible,
  type AvisoRango,
  type Rango,
} from "../lib/estadia";
import { hoyISO, sumarDias, type FechaISO } from "../lib/fechas";
import { linkWhatsApp, mensajeConsulta } from "../lib/mensajes";
import type { LandingConfig } from "../schema/landing-config";

/** Hasta dónde se puede consultar. */
const DIAS_VISIBLES = 365;

type Opciones = { config: LandingConfig; ahora?: () => Date };

/**
 * Disponibilidad de casas: propiedad elegida, mes visible, rango de fechas con noches
 * bloqueadas, huéspedes, estimado y consulta por WhatsApp. La presentación la pone la plantilla.
 */
export function useAvailability({ config, ahora = () => new Date() }: Opciones) {
  const adapter = useAdapter();
  const propiedades = useMemo(() => config.contenido.propiedades ?? [], [config.contenido.propiedades]);
  const [momento] = useState(ahora);
  const hoy = hoyISO(momento);
  const limite = sumarDias(hoy, DIAS_VISIBLES);

  const [propiedadId, setPropiedadId] = useState<string | null>(propiedades[0]?.id ?? null);
  const propiedad = propiedades.find((p) => p.id === propiedadId) ?? propiedades[0];

  const [mes, setMes] = useState<MesISO>(mesDe(hoy));
  const [rango, setRango] = useState<Rango>(RANGO_VACIO);
  const [aviso, setAviso] = useState<AvisoRango | null>(null);
  const [huespedes, setHuespedesCrudo] = useState(2);
  const [nombre, setNombre] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ id: string; linkWhatsApp: string } | null>(null);

  // Noches bloqueadas de la propiedad (se piden una vez por casa).
  const [bloqueos, setBloqueos] = useState<{ propiedadId: string; dias: Set<FechaISO> } | null>(null);
  useEffect(() => {
    if (!propiedad) return;
    let vigente = true;
    adapter
      .getDiasBloqueados({ propiedadId: propiedad.id, desde: hoy, hasta: limite })
      .then((dias) => vigente && setBloqueos({ propiedadId: propiedad.id, dias: new Set(dias) }))
      .catch(() => vigente && setBloqueos({ propiedadId: propiedad.id, dias: new Set() }));
    return () => {
      vigente = false;
    };
  }, [adapter, propiedad, hoy, limite]);

  const cargando = !!propiedad && bloqueos?.propiedadId !== propiedad.id;
  const bloqueados = useMemo(() => (cargando ? new Set<FechaISO>() : (bloqueos?.dias ?? new Set<FechaISO>())), [bloqueos, cargando]);

  const elegirPropiedad = (id: string) => {
    if (id === propiedad?.id) return;
    setPropiedadId(id);
    setRango(RANGO_VACIO);
    setAviso(null);
    setResultado(null);
    const nueva = propiedades.find((p) => p.id === id);
    if (nueva) setHuespedesCrudo((h) => Math.min(h, maxHuespedes(nueva)));
  };

  const elegirDia = useCallback(
    (dia: FechaISO) => {
      if (dia < hoy || dia > limite) return;
      const r = elegirDiaRango(rango, dia, bloqueados);
      setRango(r.rango);
      setAviso(r.aviso ?? null);
      setResultado(null);
    },
    [rango, bloqueados, hoy, limite],
  );

  /** Estado de un día para pintarlo en el calendario. */
  const estadoDia = useCallback(
    (dia: FechaISO) => {
      const pasado = dia < hoy || dia > limite;
      const ocupado = bloqueados.has(dia);
      const { desde, hasta } = rango;
      const esEntrada = dia === desde;
      const esSalida = dia === hasta;
      const enRango = !!desde && !!hasta && dia > desde && dia < hasta;
      // Con entrada elegida y sin salida: solo sirven de salida los días hasta la primera noche ocupada.
      const salidaValida = !!desde && !hasta && salidaPosible(desde, dia, bloqueados);
      // Se puede tocar: como salida válida, o como nueva entrada si esa noche está libre.
      const elegible = !pasado && (salidaValida || !ocupado);
      return { pasado, ocupado, esEntrada, esSalida, enRango, salidaValida, elegible };
    },
    [bloqueados, rango, hoy, limite],
  );

  const setHuespedes = (n: number) => propiedad && setHuespedesCrudo(Math.max(1, Math.min(n, maxHuespedes(propiedad))));

  const noches = contarNoches(rango);
  const estimado = propiedad ? estimar(propiedad, rango) : null;
  const problemas = propiedad ? problemasEstadia(propiedad, rango, huespedes) : [];
  const lista = !!propiedad && problemas.length === 0;

  const mensaje =
    propiedad && rango.desde && rango.hasta
      ? mensajeConsulta({
          negocio: config.negocio,
          propiedad,
          desde: rango.desde,
          hasta: rango.hasta,
          noches,
          huespedes,
          estimado,
          cliente: { nombre },
        })
      : null;

  const consultar = useCallback(async () => {
    if (!lista || !propiedad || !rango.desde || !rango.hasta || !mensaje) return null;
    setEnviando(true);
    const r = await adapter.crearConsulta({
      propiedadId: propiedad.id,
      desde: rango.desde,
      hasta: rango.hasta,
      huespedes,
      cliente: { nombre: nombre.trim() || "Sin nombre" },
    });
    setEnviando(false);
    // Aunque falle el registro, la consulta por WhatsApp sigue siendo válida.
    const link = linkWhatsApp(config.negocio.whatsapp, mensaje);
    setResultado({ id: r.ok ? r.valor.id : "", linkWhatsApp: link });
    return link;
  }, [adapter, config.negocio.whatsapp, huespedes, lista, mensaje, nombre, propiedad, rango]);

  return {
    propiedades,
    propiedad,
    elegirPropiedad,
    hoy,
    mes,
    mesAnterior: () => setMes((m) => (sumarMeses(m, -1) < mesDe(hoy) ? m : sumarMeses(m, -1))),
    mesSiguiente: () => setMes((m) => (sumarMeses(m, 1) > mesDe(limite) ? m : sumarMeses(m, 1))),
    irAMes: (m: MesISO) => setMes(m < mesDe(hoy) ? mesDe(hoy) : m > mesDe(limite) ? mesDe(limite) : m),
    puedeRetroceder: mes > mesDe(hoy),
    puedeAvanzar: mes < mesDe(limite),
    cargando,
    rango,
    elegirDia,
    limpiar: () => {
      setRango(RANGO_VACIO);
      setAviso(null);
      setResultado(null);
    },
    estadoDia,
    aviso,
    huespedes,
    setHuespedes,
    maxHuespedes: propiedad ? maxHuespedes(propiedad) : 1,
    nombre,
    setNombre,
    noches,
    estimado,
    problemas,
    lista,
    mensaje,
    enviando,
    resultado,
    consultar,
  };
}

export type Availability = ReturnType<typeof useAvailability>;
