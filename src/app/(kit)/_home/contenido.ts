import type { Plantilla } from "@/core/registry";

/** Textos de la home pública. Solo afirmaciones que el producto cumple hoy. */

export const RUBROS = [
  "Barberías",
  "Consultorios",
  "Estética",
  "Casas de campo",
  "Carpinterías",
  "Talleres",
  "Profes particulares",
  "Lo que tengas",
];

type Ficha = {
  slug: string;
  /** Variable CSS de la fuente display de la plantilla (declarada en su fonts.ts). */
  fuenteDisplay: string;
  bajada: string;
  destacados: [string, string, string];
};

export const FICHAS: Record<Plantilla, Ficha> = {
  barberia: {
    slug: "demo-barberia",
    fuenteDisplay: "var(--fuente-barberia-display)",
    bajada: "Oscura, editorial, con el nombre del local como protagonista.",
    destacados: [
      "El cliente reserva con el barbero que elige, en cinco pasos cortos.",
      "Precios en formato pizarra, como la carta de un bar.",
      "En el celular, el botón de reservar siempre a mano.",
    ],
  },
  consultorio: {
    slug: "demo-consultorio",
    fuenteDisplay: "var(--fuente-consultorio)",
    bajada: "Clara y confiable: primero el turno, después la información.",
    destacados: [
      "El pedido de turno se ve apenas se abre la página.",
      "Prestaciones comparables: duración, modalidad y cobertura.",
      "Obras sociales con buscador y matrículas a la vista.",
    ],
  },
  alojamiento: {
    slug: "demo-casas",
    fuenteDisplay: "var(--fuente-alojamiento-display)",
    bajada: "Un cuaderno de viaje: cada casa con su ficha, el mapa y las fechas.",
    destacados: [
      "Recorrido casa por casa con fotos, comodidades y reglas.",
      "Mapa ilustrado de la zona con distancias a pueblos y ríos.",
      "Calendario de fechas con noches, estimado y seña.",
    ],
  },
  generico: {
    slug: "demo-portfolio",
    fuenteDisplay: "var(--fuente-generico-display)",
    bajada: "Para cualquier oficio: tus trabajos hablan por vos.",
    destacados: [
      "Una portada en bloques que resume todo lo que hacés.",
      "Trabajos con antes y después para comparar deslizando.",
      "Un formulario corto que termina en tu WhatsApp.",
    ],
  },
};

export const PASOS = [
  {
    titulo: "Elegí la plantilla de tu rubro",
    texto: "Barbería, consultorio, casas de campo o una general para cualquier oficio. Cada una está armada distinto.",
  },
  {
    titulo: "Cambiale todo y mirá cómo queda",
    texto: "Textos, colores, secciones, precios, horarios y fotos. La vista previa se actualiza mientras escribís, en compu y en celular.",
  },
  {
    titulo: "Mandámela por WhatsApp",
    texto: "Con un botón me llega tu configuración. La reviso, la publico y te paso el link.",
  },
];

export const BENEFICIOS = [
  {
    titulo: "Los pedidos te llegan por WhatsApp",
    texto: "Turnos y consultas llegan con el mensaje armado: qué, cuándo y a nombre de quién. Sin apps ni comisiones.",
  },
  {
    titulo: "Pensada primero para el celular",
    texto: "Se diseña y se prueba en pantallas de 360 px, que es donde la va a mirar tu cliente.",
  },
  {
    titulo: "Rápida y accesible",
    texto: "Medida con Lighthouse: más de 90 en rendimiento y 100 en accesibilidad. Se usa con teclado y con lector de pantalla.",
  },
  {
    titulo: "Lista para Google y para compartir",
    texto: "Título, descripción y datos de tu negocio para buscadores, y una vista previa prolija cuando mandás el link.",
  },
  {
    titulo: "Fotos cuando las tengas",
    texto: "Mientras tanto, cada lugar muestra un recuadro que dice qué foto va. Nada de fotos de stock que no son tuyas.",
  },
  {
    titulo: "La cambiás cuando quieras",
    texto: "Volvés al configurador, ajustás lo que haga falta y me mandás la nueva versión.",
  },
];

export const PREGUNTAS = [
  {
    pregunta: "¿Tengo que saber de diseño o de programación?",
    respuesta: "No. Elegís opciones y escribís tus textos; el diseño ya está resuelto para tu rubro.",
  },
  {
    pregunta: "¿Cómo me llegan los turnos o las consultas?",
    respuesta:
      "Por WhatsApp, con el mensaje ya armado: qué servicio o qué casa, qué día, a qué hora y a nombre de quién. Vos confirmás respondiendo.",
  },
  {
    pregunta: "¿Y si todavía no tengo fotos?",
    respuesta: "Se publica igual. Donde va cada foto aparece un recuadro que dice qué foto corresponde. Cuando las tengas, las sumamos.",
  },
  {
    pregunta: "¿Puedo cambiar cosas después?",
    respuesta: "Sí. Volvés al configurador, cambiás lo que quieras y me mandás la versión nueva.",
  },
  {
    pregunta: "¿Se guarda lo que voy armando?",
    respuesta: "Sí, en tu navegador. Si cerrás y volvés desde el mismo dispositivo, lo encontrás donde lo dejaste.",
  },
];
