"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { configsPorDefecto } from "@/core/defaults";
import { codificarConfig } from "@/core/lib/codigo";
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

export function useBorrador() {
  // El componente se monta solo en el cliente (ssr: false), así que se puede leer localStorage al iniciar.
  const [config, setConfig] = useState<LandingConfig>(() => leerBorrador() ?? structuredClone(configsPorDefecto.barberia));
  const [guardado, setGuardado] = useState<EstadoGuardado>("guardado");

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

  const errores = useMemo<ErrorConfig[]>(() => {
    const r = landingConfigSchema.safeParse(config);
    return r.success ? [] : erroresDeZod(r.error);
  }, [config]);

  return { config, editar, reemplazar, usarEjemplo, errores, guardado };
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

export function slugDe(nombre: string): string {
  return (
    nombre
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "mi-negocio"
  );
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

export type Pestana = "plantilla" | "estilo" | "secciones" | "textos" | "contenido" | "enviar";
