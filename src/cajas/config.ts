import { z } from "zod";
import { codificar, decodificar } from "@/core/lib/codigo";
import { RUBROS, RUBROS_CAJA, type RubroCaja } from "./rubros";

/**
 * Configuración de una caja: lo que el cliente elige en /caja y lo que se publica en
 * configs/cajas/<slug>.json. Los datos del negocio (ventas, fiado) NO van acá: viven en el
 * dispositivo donde se usa la caja.
 */

/** Colores de la caja. Todos con contraste alto con texto blanco (la usan personas mayores). */
export const COLORES_CAJA = {
  verde: { nombre: "Verde", acento: "#146c2e", oscuro: "#0d4d20", claro: "#e3f5e6" },
  azul: { nombre: "Azul", acento: "#1d4f91", oscuro: "#13386a", claro: "#e2ecf9" },
  bordo: { nombre: "Bordó", acento: "#8a1538", oscuro: "#640e28", claro: "#f8e3ea" },
  naranja: { nombre: "Naranja", acento: "#a84300", oscuro: "#7a3000", claro: "#fdeadb" },
} as const;
export type ColorCaja = keyof typeof COLORES_CAJA;
const IDS_COLOR = Object.keys(COLORES_CAJA) as [ColorCaja, ...ColorCaja[]];

export const CajaConfigSchema = z
  .object({
    version: z.literal(1),
    tipo: z.literal("simple"),
    negocio: z.object({
      nombre: z.string().trim().min(2, "Poné el nombre del negocio.").max(40, "Hasta 40 letras."),
    }),
    rubro: z.enum(RUBROS_CAJA),
    color: z.enum(IDS_COLOR),
    modulos: z.object({
      /** Clientes con cuenta: anotar fiado, cobrar y mandar el saldo por WhatsApp. */
      fiado: z.boolean(),
      /** Cajones, compras del mercado y lista de compras. */
      cajones: z.boolean(),
    }),
    /** Solo demos y prueba: carga ventas y clientes de ejemplo y muestra "Empezar de cero". */
    demo: z.boolean().optional(),
  })
  .superRefine((c, ctx) => {
    if (c.modulos.cajones && !RUBROS[c.rubro].cajones) {
      ctx.addIssue({ code: "custom", path: ["modulos", "cajones"], message: `Cajones y mercado todavía no está para ${RUBROS[c.rubro].nombre}.` });
    }
  });

export type CajaConfig = z.infer<typeof CajaConfigSchema>;

export function cajaPorDefecto(rubro: RubroCaja = "verduleria"): CajaConfig {
  return {
    version: 1,
    tipo: "simple",
    negocio: { nombre: RUBROS[rubro].ejemplo },
    rubro,
    color: "verde",
    modulos: { fiado: true, cajones: RUBROS[rubro].cajones },
  };
}

export type ResultadoCaja = { ok: true; config: CajaConfig } | { ok: false; errores: { ruta: string; mensaje: string }[] };

export function validarCaja(valor: unknown): ResultadoCaja {
  const r = CajaConfigSchema.safeParse(valor);
  if (r.success) return { ok: true, config: r.data };
  return { ok: false, errores: r.error.issues.map((i) => ({ ruta: i.path.join("."), mensaje: i.message })) };
}

/** Código para mandar por WhatsApp. "CJ1." para no confundirlo con el de las landings (LK1.). */
export const PREFIJO_CAJA = "CJ1.";

export function codificarCaja(config: CajaConfig): Promise<string> {
  return codificar(PREFIJO_CAJA, config);
}

/** Lee un código CJ1 (también dentro del mensaje completo) o el JSON pegado. Devuelve undefined si no hay ninguno. */
export async function leerCodigoCaja(texto: string): Promise<unknown | undefined> {
  const limpio = texto.trim();
  if (limpio.startsWith("{")) return JSON.parse(limpio);
  return decodificar(PREFIJO_CAJA, limpio);
}

/**
 * Config inicial de /caja a partir de la URL (?rubro=almacen&nombre=…&color=azul), para llegar
 * precargado desde Alto. Lo que falte o no valga queda como en la caja por defecto del rubro.
 */
export function cajaDesdeQuery(search: string): CajaConfig {
  const q = new URLSearchParams(search);
  const rubro = (RUBROS_CAJA as readonly string[]).includes(q.get("rubro") ?? "") ? (q.get("rubro") as RubroCaja) : "verduleria";
  const base = cajaPorDefecto(rubro);
  const nombre = q.get("nombre")?.trim().slice(0, 40);
  const color = q.get("color");
  const r = validarCaja({
    ...base,
    negocio: { nombre: nombre && nombre.length >= 2 ? nombre : base.negocio.nombre },
    color: color && color in COLORES_CAJA ? color : base.color,
  });
  return r.ok ? r.config : base;
}
