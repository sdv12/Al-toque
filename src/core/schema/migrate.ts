import { landingConfigSchema, type LandingConfig } from "./landing-config";
import { VERSION_ACTUAL } from "./version";
import type { z } from "./z";

export type ErrorConfig = { ruta: string; mensaje: string };

export type ResultadoConfig =
  | { ok: true; config: LandingConfig; migradaDesde?: number }
  | { ok: false; errores: ErrorConfig[] };

type Objeto = Record<string, unknown>;

/** `migraciones[n]` transforma una config de la versión n a la n + 1. */
export type Migraciones = Readonly<Record<number, (config: Objeto) => Objeto>>;

/**
 * Migraciones registradas. Cuando se publique la v2 del schema:
 *   1. subir VERSION_ACTUAL a 2 en version.ts
 *   2. agregar acá `1: (c) => ({ ...c, version: 2, ...cambios })`
 *   3. sumar un caso de test con una config v1 real
 */
export const migraciones: Migraciones = {};

function esObjeto(valor: unknown): valor is Objeto {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

/** Aplica migraciones en cadena hasta `destino`. No valida contenido, solo versiona. */
export function aplicarMigraciones(
  crudo: unknown,
  lista: Migraciones,
  destino: number,
): { ok: true; valor: Objeto; desde: number } | { ok: false; errores: ErrorConfig[] } {
  if (!esObjeto(crudo)) {
    return { ok: false, errores: [{ ruta: "", mensaje: "La configuración tiene que ser un objeto JSON" }] };
  }
  const desde = crudo.version;
  if (typeof desde !== "number" || !Number.isInteger(desde) || desde < 1) {
    return { ok: false, errores: [{ ruta: "version", mensaje: "Falta la versión de la configuración" }] };
  }
  if (desde > destino) {
    return {
      ok: false,
      errores: [{ ruta: "version", mensaje: `La configuración es de la versión ${desde}, más nueva que esta app (${destino})` }],
    };
  }

  let actual: Objeto = crudo;
  for (let v = desde; v < destino; v++) {
    const migrar = lista[v];
    if (!migrar) {
      return { ok: false, errores: [{ ruta: "version", mensaje: `No hay migración de la versión ${v} a la ${v + 1}` }] };
    }
    actual = { ...migrar(actual), version: v + 1 };
  }
  return { ok: true, valor: actual, desde };
}

export function erroresDeZod(error: z.ZodError): ErrorConfig[] {
  return error.issues.map((issue) => ({
    ruta: issue.path.map(String).join("."),
    mensaje: issue.message,
  }));
}

/** Punto de entrada único para leer configs (JSON de archivo, localStorage o base). */
export function migrateConfig(crudo: unknown): ResultadoConfig {
  const migrada = aplicarMigraciones(crudo, migraciones, VERSION_ACTUAL);
  if (!migrada.ok) return migrada;

  const parseada = landingConfigSchema.safeParse(migrada.valor);
  if (!parseada.success) return { ok: false, errores: erroresDeZod(parseada.error) };

  return migrada.desde === VERSION_ACTUAL
    ? { ok: true, config: parseada.data }
    : { ok: true, config: parseada.data, migradaDesde: migrada.desde };
}
