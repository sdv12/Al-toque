import { WHATSAPP_AR } from "../lib/whatsapp";
import { z } from "./z";

export const idSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usá minúsculas, números y guiones (ej: corte-clasico)")
  .max(48);

export const hexSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color en formato #RRGGBB");

export const horaSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora en formato HH:mm");

export const textoCorto = (max: number) =>
  z.string().trim().min(1, "No puede quedar vacío").max(max, `Máximo ${max} caracteres`);

export const textoOpcional = (max: number) =>
  z.string().trim().max(max, `Máximo ${max} caracteres`).optional();

export const instagramSchema = z
  .string()
  .regex(/^[A-Za-z0-9._]{1,30}$/, "Solo el usuario, sin @ ni link");

/** Imagen con `src` opcional: si falta, la plantilla muestra un placeholder "Tu foto acá". */
export const imagenSchema = z.object({
  src: z
    .string()
    .regex(/^(https:\/\/|\/)/, "La imagen tiene que ser una URL https o una ruta local")
    .optional(),
  alt: z.string().trim().max(160),
});

export const ESQUINAS = ["recto", "suave", "redondeado"] as const;
export const MODOS = ["claro", "oscuro"] as const;
export const TAMANOS_TEXTO = ["chico", "normal", "grande"] as const;

export const estiloSchema = z.object({
  acento: hexSchema,
  esquinas: z.enum(ESQUINAS),
  modo: z.enum(MODOS).optional(),
  /** Fondo propio. Sin indicar, el de la plantilla; texto y superficies se derivan de él. */
  fondo: hexSchema.optional(),
  /** Escala todos los textos de la plantilla. Sin indicar = normal. */
  texto: z.enum(TAMANOS_TEXTO).optional(),
});

export const negocioSchema = z.object({
  nombre: textoCorto(60),
  eslogan: textoCorto(90),
  subtitulo: z.string().trim().max(220),
  whatsapp: z.string().regex(WHATSAPP_AR, "WhatsApp en formato 549 + área + número (ej: 5493515551234)"),
  direccion: z.string().trim().max(120),
  horario: z.string().trim().max(120),
  instagram: instagramSchema.optional(),
});

const franjaSchema = z
  .object({ desde: horaSchema, hasta: horaSchema })
  .refine((f) => f.desde < f.hasta, { message: "La franja tiene que terminar después de empezar", path: ["hasta"] });

/** 0 = domingo … 6 = sábado (igual que Date#getDay). */
export const diaAgendaSchema = z.object({
  dia: z.number().int().min(0).max(6),
  franjas: z.array(franjaSchema).min(1),
});

const diasAgendaSchema = z
  .array(diaAgendaSchema)
  .max(7)
  .refine((dias) => new Set(dias.map((d) => d.dia)).size === dias.length, "Hay días repetidos en la agenda");

/**
 * Agenda estructurada para generar turnos. `negocio.horario` queda como texto para mostrar;
 * si falta `agenda`, el adaptador usa un horario comercial por defecto.
 */
export const agendaSchema = z.object({
  dias: diasAgendaSchema,
  intervaloMin: z.number().int().min(5).max(240),
  anticipacionMinHoras: z.number().int().min(0).max(168),
  diasHaciaAdelante: z.number().int().min(1).max(120),
});

/** Un profesional puede atender en días/horarios propios dentro de la agenda del negocio. */
export const agendaProfesionalSchema = z.object({ dias: diasAgendaSchema });

export type Imagen = z.infer<typeof imagenSchema>;
export type Estilo = z.infer<typeof estiloSchema>;
export type Negocio = z.infer<typeof negocioSchema>;
export type Agenda = z.infer<typeof agendaSchema>;
export type Modo = (typeof MODOS)[number];
export type Esquinas = (typeof ESQUINAS)[number];
export type TamanoTexto = (typeof TAMANOS_TEXTO)[number];
