import type { PLANTILLAS_DE_RUBRO } from "@/core/registry";

type Plantilla = (typeof PLANTILLAS_DE_RUBRO)[number];

/** Textos de la home pública. Solo afirmaciones que el producto cumple hoy. */

/** Rubros de Al Toque. Salud no va: es de Sala de Espera, la marca de ese rubro. */
export const RUBROS = ["Peluquerías", "Estética", "Estudios jurídicos", "Alojamientos", "Comercios", "Oficios", "Talleres", "Clases", "Lo que tengas"];

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
  estetica: {
    slug: "demo-estetica",
    fuenteDisplay: "var(--fuente-es-playfair)",
    bajada: "Diez diseños para peluquerías, uñas y estética: del rosa clásico a la revista y el neón.",
    destacados: [
      "Cartel de «abierto ahora» con el horario del día y la espera.",
      "Servicios con duración y precio, y consulta directa por WhatsApp.",
      "Trabajos, dónde queda y el Instagram del salón.",
    ],
  },
  juridico: {
    slug: "demo-juridico",
    fuenteDisplay: "var(--fuente-ju-cormorant)",
    bajada: "Cinco diseños para estudios jurídicos: clásico, editorial, contemporáneo, expediente y nocturno.",
    destacados: [
      "Áreas de práctica y equipo con especialidad y matrícula.",
      "Reuniones presenciales o por videollamada, con día y hora, confirmadas por WhatsApp.",
      "Cómo trabajan, preguntas frecuentes y el aviso de que no es asesoramiento.",
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

/**
 * "Estudio": la plantilla Portfolio modular con su portada a pantalla completa y las variantes
 * sobrias. Se ofrece como una plantilla más (otro punto de partida en el configurador).
 */
export const ESTUDIO = {
  id: "estudio",
  plantilla: "generico",
  /** Config en configs/<slug>.json; la demo se publica en `ruta`. */
  slug: "demo-arquitectos",
  ruta: "/estudio",
  nombre: "Estudio",
  rubro: "Arquitectura, diseño y profesionales",
  /** Fondo del escenario de la ficha (el de la demo). */
  fondo: "#f4f2ee",
  bajada: "Sobria y elegante: fotos grandes y tus proyectos como protagonistas.",
  destacados: [
    "Portada con fotos a pantalla completa que pasan solas.",
    "Cada proyecto con su ficha y el antes y después para comparar.",
    "Servicios, preguntas y contacto con consultas directas por WhatsApp.",
  ],
  acentos: [
    { nombre: "Bronce", hex: "#8a6a52" },
    { nombre: "Grafito", hex: "#3b3b38" },
    { nombre: "Salvia", hex: "#6f7d6a" },
    { nombre: "Arcilla", hex: "#9a5b45" },
    { nombre: "Pizarra", hex: "#44566b" },
  ],
  /** Componentes que se pueden prender, apagar y ordenar en el configurador. */
  componentes: [
    { nombre: "Portada a pantalla completa", detalle: "Fotos que se funden con un zoom lento, con pausa" },
    { nombre: "Proyectos con ficha", detalle: "Grilla con filtros por tipo y antes y después" },
    { nombre: "Servicios en índice", detalle: "Se despliegan y cada uno tiene su consulta" },
    { nombre: "Testimonios rotativos", detalle: "Una cita grande que va cambiando" },
    { nombre: "Preguntas frecuentes", detalle: "En acordeón, para resolver dudas antes de escribir" },
    { nombre: "Contacto sobre foto", detalle: "Formulario corto que termina en tu WhatsApp" },
  ],
} as const;

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

/**
 * Proyectos reales que hicimos (sitios publicados). No todos se armaron con el configurador:
 * la sección los presenta como trabajos del equipo, con link al sitio. Capturas en
 * public/proyectos/<id>.jpg, regenerables con `SOLO=proyectos pnpm capturas`.
 */
export const PROYECTOS = [
  {
    id: "cuervo",
    nombre: "Cuervo Peluquería",
    rubro: "Peluquería",
    texto: "Turnos con los horarios libres a la vista y confirmación por WhatsApp.",
    url: "https://cuervo-pelu.netlify.app",
  },
  {
    id: "1918",
    nombre: "1918 Peluquería",
    rubro: "Peluquería de barrio",
    texto: "Identidad propia, turnos online y un espacio para publicitar comercios de la zona.",
    url: "https://1918-peluqueria.netlify.app",
  },
  {
    id: "lunagui",
    nombre: "Lunagui Viajes",
    rubro: "Agencia de viajes",
    texto: "Buscador de destinos por fecha y cantidad de personas, ofertas y consulta directa.",
    url: "https://lunagui-viajes.netlify.app",
  },
  {
    id: "casas-de-sierra",
    nombre: "Casas de Sierra",
    rubro: "Alojamientos en las sierras",
    texto: "Casas y cabañas por zona y fechas, con contacto directo con cada anfitrión.",
    url: "https://casas-de-sierra-cba.netlify.app",
  },
  {
    id: "ateneo",
    nombre: "Ateneo",
    rubro: "App de estudio",
    texto: "Plan de estudio, casos clínicos, tarjetas y simulacros para preparar un examen final.",
    url: "https://ateneo-estudio.netlify.app",
  },
];

/* ───────────── Portada ───────────── */

/** Cómo funciona, para cualquier producto. */
export const PASOS = [
  {
    titulo: "Elegí",
    texto: "Mirá las soluciones y elegí la tuya. Si no sabés por dónde empezar, Alto te hace unas preguntas y te recomienda.",
  },
  {
    titulo: "Personalizá",
    texto: "Probala con tus datos antes de pagar nada: tu página en el configurador, tu agenda o tu caja con tus productos.",
  },
  {
    titulo: "Publicá",
    texto: "Nos llega tu pedido, lo dejamos andando y te acompañamos: los cambios chicos de todos los meses ya están incluidos.",
  },
];

/** Selector de necesidades: cada una lleva a su solución. */
export const NECESIDADES = [
  { texto: "Quiero una página web", detalle: "Que me encuentren y me escriban", href: "/web" },
  { texto: "Quiero organizar mis turnos", detalle: "Reservas online, sin ida y vuelta de mensajes", href: "/turnos" },
  { texto: "Quiero controlar mi comercio", detalle: "Ventas, caja y fiado en orden", href: "/caja" },
  { texto: "Tengo un restaurante o un bar", detalle: "Carta, pedidos, reservas y salón", href: "/resto" },
  { texto: "Quiero vender por internet", detalle: "Catálogo y pedidos online", href: "/tienda" },
] as const;

/**
 * Confianza: solo lo que el servicio cumple hoy y está en los Términos y condiciones.
 * Nada de números de clientes ni testimonios hasta tenerlos de verdad.
 */
export const CONFIANZA = [
  { titulo: "Probalo antes de contratar", texto: "Todas las demos están abiertas: no hace falta registrarse ni dejar datos. Contratás cuando ya sabés lo que vas a recibir." },
  { titulo: "Atención personalizada", texto: "Soporte por WhatsApp o correo, con respuesta dentro de las 48 horas hábiles. Te atiende el mismo equipo que hizo tu página." },
  { titulo: "Pensado para el celular", texto: "Cada página se diseña y se prueba en celulares: es donde la ven tus clientes y desde donde vas a administrarla." },
  { titulo: "El dominio es tuyo", texto: "La dirección de tu página se registra a tu nombre y sigue siendo tuya aunque dejes el servicio." },
  { titulo: "Sin permanencia", texto: "Podés darte de baja cuando quieras, sin penalidades, y llevarte tu contenido y tus datos. Además, tenés 10 días para arrepentirte de la contratación." },
  { titulo: "Seguridad incluida", texto: "Conexión cifrada, proveedores reconocidos y actualizaciones de seguridad incluidas en el abono mensual." },
];

/** Las preguntas frecuentes de la portada salen de las dudas de Alto (una sola fuente). */
export const PREGUNTAS_PORTADA = ["precio", "mensual", "tiempo", "pago", "cambios", "dominio", "datos", "baja", "saber", "fotos"];
