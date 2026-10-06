import type { ClaveContenido, Contenido } from "../schema/contenido";
import { NUMERO_DE_RELLENO, type ConfigDe } from "../schema/landing-config";

/**
 * Hoja en blanco: solo header y footer. Todavía no es publicable (necesita al menos un bloque):
 * el configurador lo muestra en "Enviar".
 */
export const libreDefault: ConfigDe<"libre"> = {
  version: 1,
  plantilla: "libre",
  estilo: { acento: "#2350c8", esquinas: "suave", modo: "claro" },
  negocio: {
    nombre: "Tu negocio",
    eslogan: "Una frase corta que diga qué hacés.",
    subtitulo: "",
    whatsapp: NUMERO_DE_RELLENO,
    direccion: "",
    horario: "",
  },
  secciones: [],
  contenido: {},
  whatsappFlotante: false,
};

/**
 * Contenido de ejemplo que se carga al agregar un bloque que lo necesita, para que se vea algo
 * en la vista previa. Los textos son explícitamente para reemplazar.
 */
export const SEMILLAS: { [K in ClaveContenido]?: NonNullable<Contenido[K]> } = {
  servicios: [
    { id: "servicio-1", nombre: "Tu primer servicio", descripcion: "Contá en una línea qué incluye.", precio: 20000, duracionMin: 45 },
    { id: "servicio-2", nombre: "Otro servicio", descripcion: "Precio y duración se editan en Contenido.", precio: 35000, duracionMin: 60 },
    { id: "servicio-3", nombre: "Servicio a medida", precio: null, duracionMin: 60 },
  ],
  galeria: [{ alt: "Foto del local" }, { alt: "Un trabajo terminado" }, { alt: "El equipo" }],
  testimonios: [
    { id: "testimonio-1", autor: "Nombre del cliente", texto: "Acá va lo que te dijo un cliente contento. Reemplazalo por una opinión real." },
    { id: "testimonio-2", autor: "Otro cliente", texto: "Las opiniones reales generan confianza: pedile a tus clientes que te escriban dos líneas." },
  ],
  faq: [
    { id: "pregunta-1", pregunta: "¿Cómo se reserva?", respuesta: "Escribinos por WhatsApp y coordinamos día y horario." },
    { id: "pregunta-2", pregunta: "¿Qué medios de pago aceptan?", respuesta: "Efectivo, transferencia y Mercado Pago." },
  ],
  propiedades: [
    {
      id: "casa-1",
      nombre: "Tu casa o cabaña",
      resumen: "Una línea que la describa.",
      capacidad: 4,
      dormitorios: 2,
      banos: 1,
      amenities: ["Wifi", "Parrilla"],
      reglas: { mascotas: "consultar", checkIn: "14:00", checkOut: "10:00", senaPorcentaje: 30, otras: [] },
      precioNoche: 80000,
      minNoches: 2,
      fotos: [{ alt: "Frente de la casa" }],
    },
  ],
};

/** Datos iniciales de los bloques que traen datos propios. */
export const DATOS_INICIALES: Record<string, unknown> = {
  texto: { titulo: "Quiénes somos", cuerpo: "Contá en pocas líneas quién está detrás del negocio, desde cuándo y cómo trabajan." },
  cta: { titulo: "¿Te sumás?", texto: "Escribinos y te respondemos en el día.", boton: "Escribinos" },
};

/** Ejemplo completo armado con bloques: demo pública y fixture de tests. */
export const libreEjemplo: ConfigDe<"libre"> = {
  version: 1,
  plantilla: "libre",
  estilo: { acento: "#1d7a46", esquinas: "redondeado", modo: "claro" },
  negocio: {
    nombre: "Huerta Lola",
    eslogan: "Verdura agroecológica de Colonia Caroya, en tu casa los jueves.",
    subtitulo: "Armamos bolsones con lo que da la huerta cada semana y los llevamos a Córdoba capital. Pedís hasta el martes por WhatsApp.",
    whatsapp: "5493525550505",
    direccion: "Colonia Caroya, Córdoba",
    horario: "Pedidos de lunes a martes · Entregas los jueves",
    instagram: "huertalola",
  },
  secciones: [
    { id: "b-portada", tipo: "portada", variante: "partida", activa: true },
    {
      id: "b-texto",
      tipo: "texto",
      variante: "destacado",
      activa: true,
      datos: { titulo: "Cómo trabajamos", cuerpo: "Cosechamos el miércoles a la tarde y entregamos el jueves. Sin agroquímicos, con semillas propias y riego por goteo. Lo que no se vende va a compost." },
    },
    { id: "b-servicios", tipo: "servicios", variante: "tarjetas", activa: true },
    { id: "b-galeria", tipo: "galeria", variante: "grilla", activa: true },
    { id: "b-testimonios", tipo: "testimonios", variante: "citas", activa: true },
    { id: "b-cta", tipo: "cta", variante: "banda", activa: true, datos: { titulo: "¿Querés tu bolsón este jueves?", texto: "Pedí hasta el martes a la noche.", boton: "Hacer mi pedido" } },
    { id: "b-faq", tipo: "faq", variante: "acordeon", activa: true },
    { id: "b-ubicacion", tipo: "ubicacion", variante: "horario", activa: true },
    { id: "b-contacto", tipo: "contacto", variante: "whatsapp", activa: true },
  ],
  contenido: {
    servicios: [
      { id: "bolson-chico", nombre: "Bolsón chico", descripcion: "Para 1 o 2 personas: 4 kg de verdura de estación.", precio: 14000, duracionMin: 30 },
      { id: "bolson-familiar", nombre: "Bolsón familiar", descripcion: "Para 4 personas: 8 kg de verdura y hojas.", precio: 24000, duracionMin: 30 },
      { id: "huevos", nombre: "Maple de huevos", descripcion: "30 huevos de gallinas libres.", precio: 9500, duracionMin: 30 },
    ],
    galeria: [{ alt: "Bolsón de verduras de estación", epigrafe: "Bolsón de otoño" }, { alt: "La huerta en Colonia Caroya" }, { alt: "Cosecha de lechugas" }],
    testimonios: [
      { id: "t-1", autor: "Romina, Cerro de las Rosas", texto: "La verdura dura el doble que la del súper. Ya vamos dos años." },
      { id: "t-2", autor: "Diego, General Paz", texto: "Puntuales siempre y los tomates saben a tomate." },
    ],
    faq: [
      { id: "zona", pregunta: "¿A qué zonas llegan?", respuesta: "Córdoba capital y Gran Córdoba. Para otras zonas, consultanos." },
      { id: "pago", pregunta: "¿Cómo se paga?", respuesta: "Transferencia o efectivo al recibir." },
    ],
  },
  whatsappFlotante: true,
};
