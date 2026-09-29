import type { ConfigDe } from "../schema/landing-config";

export const genericoDefault: ConfigDe<"generico"> = {
  version: 1,
  plantilla: "generico",
  estilo: { acento: "#ff4a1c", esquinas: "suave", modo: "claro" },
  negocio: {
    nombre: "Taller Sur",
    eslogan: "Muebles a medida que entran justo donde los necesitás.",
    subtitulo:
      "Carpintería en Barrio Jardín. Placares, cocinas y muebles de guardado en melamina y madera maciza. Medimos, diseñamos y colocamos: vos solo elegís.",
    whatsapp: "5493515550404",
    direccion: "Av. Vélez Sársfield 3980, Barrio Jardín, Córdoba",
    horario: "Lunes a viernes de 8 a 17 h",
    instagram: "tallersur.cba",
  },
  secciones: [
    { tipo: "bento", variante: "clasico", activa: true },
    { tipo: "casos", variante: "antes-despues", activa: true },
    { tipo: "servicios", variante: "lista", activa: true },
    { tipo: "testimonios", variante: "cita-grande", activa: true },
    { tipo: "contacto", variante: "formulario-wa", activa: true },
    { tipo: "faq", variante: "acordeon", activa: false },
  ],
  contenido: {
    servicios: [
      { id: "placares", nombre: "Placares e interiores", descripcion: "Frentes corredizos o de abrir, con interiores a medida.", precio: 850000, precioDesde: true, duracionMin: 60 },
      { id: "cocinas", nombre: "Muebles de cocina", descripcion: "Bajo mesada, alacenas y torres. Herrajes con cierre suave.", precio: 1400000, precioDesde: true, duracionMin: 60 },
      { id: "a-medida", nombre: "Muebles a medida", descripcion: "Racks, escritorios, bibliotecas. Lo que se te ocurra.", precio: null, duracionMin: 60 },
      { id: "visita", nombre: "Visita y medición", descripcion: "Vamos, medimos y te pasamos presupuesto en 48 h.", precio: 0, duracionMin: 45 },
    ],
    casos: [
      { id: "cocina-alta-cordoba", titulo: "Cocina chica que ahora rinde el doble", cliente: "Depto en Alta Córdoba", problema: "Una cocina de 2,4 m lineales, sin alacenas y con la heladera trabando la puerta.", solucion: "Torre de guardado hasta el techo, alacenas con elevación y la heladera reubicada en un nicho.", resultado: "40 % más de guardado en el mismo espacio.", antes: { alt: "Cocina antes de la obra" }, despues: { alt: "Cocina terminada con alacenas blancas" } },
      { id: "placard-general-paz", titulo: "Placard en pasillo de 60 cm", cliente: "Casa en General Paz", problema: "Un pasillo angosto donde no entraba un placard estándar.", solucion: "Placard de 45 cm de profundidad con puertas corredizas espejadas.", antes: { alt: "Pasillo vacío" }, despues: { alt: "Placard con puertas espejadas" } },
    ],
    testimonios: [
      { id: "c1", autor: "Valeria R.", texto: "Cumplieron la fecha que dijeron, dejaron todo limpio y la cocina quedó mejor que en el render.", detalle: "Cocina en Alta Córdoba" },
      { id: "c2", autor: "Gustavo P.", texto: "Presupuesto claro, sin sorpresas. Ya les encargué el placard del cuarto de los chicos.", detalle: "Placard en General Paz" },
    ],
    faq: [
      { id: "tiempos", pregunta: "¿Cuánto tardan?", respuesta: "Entre 20 y 35 días hábiles desde la seña, según el trabajo. Te damos fecha de colocación al confirmar." },
      { id: "zona", pregunta: "¿Trabajan fuera de Córdoba capital?", respuesta: "Sí, en Gran Córdoba sin costo extra. Para Sierras Chicas y Calamuchita sumamos el traslado." },
    ],
  },
  whatsappFlotante: true,
};
