import {
  agendaProfesionalSchema,
  horaSchema,
  idSchema,
  imagenSchema,
  instagramSchema,
  textoCorto,
  textoOpcional,
} from "./comun";
import { z } from "./z";

/** Precios en ARS, enteros. `null` = "a consultar". */
const precioSchema = z.number().int().min(0).nullable();

export const servicioSchema = z.object({
  id: idSchema,
  nombre: textoCorto(60),
  descripcion: textoOpcional(200),
  precio: precioSchema,
  precioDesde: z.boolean().optional(),
  duracionMin: z.number().int().min(5).max(600),
  categoria: textoOpcional(40),
  /** Si se indica, solo esos profesionales lo hacen. */
  profesionalIds: z.array(idSchema).optional(),
  modalidad: z.enum(["presencial", "virtual", "ambas"]).optional(),
  cobertura: z.enum(["particular", "obra-social", "ambas"]).optional(),
});

export const profesionalSchema = z.object({
  id: idSchema,
  nombre: textoCorto(60),
  rol: textoCorto(60),
  especialidad: z.string().trim().max(80),
  matricula: textoOpcional(30),
  bio: textoOpcional(280),
  foto: imagenSchema.optional(),
  instagram: instagramSchema.optional(),
  agenda: agendaProfesionalSchema.optional(),
});

export const propiedadSchema = z
  .object({
    id: idSchema,
    nombre: textoCorto(60),
    resumen: z.string().trim().max(240),
    capacidad: z.number().int().min(1).max(40),
    dormitorios: z.number().int().min(0).max(20),
    banos: z.number().int().min(0).max(20),
    camas: textoOpcional(80),
    amenities: z.array(textoCorto(40)).max(30),
    reglas: z.object({
      mascotas: z.enum(["si", "no", "consultar"]),
      checkIn: horaSchema,
      checkOut: horaSchema,
      senaPorcentaje: z.number().int().min(0).max(100),
      otras: z.array(textoCorto(120)).max(10),
    }),
    precioNoche: precioSchema,
    minNoches: z.number().int().min(1).max(30),
    maxHuespedes: z.number().int().min(1).max(40).optional(),
    fotos: z.array(imagenSchema).max(24),
    /** Posición en el mapa ilustrado, en % (0–100) del ancho y alto. */
    mapa: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) }).optional(),
  })
  .refine((p) => p.maxHuespedes === undefined || p.maxHuespedes <= p.capacidad, {
    message: "El máximo de huéspedes no puede superar la capacidad",
    path: ["maxHuespedes"],
  });

export const itemGaleriaSchema = imagenSchema.extend({ epigrafe: textoOpcional(80) });

export const testimonioSchema = z.object({
  id: idSchema,
  autor: textoCorto(60),
  texto: textoCorto(400),
  detalle: textoOpcional(60),
});

export const faqSchema = z.object({
  id: idSchema,
  pregunta: textoCorto(140),
  respuesta: textoCorto(600),
});

export const casoSchema = z.object({
  id: idSchema,
  titulo: textoCorto(80),
  cliente: textoOpcional(60),
  problema: textoCorto(300),
  solucion: textoCorto(300),
  resultado: textoOpcional(200),
  antes: imagenSchema.optional(),
  despues: imagenSchema.optional(),
});

export const TIPOS_PUNTO = ["pueblo", "rio", "ruta", "sendero", "comercio", "otro"] as const;

export const puntoInteresSchema = z.object({
  id: idSchema,
  nombre: textoCorto(50),
  tipo: z.enum(TIPOS_PUNTO),
  distanciaKm: z.number().min(0).max(500),
  minutos: z.number().int().min(0).max(600).optional(),
  nota: textoOpcional(80),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});

export const contenidoSchema = z.object({
  servicios: z.array(servicioSchema).max(60).optional(),
  equipo: z.array(profesionalSchema).max(20).optional(),
  propiedades: z.array(propiedadSchema).max(12).optional(),
  galeria: z.array(itemGaleriaSchema).max(30).optional(),
  testimonios: z.array(testimonioSchema).max(20).optional(),
  faq: z.array(faqSchema).max(20).optional(),
  obrasSociales: z.array(textoCorto(60)).max(80).optional(),
  primeraConsulta: z.array(textoCorto(140)).max(12).optional(),
  casos: z.array(casoSchema).max(12).optional(),
  puntosInteres: z.array(puntoInteresSchema).max(16).optional(),
});

export type Contenido = z.infer<typeof contenidoSchema>;
export type ClaveContenido = keyof Contenido;
export type Servicio = z.infer<typeof servicioSchema>;
export type Profesional = z.infer<typeof profesionalSchema>;
export type Propiedad = z.infer<typeof propiedadSchema>;
export type ItemGaleria = z.infer<typeof itemGaleriaSchema>;
export type Testimonio = z.infer<typeof testimonioSchema>;
export type Faq = z.infer<typeof faqSchema>;
export type Caso = z.infer<typeof casoSchema>;
export type PuntoInteres = z.infer<typeof puntoInteresSchema>;
