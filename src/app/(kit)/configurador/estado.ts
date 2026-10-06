"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { configsPorDefecto } from "@/core/defaults";
import { codificarConfig } from "@/core/lib/codigo";
export { slugDe } from "@/core/lib/slug";
import { esPlantilla, type Plantilla } from "@/core/registry";
import { landingConfigSchema, type LandingConfig } from "@/core/schema/landing-config";
import { erroresDeZod, type ErrorConfig, migrateConfig } from "@/core/schema/migrate";
import { VERSION_ACTUAL } from "@/core/schema/version";

const CLAVE = "landing-kit:borrador";

/**
 * Lee el borrador guardado. Si no pasa la validación pero tiene la forma de la versión actual
 * (un borrador a medio escribir), se recupera igual: los errores se muestran en "Enviar".
 */
function leerBorrador(): LandingConfig | null {
  try {
    const texto = localStorage.getItem(CLAVE);
    if (!texto) return null;
    const crudo: unknown = JSON.parse(texto);
    const r = migrateConfig(crudo);
    if (r.ok) return r.config;
    const c = crudo as Partial<LandingConfig>;
    return c.version === VERSION_ACTUAL && esPlantilla(c.plantilla) && Array.isArray(c.secciones) && c.contenido && c.negocio
      ? (crudo as LandingConfig)
      : null;
  } catch {
    return null;
  }
}

export type EstadoGuardado = "guardado" | "pendiente" | "sin-almacenamiento";

/** Plantilla pedida desde la home ("Usar esta plantilla" → /configurador?plantilla=…). */
function plantillaPedida(): Plantilla | null {
  try {
    const valor = new URLSearchParams(window.location.search).get("plantilla");
    return esPlantilla(valor) ? valor : null;
  } catch {
    return null;
  }
}

const sinTocar = (c: LandingConfig) => JSON.stringify(c) === JSON.stringify(configsPorDefecto[c.plantilla]);

/**
 * Punto de partida: el borrador guardado, o la plantilla pedida por URL. Si hay un borrador con
 * cambios de otra plantilla, no se pisa: queda la pedida como "pendiente" para que la persona elija.
 */
function inicio(): { config: LandingConfig; pendiente: Plantilla | null } {
  const guardado = leerBorrador();
  const pedida = plantillaPedida();
  if (!pedida) return { config: guardado ?? structuredClone(configsPorDefecto.barberia), pendiente: null };
  if (guardado && guardado.plantilla !== pedida && !sinTocar(guardado)) return { config: guardado, pendiente: pedida };
  return { config: guardado?.plantilla === pedida ? guardado : structuredClone(configsPorDefecto[pedida]), pendiente: null };
}

export function useBorrador() {
  // El componente se monta solo en el cliente (ssr: false), así que se puede leer localStorage y la URL al iniciar.
  const [arranque] = useState(inicio);
  const [config, setConfig] = useState<LandingConfig>(arranque.config);
  const [pendiente, setPendiente] = useState<Plantilla | null>(arranque.pendiente);
  const [guardado, setGuardado] = useState<EstadoGuardado>("guardado");

  // La URL queda limpia: recargar no vuelve a aplicar la plantilla pedida.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("plantilla")) window.history.replaceState(null, "", window.location.pathname);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(CLAVE, JSON.stringify(config));
        setGuardado("guardado");
      } catch {
        setGuardado("sin-almacenamiento");
      }
    }, 400);
    return () => clearTimeout(t);
  }, [config]);

  /** Edición inmutable: se trabaja sobre una copia y se reemplaza. */
  const editar = useCallback((cambio: (borrador: LandingConfig) => void) => {
    setGuardado("pendiente");
    setConfig((previa) => {
      const copia = structuredClone(previa);
      cambio(copia);
      return copia;
    });
  }, []);

  const reemplazar = useCallback((nueva: LandingConfig) => {
    setGuardado("pendiente");
    setConfig(structuredClone(nueva));
  }, []);

  const usarEjemplo = useCallback((plantilla: Plantilla) => reemplazar(configsPorDefecto[plantilla]), [reemplazar]);

  /** Respuesta al aviso de plantilla pedida con un borrador propio de otra. */
  const resolverPendiente = useCallback(
    (usarla: boolean) => {
      if (usarla && pendiente) usarEjemplo(pendiente);
      setPendiente(null);
    },
    [pendiente, usarEjemplo],
  );

  const errores = useMemo<ErrorConfig[]>(() => {
    const r = landingConfigSchema.safeParse(config);
    return r.success ? [] : erroresDeZod(r.error);
  }, [config]);

  return { config, editar, reemplazar, usarEjemplo, errores, guardado, pendiente, resolverPendiente };
}

/** Código LK1 de la config actual, recalculado con un pequeño retraso mientras se edita. */
export function useCodigoConfig(config: LandingConfig): string | null {
  const [codigo, setCodigo] = useState<string | null>(null);
  useEffect(() => {
    let vigente = true;
    const t = setTimeout(() => {
      void codificarConfig(config).then((c) => vigente && setCodigo(c));
    }, 500);
    return () => {
      vigente = false;
      clearTimeout(t);
    };
  }, [config]);
  return codigo;
}

/** Id nuevo para un ítem de contenido (compatible con idSchema). */
export function nuevoId(prefijo: string): string {
  return `${prefijo}-${Math.random().toString(36).slice(2, 7)}`;
}

const NOMBRES_RUTA: Record<string, string> = {
  negocio: "Textos",
  estilo: "Estilo",
  secciones: "Secciones",
  contenido: "Contenido",
  agenda: "Horarios",
  servicios: "Servicios",
  equipo: "Equipo",
  galeria: "Galería",
  testimonios: "Testimonios",
  faq: "Preguntas",
  nombre: "nombre",
  eslogan: "eslogan",
  whatsapp: "WhatsApp",
};

export function rutaLegible(ruta: string): string {
  if (!ruta) return "General";
  return ruta
    .split(".")
    .map((parte) => (/^\d+$/.test(parte) ? `#${Number(parte) + 1}` : (NOMBRES_RUTA[parte] ?? parte)))
    .join(" › ");
}

/** Pestaña donde se corrige un error, según su ruta. */
export function pestanaDeRuta(ruta: string): Pestana {
  const [primera] = ruta.split(".");
  if (primera === "negocio" || primera === "whatsappFlotante") return "textos";
  if (primera === "estilo") return "estilo";
  if (primera === "secciones") return "secciones";
  if (primera === "contenido" || primera === "agenda") return "contenido";
  return "enviar";
}

export type Pestana = "plantilla" | "estilo" | "secciones" | "textos" | "contenido" | "precio" | "enviar";
