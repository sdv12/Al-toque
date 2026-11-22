/*
 * Contenido de ejemplo de la web de cada tipo de local: historia larga, lugares de la galería (sin
 * fotos: el restaurante sube las suyas) y eventos. Todo inventado. Las reseñas arrancan vacías: solo
 * se cargan reseñas reales.
 */
import { SECCIONES_WEB, type Evento, type IdSeccionWeb, type IdTipo, type Web } from "./tipos";
import { hoyISO, sumarDias, uid } from "./util";

interface Contenido {
  historia: string;
  galeria: string[];
  /** Eventos: día de la semana (0 domingo) de la próxima fecha. */
  eventos: { titulo: string; dia: number; hora: string; texto: string; precio: number }[];
}

const CONTENIDO: Record<IdTipo, Contenido> = {
  bodegon: {
    historia:
      "Abrimos en una esquina de barrio con seis mesas y el recetario de la abuela Rosa. Hoy son treinta cubiertos, pero la cocina sigue igual: fuego lento, porciones generosas y nada de apuro.\n\nEl almacén nació porque los clientes nos pedían el salame y el dulce de leche para llevarse. Lo trae gente del campo que conocemos hace años.",
    galeria: ["El salón un viernes", "El horno de barro", "Las pastas del día", "El almacén", "La vereda en verano", "El flan de la casa"],
    eventos: [
      { titulo: "Peña folklórica", dia: 5, hora: "22:00", texto: "Guitarras, empanadas y vino de la casa. Conviene reservar.", precio: 0 },
      { titulo: "Locro patrio", dia: 0, hora: "12:30", texto: "El locro de siempre, con su quiquirimichi y pastelitos de postre.", precio: 18500 },
    ],
  },
  parrilla: {
    historia:
      "Empezamos haciendo asados para amigos los domingos. Un día éramos cuarenta en el patio y decidimos que eso tenía que ser un restaurante.\n\nTrabajamos con un solo frigorífico y con leña de quebracho blanco. La cava la armamos con bodegas chicas que visitamos nosotros.",
    galeria: ["La parrilla encendida", "El bife de chorizo", "La cava", "La galería", "Las achuras", "El salón de noche"],
    eventos: [{ titulo: "Noche de vinos de Gualtallary", dia: 4, hora: "21:00", texto: "Cuatro vinos con la enóloga de la bodega y una tabla de cortes para acompañar.", precio: 42000 }],
  },
  pizzeria: {
    historia:
      "Tina llegó de Nápoles con un cuaderno de recetas y la manía de dejar descansar la masa dos días. Sus nietos siguen haciendo todo como ella decía.\n\nEl horno es a la piedra y la muzzarella viene de un tambo de Villa María.",
    galeria: ["El horno a la piedra", "La fugazzeta rellena", "Amasando a la mañana", "El salón", "La vereda", "El tiramisú"],
    eventos: [{ titulo: "Clase de pizza para chicos", dia: 6, hora: "17:00", texto: "Amasan, arman y se llevan su pizza. De 6 a 12 años, con merienda.", precio: 9500 }],
  },
  cafe: {
    historia:
      "Molienda empezó como un carrito de café en una feria. Tostábamos en casa y vendíamos los domingos.\n\nHoy tostamos acá cada semana, elegimos granos de pequeños productores y horneamos todo temprano. Si te gusta un café, te contamos de dónde viene.",
    galeria: ["La barra", "El tostador", "Medialunas recién salidas", "Un flat white", "La vereda", "El café en grano"],
    eventos: [
      { titulo: "Taller de métodos de filtrado", dia: 6, hora: "10:30", texto: "V60, Chemex y prensa francesa: aprendé a preparar en casa. Incluye 250 g de café.", precio: 16000 },
      { titulo: "Catación abierta", dia: 3, hora: "18:00", texto: "Probamos tres orígenes nuevos. Sin cargo, cupos limitados.", precio: 0 },
    ],
  },
  bar: {
    historia:
      "Lúpulo arrancó con cuatro canillas y un patio. Ahora son doce y la idea es la misma: cerveza cordobesa bien tirada y gente con ganas de quedarse.\n\nRotamos estilos todas las semanas con cinco cervecerías de la provincia.",
    galeria: ["Las canillas", "El patio de noche", "Una pinta de IPA", "La barra", "Papas con cheddar", "Noche de trivia"],
    eventos: [
      { titulo: "Trivia cervecera", dia: 3, hora: "21:00", texto: "Equipos de hasta 6. El que gana se lleva un growler lleno.", precio: 0 },
      { titulo: "Banda en vivo", dia: 6, hora: "23:30", texto: "Rock nacional en el patio.", precio: 3000 },
    ],
  },
  sushi: {
    historia:
      "Kumo quiere decir «nube». Es una barra de ocho lugares donde el sushiman corta frente a vos y el arroz se hace en tandas chicas.\n\nEl salmón llega tres veces por semana; si un día no está como queremos, ese día no hay.",
    galeria: ["La barra", "Combinado de 30 piezas", "Nigiris de salmón", "El salón", "Gyozas", "Mochi de té verde"],
    eventos: [{ titulo: "Omakase de ocho pasos", dia: 5, hora: "21:00", texto: "El sushiman elige por vos. Solo en la barra, ocho lugares.", precio: 65000 }],
  },
  hamburguesas: {
    historia:
      "Doble Queso nació en un food truck. La receta es corta: carne picada en el día, bollo de papa horneado acá y cheddar en serio.\n\nPreferimos hacer pocas hamburguesas y hacerlas bien.",
    galeria: ["La plancha", "La Doble Queso", "Papas con cheddar", "El local", "Milkshake de dulce de leche", "La vereda"],
    eventos: [{ titulo: "Desafío triple smash", dia: 5, hora: "21:00", texto: "Comete la triple con papas en 10 minutos y no la pagás.", precio: 0 }],
  },
  rotiseria: {
    historia:
      "Coca cocina para el barrio desde hace veinte años. Empezó vendiendo milanesas por la ventana de su casa.\n\nHoy somos cuatro en la cocina y todos los días hay un plato distinto en el pizarrón.",
    galeria: ["El pizarrón del día", "Pollo al spiedo", "Milanesas recién hechas", "El mostrador", "Empanadas", "La moto de los envíos"],
    eventos: [],
  },
};

/** La próxima fecha (desde mañana) que cae en ese día de la semana. */
function proximo(dia: number, hoy: string) {
  for (let i = 1; i <= 7; i++) {
    const f = sumarDias(hoy, i);
    const [y = 2000, m = 1, d = 1] = f.split("-").map(Number);
    if (new Date(y, m - 1, d).getDay() === dia) return f;
  }
  return sumarDias(hoy, 7);
}

const ORDEN: IdSeccionWeb[] = ["ocupacion", "carta", "reservar", "eventos", "galeria", "historia", "resenas", "donde"];

export function webDe(tipo: IdTipo, ahora = new Date()): Web {
  const c = CONTENIDO[tipo];
  const hoy = hoyISO(ahora);
  const eventos: Evento[] = c.eventos.map((e) => ({ id: uid(), titulo: e.titulo, fecha: proximo(e.dia, hoy), hora: e.hora, texto: e.texto, precio: e.precio }));
  return {
    secciones: ORDEN.map((id) => ({ id, visible: true, titulo: "" })),
    logo: "",
    portada: "",
    historiaFoto: "",
    historiaLarga: c.historia,
    galeria: c.galeria.map((texto) => ({ id: uid(), src: "", texto })),
    eventos,
    resenas: [],
    tipografia: "",
    mapa: true,
  };
}

/** Completa una lista de secciones vieja o incompleta (agrega las que falten al final). */
export function completarSecciones(web: Web): Web["secciones"] {
  const vistas = web.secciones.filter((s) => s.id in SECCIONES_WEB);
  return [...vistas, ...ORDEN.filter((id) => !vistas.some((s) => s.id === id)).map((id) => ({ id, visible: true, titulo: "" }))];
}
