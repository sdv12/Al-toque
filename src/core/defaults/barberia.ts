import type { ConfigDe } from "../schema/landing-config";

export const barberiaDefault: ConfigDe<"barberia"> = {
  version: 1,
  plantilla: "barberia",
  estilo: { acento: "#c9a45c", esquinas: "recto", modo: "oscuro" },
  negocio: {
    nombre: "Barbería Güemes",
    eslogan: "Corte a navaja, charla y buen café.",
    subtitulo:
      "Desde 2016 en Belgrano y Achával Rodríguez. Cortes clásicos, fades prolijos y barba con toalla caliente. Reservás en un minuto, con el barbero que quieras.",
    whatsapp: "5493515550101",
    direccion: "Belgrano 780, Barrio Güemes, Córdoba",
    horario: "Martes a sábado de 10 a 20 h",
    instagram: "barberiaguemes",
  },
  agenda: {
    dias: [2, 3, 4, 5, 6].map((dia) => ({ dia, franjas: [{ desde: "10:00", hasta: "20:00" }] })),
    intervaloMin: 15,
    anticipacionMinHoras: 2,
    diasHaciaAdelante: 21,
  },
  secciones: [
    { tipo: "portada", variante: "editorial", activa: true },
    { tipo: "servicios", variante: "pizarra", activa: true },
    { tipo: "equipo", variante: "fichas", activa: true },
    { tipo: "galeria", variante: "collage", activa: true },
    { tipo: "testimonios", variante: "recortes", activa: true },
    { tipo: "ubicacion", variante: "horario-grande", activa: true },
    { tipo: "faq", variante: "lista", activa: false },
  ],
  contenido: {
    servicios: [
      { id: "corte", nombre: "Corte", descripcion: "Tijera o máquina, lavado y peinado.", precio: 18000, duracionMin: 40, categoria: "Pelo" },
      { id: "fade", nombre: "Fade / degradé", descripcion: "Degradé a navaja con terminación a mano.", precio: 21000, duracionMin: 45, categoria: "Pelo" },
      { id: "barba", nombre: "Barba", descripcion: "Perfilado, toalla caliente y aceite.", precio: 12000, duracionMin: 30, categoria: "Barba" },
      { id: "afeitado-navaja", nombre: "Afeitado a navaja", descripcion: "Afeitado completo, ritual clásico.", precio: 15000, duracionMin: 40, categoria: "Barba", profesionalIds: ["tano"] },
      { id: "corte-y-barba", nombre: "Corte + barba", descripcion: "El combo de siempre.", precio: 26000, duracionMin: 70, categoria: "Combos" },
      { id: "corte-nino", nombre: "Corte niño (hasta 12)", precio: 14000, duracionMin: 30, categoria: "Pelo" },
    ],
    equipo: [
      { id: "tano", nombre: "Mariano “Tano” Ruiz", rol: "Fundador", especialidad: "Clásicos y afeitado a navaja", foto: { alt: "Mariano Ruiz, barbero" }, instagram: "tano.barber" },
      { id: "lu", nombre: "Lucía Ferreyra", rol: "Barbera", especialidad: "Fades y diseños", foto: { alt: "Lucía Ferreyra, barbera" }, agenda: { dias: [3, 4, 5, 6].map((dia) => ({ dia, franjas: [{ desde: "12:00", hasta: "20:00" }] })) } },
      { id: "nico", nombre: "Nico Paredes", rol: "Barbero", especialidad: "Barbas y cortes texturizados", foto: { alt: "Nico Paredes, barbero" } },
    ],
    galeria: [
      { alt: "Fade bajo con raya marcada", epigrafe: "Fade bajo, raya a navaja" },
      { alt: "Sillón de barbero antiguo", epigrafe: "El sillón del '62" },
      { alt: "Barba perfilada", epigrafe: "Barba con toalla caliente" },
      { alt: "Frente del local sobre Belgrano" },
      { alt: "Corte clásico con tijera" },
    ],
    testimonios: [
      { id: "t1", autor: "Facundo M.", texto: "Voy hace cuatro años y nunca me tuvieron esperando. El Tano es un artista con la navaja.", detalle: "Cliente desde 2021" },
      { id: "t2", autor: "Joaquín", texto: "Le llevé una foto de un fade que vi en Instagram y Lu lo clavó. Ya reservé el próximo.", detalle: "Primera visita" },
    ],
    faq: [
      { id: "sin-turno", pregunta: "¿Atienden sin turno?", respuesta: "Si hay un hueco, sí. Pero con turno te asegurás no esperar: reservás acá en un minuto." },
      { id: "pagos", pregunta: "¿Cómo se paga?", respuesta: "Efectivo, transferencia o Mercado Pago. No trabajamos con tarjeta de crédito." },
    ],
  },
  whatsappFlotante: false,
};
