import type { ConfigDe } from "../schema/landing-config";

/** Salón inventado para la demo y el configurador (los diseños vienen de la página de estilista). */
export const esteticaDefault: ConfigDe<"estetica"> = {
  version: 2,
  plantilla: "estetica",
  estilo: { acento: "#9a5a50", esquinas: "recto", modo: "claro" },
  negocio: {
    nombre: "Estudio Malena",
    eslogan: "Rubios con luz y movimiento.",
    subtitulo:
      "Color, balayage y peinados en Nueva Córdoba. El valor de cada servicio se define en la consulta, según el largo, la base que tenés y el resultado que buscás. Si podés, traé fotos de referencia.",
    whatsapp: "5493515550188",
    direccion: "Independencia 840, Nueva Córdoba, Córdoba",
    horario: "Martes a sábado de 10 a 20 h",
    redes: [{ red: "instagram", url: "https://instagram.com/estudiomalena" }],
  },
  agenda: {
    dias: [
      ...[2, 3, 4, 5].map((dia) => ({ dia, franjas: [{ desde: "10:00", hasta: "20:00" }] })),
      { dia: 6, franjas: [{ desde: "09:00", hasta: "20:00" }] },
    ],
    intervaloMin: 30,
    anticipacionMinHoras: 2,
    diasHaciaAdelante: 21,
  },
  secciones: [
    { tipo: "portada", variante: "rosa", activa: true },
    { tipo: "hoy", variante: "diseno", activa: true },
    { tipo: "servicios", variante: "diseno", activa: true },
    { tipo: "consulta", variante: "diseno", activa: true },
    { tipo: "galeria", variante: "diseno", activa: true },
    { tipo: "ubicacion", variante: "diseno", activa: true },
  ],
  contenido: {
    servicios: [
      { id: "balayage", nombre: "Balayage", descripcion: "Iluminación pintada a mano, con una transición suave desde la raíz. El rubio crece prolijo y no hace falta retocar seguido.", precio: null, duracionMin: 240, categoria: "Color" },
      { id: "mechas", nombre: "Mechas y rubios", descripcion: "Mechas finas, babylights o rubio total, cuidando la fibra para que el pelo quede sano y con brillo.", precio: null, duracionMin: 180, categoria: "Color" },
      { id: "color", nombre: "Color y matices", descripcion: "Coloración completa, retoque de raíz y matizado para neutralizar tonos amarillos o naranjas.", precio: null, duracionMin: 90, categoria: "Color" },
      { id: "peinados", nombre: "Peinados", descripcion: "Brushing, ondas y recogidos para eventos, casamientos y egresos. Si es para un evento, avisá con tiempo.", precio: null, duracionMin: 60, categoria: "Peinados" },
      { id: "tratamientos", nombre: "Tratamientos", descripcion: "Nutrición, reconstrucción y alisados para recuperar el pelo después de decolorar.", precio: null, duracionMin: 90, categoria: "Tratamientos" },
    ],
    galeria: [
      { alt: "Balayage miel sobre base castaña", epigrafe: "Balayage miel" },
      { alt: "Rubio perla con matiz frío", epigrafe: "Rubio perla" },
      { alt: "Cobrizo intenso", epigrafe: "Cobrizo" },
      { alt: "Morocho con brillo", epigrafe: "Morocho brillo" },
      { alt: "Iluminación suave", epigrafe: "Iluminación" },
      { alt: "Rubio dorado", epigrafe: "Rubio dorado" },
      { alt: "Ondas para un evento", epigrafe: "Ondas" },
      { alt: "Castaño con reflejos", epigrafe: "Reflejos" },
    ],
  },
  whatsappFlotante: false,
};
