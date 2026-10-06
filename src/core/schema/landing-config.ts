import {
  PLANTILLAS,
  registry,
  seccionesDe,
  type Plantilla,
  type SeccionConfig,
} from "../registry";
import { EXTRAS } from "../lib/precios";
import { agendaSchema, estiloSchema, idSchema, negocioSchema } from "./comun";
import { contenidoSchema, type ClaveContenido, type Contenido } from "./contenido";
import { VERSION_ACTUAL } from "./version";
import { z } from "./z";

/** Array de secciones válido para una plantilla: tipo y variante tienen que existir en su registry. */
function seccionesSchema<P extends Plantilla>(plantilla: P) {
  const opciones = Object.entries(seccionesDe(plantilla)).map(([tipo, def]) =>
    z.object({
      tipo: z.literal(tipo),
      variante: z.enum(Object.keys(def.variantes) as [string, ...string[]], {
        error: `Variante no disponible para "${def.etiqueta}"`,
      }),
      activa: z.boolean(),
      /** Identifica cada instancia (obligatorio en la práctica para bloques repetibles). */
      id: idSchema.optional(),
      ...(def.datos ? { datos: def.datos } : {}),
    }),
  );
  const [primera, ...resto] = opciones;
  if (!primera) throw new Error(`La plantilla ${plantilla} no declara secciones`);

  const seccion = z.discriminatedUnion("tipo", [primera, ...resto], {
    error: `Sección no soportada por la plantilla ${registry[plantilla].meta.nombre}`,
  });
  // El schema se arma en runtime desde el registry; el tipo se ata al registry con SeccionConfig.
  return z.array(seccion).min(1, "Agregá al menos un bloque a la página").max(30) as unknown as z.ZodType<SeccionConfig<P>[]>;
}

/** WhatsApp de relleno de la hoja en blanco: sirve para la vista previa, no para publicar. */
export const NUMERO_DE_RELLENO = "5493510000000";

const base = z.object({
  version: z.literal(VERSION_ACTUAL),
  estilo: estiloSchema,
  negocio: negocioSchema,
  agenda: agendaSchema.optional(),
  contenido: contenidoSchema,
  whatsappFlotante: z.boolean(),
  /** Funciones extra elegidas en el configurador (afectan el precio; ver lib/precios). */
  extras: z.array(z.enum(Object.keys(EXTRAS) as [string, ...string[]])).max(10).optional(),
  /**
   * Landing de muestra: simula horarios ocupados y noches tomadas para que la demo se vea real.
   * Las landings de clientes no lo llevan: sin backend, todo lo de la agenda se muestra libre
   * y el negocio confirma por WhatsApp.
   */
  demo: z.boolean().optional(),
});

const configPara = <P extends Plantilla>(plantilla: P) =>
  base.extend({ plantilla: z.literal(plantilla), secciones: seccionesSchema(plantilla) });

const CON_ID = [
  "servicios",
  "equipo",
  "propiedades",
  "testimonios",
  "faq",
  "casos",
  "puntosInteres",
] as const satisfies readonly ClaveContenido[];

export const landingConfigSchema = z
  .discriminatedUnion(
    "plantilla",
    [
      configPara("barberia"),
      configPara("consultorio"),
      configPara("alojamiento"),
      configPara("generico"),
      configPara("libre"),
    ],
    { error: `Plantilla desconocida. Opciones: ${PLANTILLAS.join(", ")}` },
  )
  .superRefine((config, ctx) => {
    const defs = seccionesDe(config.plantilla);
    const meta = registry[config.plantilla].meta;
    const secciones: readonly { tipo: string; activa: boolean }[] = config.secciones;

    // Secciones: sin repetidas, las de inicio presentes, activas y primeras.
    const vistos = new Set<string>();
    const idsSeccion = new Set<string>();
    (config.secciones as readonly { id?: string }[]).forEach((s, i) => {
      if (!s.id) return;
      if (idsSeccion.has(s.id)) ctx.addIssue({ code: "custom", message: `Id de bloque repetido: ${s.id}`, path: ["secciones", i, "id"] });
      idsSeccion.add(s.id);
    });
    secciones.forEach((s, i) => {
      if (vistos.has(s.tipo) && !defs[s.tipo]?.repetible) {
        ctx.addIssue({ code: "custom", message: `La sección "${s.tipo}" está repetida`, path: ["secciones", i, "tipo"] });
      }
      vistos.add(s.tipo);
    });

    for (const [tipo, def] of Object.entries(defs)) {
      if (!def.inicio) continue;
      const indice = secciones.findIndex((s) => s.tipo === tipo);
      if (indice === -1) {
        ctx.addIssue({ code: "custom", message: `Falta la sección obligatoria "${def.etiqueta}"`, path: ["secciones"] });
      } else if (indice !== 0) {
        ctx.addIssue({ code: "custom", message: `"${def.etiqueta}" tiene que ser la primera sección`, path: ["secciones", indice] });
      } else if (!secciones[indice]?.activa) {
        ctx.addIssue({ code: "custom", message: `"${def.etiqueta}" no se puede desactivar`, path: ["secciones", indice, "activa"] });
      }
    }

    // Secciones activas con el contenido que necesitan.
    secciones.forEach((s, i) => {
      if (!s.activa) return;
      for (const clave of defs[s.tipo]?.requiere ?? []) {
        const valor = config.contenido[clave];
        if (!valor || valor.length === 0) {
          ctx.addIssue({
            code: "custom",
            message: `La sección "${defs[s.tipo]?.etiqueta}" necesita cargar ${clave}`,
            path: ["secciones", i],
          });
        }
      }
    });

    // El número de relleno de la hoja en blanco no se puede publicar.
    if (config.negocio.whatsapp === NUMERO_DE_RELLENO) {
      ctx.addIssue({ code: "custom", message: "Cargá tu número de WhatsApp", path: ["negocio", "whatsapp"] });
    }

    // Modo soportado por la plantilla.
    const modos: readonly string[] = meta.modos;
    if (config.estilo.modo && !modos.includes(config.estilo.modo)) {
      ctx.addIssue({
        code: "custom",
        message: `${meta.nombre} no tiene modo ${config.estilo.modo}`,
        path: ["estilo", "modo"],
      });
    }

    // Ids únicos por colección.
    for (const clave of CON_ID) {
      const items: readonly { id: string }[] = config.contenido[clave] ?? [];
      const ids = new Set<string>();
      items.forEach((item, i) => {
        if (ids.has(item.id)) {
          ctx.addIssue({ code: "custom", message: `Id repetido: ${item.id}`, path: ["contenido", clave, i, "id"] });
        }
        ids.add(item.id);
      });
    }

    // Referencias de servicios a profesionales.
    const profesionales = new Set((config.contenido.equipo ?? []).map((p) => p.id));
    (config.contenido.servicios ?? []).forEach((servicio, i) => {
      servicio.profesionalIds?.forEach((id, j) => {
        if (!profesionales.has(id)) {
          ctx.addIssue({
            code: "custom",
            message: `"${servicio.nombre}" referencia a un profesional que no existe (${id})`,
            path: ["contenido", "servicios", i, "profesionalIds", j],
          });
        }
      });
    });
  });

export type LandingConfig = z.infer<typeof landingConfigSchema>;
export type ConfigDe<P extends Plantilla> = Extract<LandingConfig, { plantilla: P }>;
export type { Contenido };
