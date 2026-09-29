import type { Modo } from "../schema/comun";
import { definirPlantilla, type DefPlantilla, type DefSeccion, type Paleta } from "./define";

/**
 * Registry de plantillas: solo datos. Qué secciones soporta cada una, sus variantes,
 * qué contenido exigen y la paleta base. La UI de cada variante vive en src/templates/<plantilla>.
 */
export const registry = {
  barberia: definirPlantilla({
    meta: {
      nombre: "Nocturna editorial",
      rubro: "Barbería",
      descripcion:
        "Navegación lateral, columnas desfasadas y carta de precios tipo pizarra. Reserva en panel lateral, con barbero a elección.",
      modos: ["oscuro"],
      paletas: {
        oscuro: { fondo: "#1a1511", superficie: "#241d17", texto: "#efe6d8", textoSuave: "#b5a894" },
      },
      acentos: [
        { nombre: "Latón", hex: "#c9a45c" },
        { nombre: "Cobre", hex: "#c8835a" },
        { nombre: "Hueso", hex: "#d8c9ae" },
        { nombre: "Óxido", hex: "#c7684b" },
        { nombre: "Salvia", hex: "#94b08f" },
      ],
    },
    secciones: {
      portada: {
        etiqueta: "Portada",
        descripcion: "Apertura con el nombre del local como protagonista.",
        variantes: { editorial: "Titular editorial", "retrato-partido": "Retrato partido" },
        inicio: true,
      },
      servicios: {
        etiqueta: "Servicios",
        descripcion: "Carta de precios.",
        variantes: { pizarra: "Pizarra de precios", "carta-dos-columnas": "Carta a dos columnas" },
        requiere: ["servicios"],
      },
      equipo: {
        etiqueta: "Barberos",
        descripcion: "Cada barbero con su especialidad y reserva directa.",
        variantes: { fichas: "Fichas", retratos: "Retratos grandes" },
        requiere: ["equipo"],
      },
      galeria: {
        etiqueta: "Galería",
        descripcion: "Trabajos y el local.",
        variantes: { collage: "Collage irregular", tira: "Tira de contactos" },
        requiere: ["galeria"],
      },
      testimonios: {
        etiqueta: "Clientes",
        descripcion: "Lo que dicen de ustedes.",
        variantes: { recortes: "Recortes", "cita-grande": "Cita destacada" },
        requiere: ["testimonios"],
      },
      faq: {
        etiqueta: "Preguntas",
        descripcion: "Dudas frecuentes.",
        variantes: { lista: "Lista" },
        requiere: ["faq"],
      },
      ubicacion: {
        etiqueta: "Ubicación y horario",
        descripcion: "Dónde están y cuándo abren.",
        variantes: { "horario-grande": "Horario protagonista", "mapa-texto": "Dirección y mapa" },
      },
    },
  }),

  consultorio: definirPlantilla({
    meta: {
      nombre: "Clínica clara",
      rubro: "Consultorio / estética",
      descripcion:
        "Turnos desde la portada, una columna de información con índice lateral y prestaciones comparables.",
      modos: ["claro"],
      paletas: {
        claro: { fondo: "#f4f7f9", superficie: "#ffffff", texto: "#15222d", textoSuave: "#4a5a68" },
      },
      acentos: [
        { nombre: "Petróleo", hex: "#1f5f78" },
        { nombre: "Verde clínico", hex: "#2e6b58" },
        { nombre: "Azul", hex: "#2a58a0" },
        { nombre: "Ciruela", hex: "#6d3f6a" },
        { nombre: "Grafito", hex: "#3b4550" },
      ],
    },
    secciones: {
      portada: {
        etiqueta: "Portada con turnos",
        descripcion: "El widget de turnos visible sin scrollear.",
        variantes: { "turnos-lateral": "Turnos al costado", "turnos-central": "Turnos al centro" },
        requiere: ["servicios"],
        inicio: true,
      },
      prestaciones: {
        etiqueta: "Prestaciones",
        descripcion: "Duración, modalidad y cobertura, para comparar.",
        variantes: { tabla: "Tabla", "lista-agrupada": "Lista por categoría" },
        requiere: ["servicios"],
      },
      profesionales: {
        etiqueta: "Profesionales",
        descripcion: "Con matrícula y especialidad.",
        variantes: { listado: "Listado", fichas: "Fichas con foto" },
        requiere: ["equipo"],
      },
      obrasSociales: {
        etiqueta: "Obras sociales",
        descripcion: "Coberturas aceptadas.",
        variantes: { lista: "Lista buscable", grilla: "Grilla" },
        requiere: ["obrasSociales"],
      },
      primeraConsulta: {
        etiqueta: "Primera consulta",
        descripcion: "Qué llevar y cómo prepararse.",
        variantes: { checklist: "Checklist", pasos: "Paso a paso" },
        requiere: ["primeraConsulta"],
      },
      faq: {
        etiqueta: "Preguntas frecuentes",
        descripcion: "Dudas frecuentes.",
        variantes: { acordeon: "Acordeón", "dos-columnas": "Dos columnas" },
        requiere: ["faq"],
      },
      ubicacion: {
        etiqueta: "Cómo llegar",
        descripcion: "Dirección, horario y accesibilidad.",
        variantes: { "mapa-texto": "Dirección y mapa", compacta: "Compacta" },
      },
    },
  }),

  alojamiento: definirPlantilla({
    meta: {
      nombre: "Cuaderno de campo",
      rubro: "Casas de campo",
      descripcion:
        "Recorrido horizontal por cada casa, mapa ilustrado de la zona y calendario de disponibilidad con consulta por WhatsApp.",
      modos: ["claro"],
      paletas: {
        claro: { fondo: "#f2eadb", superficie: "#f8f3e9", texto: "#2b2419", textoSuave: "#5c5142" },
      },
      acentos: [
        { nombre: "Terracota", hex: "#9c4a2b" },
        { nombre: "Oliva", hex: "#5a6526" },
        { nombre: "Pino", hex: "#2f5a45" },
        { nombre: "Arcilla", hex: "#87583a" },
        { nombre: "Añil", hex: "#3b4f7a" },
      ],
    },
    secciones: {
      recorrido: {
        etiqueta: "Recorrido por las casas",
        descripcion: "Cada casa con su galería y ficha.",
        variantes: { horizontal: "Scroll horizontal", capitulos: "Capítulos" },
        requiere: ["propiedades"],
        inicio: true,
      },
      mapa: {
        etiqueta: "Mapa de la zona",
        descripcion: "Puntos de interés y distancias.",
        variantes: { ilustrado: "Mapa ilustrado", distancias: "Tabla de distancias" },
        requiere: ["puntosInteres"],
      },
      disponibilidad: {
        etiqueta: "Disponibilidad",
        descripcion: "Calendario de fechas, huéspedes y estimado.",
        variantes: { "calendario-ficha": "Calendario con ficha", "calendario-amplio": "Calendario amplio" },
        requiere: ["propiedades"],
      },
      entorno: {
        etiqueta: "El entorno",
        descripcion: "Fotos del lugar y alrededores.",
        variantes: { collage: "Collage", postales: "Postales" },
        requiere: ["galeria"],
      },
      testimonios: {
        etiqueta: "Huéspedes",
        descripcion: "Lo que cuentan quienes vinieron.",
        variantes: { cuaderno: "Libro de visitas", postales: "Postales" },
        requiere: ["testimonios"],
      },
      faq: {
        etiqueta: "Preguntas",
        descripcion: "Dudas frecuentes.",
        variantes: { lista: "Lista", "dos-columnas": "Dos columnas" },
        requiere: ["faq"],
      },
    },
  }),

  generico: definirPlantilla({
    meta: {
      nombre: "Portfolio modular",
      rubro: "Cualquier rubro",
      descripcion:
        "Home en bento grid que mezcla servicio, trabajo, testimonio y contacto. Trabajos presentados como casos.",
      modos: ["claro", "oscuro"],
      paletas: {
        claro: { fondo: "#f1f0ec", superficie: "#ffffff", texto: "#121211", textoSuave: "#55534e" },
        oscuro: { fondo: "#121211", superficie: "#1c1c1a", texto: "#f1f0ec", textoSuave: "#a9a69d" },
      },
      acentos: [
        { nombre: "Naranja señal", hex: "#ff4a1c" },
        { nombre: "Cobalto", hex: "#2f4bff" },
        { nombre: "Lima", hex: "#c8f031" },
        { nombre: "Rojo", hex: "#e5261f" },
        { nombre: "Verde", hex: "#0f8a5f" },
      ],
    },
    secciones: {
      bento: {
        etiqueta: "Home bento",
        descripcion: "Bloques de distinto tamaño con lo más importante.",
        variantes: { clasico: "Clásico", denso: "Denso", asimetrico: "Asimétrico" },
        inicio: true,
      },
      casos: {
        etiqueta: "Trabajos",
        descripcion: "Casos de antes/después o problema/solución.",
        variantes: { "antes-despues": "Antes y después", "problema-solucion": "Problema y solución" },
        requiere: ["casos"],
      },
      servicios: {
        etiqueta: "Servicios",
        descripcion: "Qué hacés y cuánto sale.",
        variantes: { lista: "Lista", bloques: "Bloques" },
        requiere: ["servicios"],
      },
      testimonios: {
        etiqueta: "Testimonios",
        descripcion: "Clientes contentos.",
        variantes: { "cita-grande": "Cita grande", carrusel: "Carrusel" },
        requiere: ["testimonios"],
      },
      contacto: {
        etiqueta: "Contacto",
        descripcion: "Formulario corto + WhatsApp.",
        variantes: { "formulario-wa": "Formulario y WhatsApp", dividido: "Dividido" },
      },
      faq: {
        etiqueta: "Preguntas",
        descripcion: "Dudas frecuentes.",
        variantes: { acordeon: "Acordeón" },
        requiere: ["faq"],
      },
    },
  }),
} as const satisfies Record<string, DefPlantilla>;

type Registro = typeof registry;

export type Plantilla = keyof Registro;

export const PLANTILLAS = ["barberia", "consultorio", "alojamiento", "generico"] as const satisfies readonly Plantilla[];

type SeccionesDe<P extends Plantilla> = Registro[P]["secciones"];

export type TipoSeccion<P extends Plantilla> = keyof SeccionesDe<P> & string;

export type VarianteDe<P extends Plantilla, T extends TipoSeccion<P>> =
  SeccionesDe<P>[T] extends { variantes: infer V } ? keyof V & string : never;

/** Una sección de la config de la plantilla P: tipo y variante quedan atados entre sí. */
export type SeccionConfig<P extends Plantilla> = {
  [T in TipoSeccion<P>]: { tipo: T; variante: VarianteDe<P, T>; activa: boolean };
}[TipoSeccion<P>];

export function esPlantilla(valor: unknown): valor is Plantilla {
  return typeof valor === "string" && (PLANTILLAS as readonly string[]).includes(valor);
}

/** Acceso a las secciones sin los tipos literales, para recorrerlas en runtime. */
export function seccionesDe(plantilla: Plantilla): Readonly<Record<string, DefSeccion>> {
  return registry[plantilla].secciones;
}

export function modoPorDefecto(plantilla: Plantilla): Modo {
  return registry[plantilla].meta.modos[0];
}

export function paletaDe(plantilla: Plantilla, modo: Modo): Paleta {
  const paletas: Partial<Record<Modo, Paleta>> = registry[plantilla].meta.paletas;
  const paleta = paletas[modo] ?? paletas[modoPorDefecto(plantilla)];
  if (!paleta) throw new Error(`La plantilla ${plantilla} no define paleta para ${modo}`);
  return paleta;
}

export type { DefPlantilla, DefSeccion, MetaPlantilla, Paleta } from "./define";
