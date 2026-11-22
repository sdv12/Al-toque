/*
 * Tipos de local: cada uno trae un restaurante de ejemplo completo (ficticio), con su carta, sus
 * horarios, sus mesas, sus textos, los módulos que suele usar y el diseño que mejor le queda.
 * Todo se puede cambiar después desde el panel.
 */
import type { Categoria, Etiqueta, Franja, GrupoOpciones, IdDiseno, IdTipo, Modulos, Promo, ReglasReserva, ZonaEnvio } from "./tipos";

type Fila = [cat: string, nombre: string, desc: string, precio: number, extra?: { porcion?: string; destacado?: boolean; llevar?: boolean; etiquetas?: Etiqueta[] }];

export interface TipoLocal {
  id: IdTipo;
  nombre: string;
  /** Una línea para el selector. */
  resumen: string;
  ejemplo: string;
  bajada: string;
  direccion: string;
  instagram: string;
  diseno: IdDiseno;
  acento: string;
  textos: { titulo: string; subtitulo: string; historia: string; datos: string[] };
  semana: Franja[][];
  /** Mesas por zona del salón (capacidad de cada una). */
  salon: { zona: string; mesas: number[] }[];
  modulos: Modulos;
  reservas: ReglasReserva;
  demoraLlevar: number;
  delivery: { costo: number; minimo: number; zona: string; demora: number };
  cubierto: number;
  /** Secciones que van a la barra en vez de la cocina. */
  barra: string[];
  /** Opciones por plato (por el comienzo del nombre); reciben el precio del plato. */
  opciones: Record<string, (precio: number) => GrupoOpciones[]>;
  /** Platos que salen solo algunos días (por el comienzo del nombre). */
  dias: Record<string, number[]>;
  promos: Omit<Promo, "id">[];
  envios: Omit<ZonaEnvio, "id">[];
  categorias: Categoria[];
  carta: Fila[];
}

const F = (nombre: string, desde: string, hasta: string): Franja => ({ nombre, desde, hasta });
/** Arma la semana: índice 0 = domingo. */
const semana = (dias: Partial<Record<0 | 1 | 2 | 3 | 4 | 5 | 6, Franja[]>>): Franja[][] =>
  [0, 1, 2, 3, 4, 5, 6].map((d) => dias[d as 0] ?? []);

const RESERVAS_BASE: ReglasReserva = { intervalo: 30, margenCierre: 90, diasAnticipacion: 14, maxPersonas: 10, tolerancia: 15 };
const SIN_DELIVERY = { costo: 0, minimo: 0, zona: "", demora: 45 };
const TODO: Modulos = { salon: true, ocupacionWeb: true, reservas: true, llevar: true, delivery: false, caja: true, tienda: false };

type Extras = Pick<TipoLocal, "barra" | "opciones" | "dias" | "promos" | "envios">;

const BASE: Record<IdTipo, Omit<TipoLocal, keyof Extras>> = {
  bodegon: {
    id: "bodegon",
    nombre: "Bodegón",
    resumen: "Cocina de casa, porciones para compartir y almacén",
    ejemplo: "El Mantel",
    bajada: "Bodegón · Almacén",
    direccion: "Av. Fuerza Aérea 2450, Córdoba",
    instagram: "elmantel.bodegon",
    diseno: "imprenta",
    acento: "",
    textos: {
      titulo: "Se come como en casa.",
      subtitulo: "Se sirve como antes.",
      historia: "Cocina de bodegón en porciones abundantes, para treinta comensales por turno. Las pastas se amasan acá y el vacío se hace ocho horas en el horno de barro.",
      datos: ["Martes a domingo", "30 cubiertos", "Almacén de campo"],
    },
    semana: semana({ 2: [F("Mediodía", "12:30", "15:30"), F("Noche", "20:30", "00:30")], 3: [F("Mediodía", "12:30", "15:30"), F("Noche", "20:30", "00:30")], 4: [F("Mediodía", "12:30", "15:30"), F("Noche", "20:30", "00:30")], 5: [F("Mediodía", "12:30", "15:30"), F("Noche", "20:30", "00:30")], 6: [F("Mediodía", "12:30", "15:30"), F("Noche", "20:30", "00:30")], 0: [F("Mediodía", "12:30", "16:00")] }),
    salon: [{ zona: "Salón", mesas: [2, 2, 4, 4, 4, 4] }, { zona: "Vereda", mesas: [4, 6] }],
    modulos: { ...TODO, tienda: true },
    reservas: RESERVAS_BASE,
    demoraLlevar: 30,
    delivery: SIN_DELIVERY,
    cubierto: 2500,
    categorias: [
      { id: "entradas", nombre: "Para picar" },
      { id: "principales", nombre: "De la cocina" },
      { id: "parrilla", nombre: "Parrilla y horno de barro" },
      { id: "pastas", nombre: "Pastas de la casa" },
      { id: "postres", nombre: "Postres" },
      { id: "bebidas", nombre: "Bodega y bebidas" },
      { id: "almacen", nombre: "Almacén de campo", nota: "Para llevarte a casa. Se suman al pedido para llevar.", tienda: true },
    ],
    carta: [
      ["entradas", "Provoleta a la plancha", "Con orégano, ají molido y tomates asados.", 9800, { porcion: "Para 2", etiquetas: ["vegetariano", "sintacc"] }],
      ["entradas", "Empanadas cortadas a cuchillo", "De carne, al horno de barro. La docena.", 18500, { porcion: "Docena" }],
      ["entradas", "Tabla de fiambres", "Salame, bondiola, queso de campo, aceitunas y pan casero.", 21000, { porcion: "Para 3", destacado: true }],
      ["entradas", "Tortilla de papas babé", "Con cebolla caramelizada.", 12500, { porcion: "Para 2", etiquetas: ["vegetariano", "sintacc"] }],
      ["principales", "Milanesa napolitana con fritas", "De nalga, del tamaño del plato. Jamón, muzza y salsa casera.", 26500, { porcion: "Para 2", destacado: true }],
      ["principales", "Pastel de papas", "Carne cortada a cuchillo, huevo y aceitunas, gratinado.", 17800, { porcion: "Abundante", etiquetas: ["sintacc"] }],
      ["principales", "Lengua a la vinagreta", "Fría, con vinagreta de morrones y huevo.", 14200, { etiquetas: ["sintacc"] }],
      ["principales", "Locro de la casa", "Solo sábados y domingos. Con su quiquirimichi.", 16500, { porcion: "Abundante" }],
      ["parrilla", "Vacío al horno de barro", "Ocho horas de cocción. Con papas rústicas.", 29500, { porcion: "Para 2", destacado: true, etiquetas: ["sintacc"] }],
      ["parrilla", "Bife de chorizo", "500 g, a punto. Con ensalada mixta.", 27800, { etiquetas: ["sintacc"] }],
      ["parrilla", "Matambre a la pizza", "Tierno, con muzzarella y morrones.", 24800, { porcion: "Para 2" }],
      ["pastas", "Ñoquis de papa con estofado", "Amasados acá. Estofado de osobuco.", 16900, { porcion: "Abundante" }],
      ["pastas", "Sorrentinos de jamón y queso", "Con salsa mixta o crema de hongos.", 17500],
      ["pastas", "Tallarines al huevo con tuco", "Tuco de la abuela, de cocción lenta.", 14800],
      ["postres", "Flan casero mixto", "Con dulce de leche y crema.", 7200, { destacado: true, etiquetas: ["sintacc"] }],
      ["postres", "Budín de pan", "Con caramelo y dulce de leche.", 6800],
      ["postres", "Panqueques con dulce de leche", "Quemados al azúcar.", 7500],
      ["bebidas", "Vino de la casa en pingüino", "Tinto de Mendoza, 1 litro.", 12000, { llevar: false }],
      ["bebidas", "Sifón de soda", "", 2500, { llevar: false }],
      ["bebidas", "Fernet con cola", "En jarra.", 9500, { llevar: false }],
      ["bebidas", "Gaseosa 1,5 L", "", 4800],
      ["almacen", "Salame de campo", "Pieza de 400 g, estacionado.", 11800],
      ["almacen", "Dulce de leche artesanal", "Frasco de 450 g.", 6200, { etiquetas: ["sintacc"] }],
      ["almacen", "Queso de campo", "Horma de 1 kg aprox.", 15500],
      ["almacen", "Escabeche de berenjenas", "Frasco de 350 g. Receta serrana.", 7800, { etiquetas: ["vegano"] }],
    ],
  },

  parrilla: {
    id: "parrilla",
    nombre: "Parrilla",
    resumen: "Cortes a las brasas, achuras y vinos",
    ejemplo: "La Leña",
    bajada: "Parrilla · Vinos",
    direccion: "Av. Rafael Núñez 4820, Cerro de las Rosas",
    instagram: "lalena.parrilla",
    diseno: "brasa",
    acento: "",
    textos: {
      titulo: "Leña de quebracho y paciencia.",
      subtitulo: "Cortes elegidos, punto justo.",
      historia: "Prendemos el fuego dos horas antes de abrir. Trabajamos con novillo pesado de un solo frigorífico y cada corte sale con su peso en la carta: lo que pedís es lo que llega.",
      datos: ["Fuego a leña", "40 cubiertos", "Cava de 80 etiquetas"],
    },
    semana: semana({ 2: [F("Noche", "20:00", "00:30")], 3: [F("Noche", "20:00", "00:30")], 4: [F("Noche", "20:00", "00:30")], 5: [F("Noche", "20:00", "01:00")], 6: [F("Mediodía", "12:00", "16:00"), F("Noche", "20:00", "01:00")], 0: [F("Mediodía", "12:00", "16:30")] }),
    salon: [{ zona: "Salón", mesas: [2, 2, 4, 4, 4, 4, 6] }, { zona: "Galería", mesas: [6, 8] }],
    modulos: { ...TODO },
    reservas: { ...RESERVAS_BASE, maxPersonas: 12 },
    demoraLlevar: 40,
    delivery: SIN_DELIVERY,
    cubierto: 3000,
    categorias: [
      { id: "achuras", nombre: "Achuras y entradas" },
      { id: "cortes", nombre: "Cortes", nota: "Pesos en crudo. Todos salen con chimichurri y salsa criolla." },
      { id: "parrilladas", nombre: "Parrilladas" },
      { id: "guarniciones", nombre: "Guarniciones" },
      { id: "postres", nombre: "Postres" },
      { id: "vinos", nombre: "Vinos y bebidas" },
    ],
    carta: [
      ["achuras", "Chorizo de cerdo", "Casero, con pan.", 5200, { etiquetas: ["sintacc"] }],
      ["achuras", "Morcilla dulce", "Con nuez y pasas.", 4800],
      ["achuras", "Mollejas al limón", "Crocantes por fuera.", 16800, { destacado: true, etiquetas: ["sintacc"] }],
      ["achuras", "Chinchulines a la trenza", "Bien dorados.", 12500, { etiquetas: ["sintacc"] }],
      ["achuras", "Provoleta con chimichurri", "En plancha de hierro.", 10500, { etiquetas: ["vegetariano", "sintacc"] }],
      ["cortes", "Bife de chorizo", "Novillo pesado. Jugoso por dentro.", 28500, { porcion: "450 g", destacado: true, etiquetas: ["sintacc"] }],
      ["cortes", "Ojo de bife", "Con su grasa, sellado a fuego fuerte.", 31500, { porcion: "400 g", etiquetas: ["sintacc"] }],
      ["cortes", "Entraña", "Fina y sabrosa.", 26800, { porcion: "350 g", etiquetas: ["sintacc"] }],
      ["cortes", "Vacío", "Con la grasa crocante.", 25900, { porcion: "450 g", etiquetas: ["sintacc"] }],
      ["cortes", "Asado de tira banderita", "Ancho, de costilla corta.", 24500, { porcion: "500 g", etiquetas: ["sintacc"] }],
      ["cortes", "Matambre de cerdo a la pizza", "Con muzzarella, tomate y orégano.", 22800, { porcion: "Para 2" }],
      ["cortes", "Pollo deshuesado", "Al limón y romero.", 18900, { porcion: "Medio", etiquetas: ["sintacc"] }],
      ["parrilladas", "Parrillada para dos", "Chorizo, morcilla, asado, vacío, pollo y mollejas.", 52000, { porcion: "Para 2", destacado: true }],
      ["parrilladas", "Parrillada para cuatro", "La de dos, con más cortes y chinchulines.", 98000, { porcion: "Para 4" }],
      ["guarniciones", "Papas fritas", "Cortadas a mano.", 7200, { etiquetas: ["vegano", "sintacc"] }],
      ["guarniciones", "Papas al plomo", "Con crema de verdeo.", 7800, { etiquetas: ["vegetariano", "sintacc"] }],
      ["guarniciones", "Ensalada mixta", "Lechuga, tomate y cebolla.", 6200, { etiquetas: ["vegano", "sintacc"] }],
      ["guarniciones", "Verduras a las brasas", "Morrón, zapallo, berenjena y cebolla.", 8900, { etiquetas: ["vegano", "sintacc"] }],
      ["postres", "Flan con dulce de leche", "", 7200, { etiquetas: ["sintacc"] }],
      ["postres", "Panqueque al rhum", "Flambeado en la mesa.", 8500],
      ["postres", "Almendrado", "Helado de almendras con salsa de chocolate.", 7800],
      ["vinos", "Malbec de la casa", "Valle de Uco, botella.", 18500, { llevar: false }],
      ["vinos", "Cabernet Franc reserva", "Gualtallary, botella.", 32000, { llevar: false, destacado: true }],
      ["vinos", "Copa de vino", "Malbec o Torrontés.", 5500, { llevar: false }],
      ["vinos", "Agua con o sin gas", "", 3200],
    ],
  },

  pizzeria: {
    id: "pizzeria",
    nombre: "Pizzería y pastas",
    resumen: "Pizzas a la piedra, pastas caseras y delivery",
    ejemplo: "Mamma Tina",
    bajada: "Pizzas a la piedra · Pastas",
    direccion: "Belgrano 640, Barrio Güemes",
    instagram: "mammatina.pizza",
    diseno: "trattoria",
    acento: "",
    textos: {
      titulo: "La masa descansa 48 horas.",
      subtitulo: "Vos, solo lo que tarda el horno.",
      historia: "La receta de la masa vino en un cuaderno desde Nápoles. Horno a la piedra, muzzarella de tambo y salsa de tomates perita. Las pastas se hacen cada mañana.",
      datos: ["Horno a la piedra", "Delivery propio", "Pastas del día"],
    },
    semana: semana({ 2: [F("Noche", "19:30", "00:00")], 3: [F("Noche", "19:30", "00:00")], 4: [F("Noche", "19:30", "00:00")], 5: [F("Noche", "19:30", "00:30")], 6: [F("Mediodía", "12:00", "15:00"), F("Noche", "19:30", "00:30")], 0: [F("Mediodía", "12:00", "15:00"), F("Noche", "19:30", "00:00")] }),
    salon: [{ zona: "Salón", mesas: [2, 2, 4, 4, 4] }, { zona: "Vereda", mesas: [4, 6] }],
    modulos: { ...TODO, delivery: true },
    reservas: { ...RESERVAS_BASE, diasAnticipacion: 7 },
    demoraLlevar: 30,
    delivery: { costo: 2500, minimo: 15000, zona: "Hasta 3 km del local (Güemes, Nueva Córdoba, Centro)", demora: 45 },
    cubierto: 0,
    categorias: [
      { id: "pizzas", nombre: "Pizzas a la piedra", nota: "Grande, 8 porciones. Media pizza: 60 % del precio." },
      { id: "faina", nombre: "Fainá y empanadas" },
      { id: "pastas", nombre: "Pastas caseras" },
      { id: "postres", nombre: "Dolci" },
      { id: "bebidas", nombre: "Bebidas" },
    ],
    carta: [
      ["pizzas", "Muzzarella", "Salsa de tomate, muzzarella de tambo y aceitunas.", 13500, { etiquetas: ["vegetariano"] }],
      ["pizzas", "Napolitana", "Tomate en rodajas, ajo y albahaca fresca.", 15200, { etiquetas: ["vegetariano"] }],
      ["pizzas", "Fugazzeta rellena", "Doble masa, rellena de muzzarella y cebolla.", 17800, { destacado: true, etiquetas: ["vegetariano"] }],
      ["pizzas", "Cuatro quesos", "Muzzarella, roquefort, parmesano y provolone.", 17200, { etiquetas: ["vegetariano"] }],
      ["pizzas", "Rúcula y crudo", "Jamón crudo, rúcula y lascas de parmesano.", 18900, { destacado: true }],
      ["pizzas", "Calabresa picante", "Longaniza calabresa y ají en aceite.", 16500, { etiquetas: ["picante"] }],
      ["faina", "Fainá", "La porción.", 1800, { etiquetas: ["vegano", "sintacc"] }],
      ["faina", "Empanadas de carne", "Al horno de barro. La docena.", 17500, { porcion: "Docena" }],
      ["faina", "Empanadas de jamón y queso", "La docena.", 16500, { porcion: "Docena" }],
      ["pastas", "Sorrentinos de calabaza", "Con salsa de manteca y salvia.", 15800, { etiquetas: ["vegetariano"] }],
      ["pastas", "Ñoquis de papa", "Con salsa pomodoro o bolognesa.", 13900, { destacado: true }],
      ["pastas", "Lasagna de la nonna", "Carne, verdura, salsa blanca y gratinado.", 17500, { porcion: "Abundante" }],
      ["pastas", "Ravioles de ricota y nuez", "Con crema de hongos.", 15200, { etiquetas: ["vegetariano"] }],
      ["postres", "Tiramisú", "Con café de especialidad.", 7800, { destacado: true }],
      ["postres", "Panna cotta", "Con frutos rojos.", 6900, { etiquetas: ["sintacc"] }],
      ["postres", "Helado artesanal ¼ kg", "Dos gustos.", 6500],
      ["bebidas", "Vino tinto de la casa", "Botella.", 11500],
      ["bebidas", "Cerveza artesanal 1 L", "Rubia o roja.", 7500],
      ["bebidas", "Gaseosa 1,5 L", "", 4800],
    ],
  },

  cafe: {
    id: "cafe",
    nombre: "Café",
    resumen: "Café de especialidad, desayunos, meriendas y café en grano",
    ejemplo: "Molienda",
    bajada: "Café de especialidad · Pastelería",
    direccion: "Obispo Trejo 1120, Nueva Córdoba",
    instagram: "molienda.cafe",
    diseno: "cafe",
    acento: "",
    textos: {
      titulo: "Café recién tostado,",
      subtitulo: "pastelería recién horneada.",
      historia: "Tostamos cada semana granos de pequeños productores de Colombia, Brasil y Etiopía. Todo lo dulce se hace en nuestra cocina, temprano, antes de abrir.",
      datos: ["Tostado propio", "Opciones sin TACC", "Wifi y enchufes"],
    },
    semana: semana({ 1: [F("Todo el día", "08:00", "20:00")], 2: [F("Todo el día", "08:00", "20:00")], 3: [F("Todo el día", "08:00", "20:00")], 4: [F("Todo el día", "08:00", "20:00")], 5: [F("Todo el día", "08:00", "20:00")], 6: [F("Todo el día", "09:00", "20:00")], 0: [F("Mañana", "09:00", "14:00")] }),
    salon: [{ zona: "Salón", mesas: [2, 2, 4, 4] }, { zona: "Vereda", mesas: [2, 2] }],
    modulos: { ...TODO, reservas: false, tienda: true },
    reservas: { ...RESERVAS_BASE, maxPersonas: 6 },
    demoraLlevar: 15,
    delivery: SIN_DELIVERY,
    cubierto: 0,
    categorias: [
      { id: "cafe", nombre: "Café" },
      { id: "desayunos", nombre: "Desayunos y meriendas" },
      { id: "pasteleria", nombre: "Pastelería" },
      { id: "almuerzo", nombre: "Almuerzo" },
      { id: "grano", nombre: "Café para tu casa", nota: "Tostado esta semana. Te lo molemos para tu cafetera.", tienda: true },
    ],
    carta: [
      ["cafe", "Espresso", "Blend de la casa.", 2600, { etiquetas: ["vegano", "sintacc"] }],
      ["cafe", "Cortado", "", 2900, { etiquetas: ["vegetariano", "sintacc"] }],
      ["cafe", "Flat white", "Doble espresso y leche texturizada.", 3900, { destacado: true, etiquetas: ["vegetariano", "sintacc"] }],
      ["cafe", "Latte", "Con leche o bebida de avena.", 3800, { etiquetas: ["vegetariano", "sintacc"] }],
      ["cafe", "Filtrado V60", "Origen de la semana.", 4200, { etiquetas: ["vegano", "sintacc"] }],
      ["cafe", "Cold brew", "Infusionado 18 horas.", 4500, { etiquetas: ["vegano", "sintacc"] }],
      ["desayunos", "Tostado de jamón y queso", "En pan de miga casero.", 6800],
      ["desayunos", "Medialunas", "De manteca, tres.", 3600, { porcion: "×3", etiquetas: ["vegetariano"] }],
      ["desayunos", "Tostón de palta", "Masa madre, palta, huevo poché y semillas.", 8900, { destacado: true, etiquetas: ["vegetariano"] }],
      ["desayunos", "Yogur con granola", "Granola casera y frutas de estación.", 5800, { etiquetas: ["vegetariano", "sintacc"] }],
      ["desayunos", "Desayuno Molienda", "Café a elección, jugo, tostadas con mermelada y una medialuna.", 9500, { destacado: true }],
      ["pasteleria", "Budín de limón", "Con glaseado.", 3900, { etiquetas: ["vegetariano"] }],
      ["pasteleria", "Cookie de chocolate", "Con sal marina.", 3200, { etiquetas: ["vegetariano"] }],
      ["pasteleria", "Cheesecake de frutos rojos", "La porción.", 6200, { etiquetas: ["vegetariano"] }],
      ["pasteleria", "Alfajor de maicena sin TACC", "", 2900, { etiquetas: ["sintacc", "vegetariano"] }],
      ["almuerzo", "Sándwich de bondiola braseada", "Con cebolla morada y alioli.", 10500],
      ["almuerzo", "Bowl de quinoa", "Quinoa, garbanzos, vegetales asados y hummus.", 9800, { etiquetas: ["vegano", "sintacc"] }],
      ["almuerzo", "Quiche del día", "Con ensalada verde.", 8800, { etiquetas: ["vegetariano"] }],
      ["grano", "Café en grano 250 g", "Origen de la semana.", 14500, { etiquetas: ["vegano", "sintacc"] }],
      ["grano", "Café en grano 1 kg", "Blend de la casa.", 48000, { etiquetas: ["vegano", "sintacc"] }],
      ["grano", "Filtros V60 ×100", "", 9500],
    ],
  },

  bar: {
    id: "bar",
    nombre: "Bar o cervecería",
    resumen: "Cervezas tiradas, tragos, picadas y happy hour",
    ejemplo: "Lúpulo",
    bajada: "Cervecería · Bar",
    direccion: "Av. Hipólito Yrigoyen 380, Nueva Córdoba",
    instagram: "lupulo.bar",
    diseno: "nocturno",
    acento: "",
    textos: {
      titulo: "Doce canillas.",
      subtitulo: "Cero apuro.",
      historia: "Cerveza de cinco cervecerías cordobesas, tirada a la temperatura justa. Tragos clásicos bien hechos y comida para compartir mientras la noche arranca.",
      datos: ["Happy hour 19 a 21", "12 canillas", "Patio cervecero"],
    },
    semana: semana({ 3: [F("Noche", "19:00", "02:00")], 4: [F("Noche", "19:00", "02:00")], 5: [F("Noche", "19:00", "03:00")], 6: [F("Noche", "19:00", "03:00")], 0: [F("Noche", "19:00", "01:00")] }),
    salon: [{ zona: "Adentro", mesas: [2, 2, 4, 4, 4] }, { zona: "Patio", mesas: [4, 6, 6, 8] }],
    modulos: { ...TODO, llevar: false, tienda: true },
    reservas: { ...RESERVAS_BASE, intervalo: 60, margenCierre: 240, diasAnticipacion: 10, maxPersonas: 16 },
    demoraLlevar: 15,
    delivery: SIN_DELIVERY,
    cubierto: 0,
    categorias: [
      { id: "tiradas", nombre: "Cervezas tiradas", nota: "Pinta de 500 cc o media pinta." },
      { id: "tragos", nombre: "Tragos" },
      { id: "picar", nombre: "Para picar" },
      { id: "burgers", nombre: "Hamburguesas" },
      { id: "growlers", nombre: "Para llevar", nota: "Traé tu growler o llevate uno nuestro.", tienda: true },
    ],
    carta: [
      ["tiradas", "IPA", "Amarga y cítrica. 6,5 %.", 5200, { destacado: true, llevar: false }],
      ["tiradas", "APA", "Lupulada y fresca. 5,2 %.", 4900, { llevar: false }],
      ["tiradas", "Honey", "Con miel de las sierras. 6 %.", 4800, { llevar: false }],
      ["tiradas", "Stout", "Café y chocolate. 5,8 %.", 5000, { llevar: false }],
      ["tiradas", "Golden", "Suave, para arrancar. 4,8 %.", 4600, { llevar: false }],
      ["tragos", "Fernet con cola", "", 6500, { llevar: false }],
      ["tragos", "Gin tonic", "Gin cordobés, tónica y pepino.", 8200, { llevar: false, destacado: true }],
      ["tragos", "Negroni", "", 8500, { llevar: false }],
      ["tragos", "Aperol spritz", "", 7900, { llevar: false }],
      ["tragos", "Sin alcohol: limonada de jengibre", "", 4800, { llevar: false, etiquetas: ["vegano"] }],
      ["picar", "Papas con cheddar y verdeo", "Para compartir.", 9800, { porcion: "Para 2", destacado: true }],
      ["picar", "Rabas", "Con limón y alioli.", 16500, { porcion: "Para 2" }],
      ["picar", "Nachos con guacamole", "Y pico de gallo.", 9500, { porcion: "Para 2", etiquetas: ["vegano", "picante"] }],
      ["picar", "Tabla cervecera", "Salame, queso, maní, aceitunas y bastones de muzzarella.", 22000, { porcion: "Para 4" }],
      ["burgers", "Clásica con fritas", "Doble carne, cheddar, lechuga y tomate.", 13500],
      ["burgers", "La de la casa", "Doble carne, cheddar, panceta y cebolla a la IPA.", 15800, { destacado: true }],
      ["growlers", "Recarga de growler 1 L", "Cualquier estilo.", 8500],
      ["growlers", "Growler de vidrio 1 L", "Con la primera carga.", 19500],
      ["growlers", "Pack 4 latas", "Elegí los estilos.", 14000],
    ],
  },

  sushi: {
    id: "sushi",
    nombre: "Sushi",
    resumen: "Rolls, combinados, delivery y barra",
    ejemplo: "Kumo",
    bajada: "Sushi bar",
    direccion: "Av. Colón 1550, Alberdi",
    instagram: "kumo.sushibar",
    diseno: "moderno",
    acento: "",
    textos: {
      titulo: "Arroz a temperatura.",
      subtitulo: "Pescado del día.",
      historia: "Una barra de ocho lugares y un sushiman que corta frente a vos. El salmón llega tres veces por semana y el arroz se hace en tandas chicas para que nunca esté frío.",
      datos: ["Barra de 8 lugares", "Delivery propio", "Opciones veggie"],
    },
    semana: semana({ 2: [F("Noche", "20:00", "00:00")], 3: [F("Noche", "20:00", "00:00")], 4: [F("Noche", "20:00", "00:00")], 5: [F("Noche", "20:00", "00:30")], 6: [F("Noche", "20:00", "00:30")], 0: [F("Noche", "20:00", "00:00")] }),
    salon: [{ zona: "Salón", mesas: [2, 2, 4, 4] }, { zona: "Barra", mesas: [2, 2, 2] }],
    modulos: { ...TODO, delivery: true },
    reservas: { ...RESERVAS_BASE, diasAnticipacion: 10, maxPersonas: 8, margenCierre: 75 },
    demoraLlevar: 35,
    delivery: { costo: 3000, minimo: 25000, zona: "Alberdi, Centro, Nueva Córdoba y Güemes", demora: 50 },
    cubierto: 0,
    categorias: [
      { id: "combinados", nombre: "Combinados" },
      { id: "rolls", nombre: "Rolls", nota: "8 piezas." },
      { id: "nigiri", nombre: "Nigiri y sashimi" },
      { id: "calientes", nombre: "Calientes" },
      { id: "postres", nombre: "Postres" },
      { id: "bebidas", nombre: "Bebidas" },
    ],
    carta: [
      ["combinados", "Combinado 15 piezas", "Rolls, nigiris y sashimi de salmón.", 21500, { destacado: true }],
      ["combinados", "Combinado 30 piezas", "Para compartir entre dos.", 39800, { porcion: "Para 2", destacado: true }],
      ["combinados", "Combinado veggie 20 piezas", "Palta, pepino, mango y queso.", 22800, { etiquetas: ["vegetariano"] }],
      ["rolls", "Philadelphia", "Salmón, queso crema y palta.", 13900],
      ["rolls", "New York", "Langostino, palta y queso crema.", 14500],
      ["rolls", "Spicy tuna", "Atún, mayonesa picante y verdeo.", 15200, { etiquetas: ["picante"] }],
      ["rolls", "Ebi tempura", "Langostino tempura, palta y salsa teriyaki.", 15800, { destacado: true }],
      ["rolls", "Veggie palta y mango", "", 11800, { etiquetas: ["vegano"] }],
      ["nigiri", "Nigiri de salmón", "Dos piezas.", 6200, { etiquetas: ["sintacc"] }],
      ["nigiri", "Sashimi de salmón", "Seis cortes.", 12500, { etiquetas: ["sintacc"] }],
      ["calientes", "Gyozas de cerdo", "Seis, a la plancha.", 9500],
      ["calientes", "Langostinos tempura", "Con salsa agridulce.", 14800],
      ["calientes", "Yakimeshi", "Arroz salteado con vegetales y huevo.", 10500, { etiquetas: ["vegetariano"] }],
      ["postres", "Mochi", "Dos, de té verde y maracuyá.", 6800, { etiquetas: ["sintacc"] }],
      ["postres", "Tempura de banana", "Con helado de vainilla.", 7200],
      ["bebidas", "Té verde frío", "Hecho acá.", 3800, { etiquetas: ["vegano", "sintacc"] }],
      ["bebidas", "Cerveza japonesa", "Lata 350 cc.", 6500],
      ["bebidas", "Agua con o sin gas", "", 3000],
    ],
  },

  hamburguesas: {
    id: "hamburguesas",
    nombre: "Hamburguesería",
    resumen: "Smash burgers, papas y delivery",
    ejemplo: "Doble Queso",
    bajada: "Smash burgers",
    direccion: "27 de Abril 950, Alberdi",
    instagram: "doblequeso.burgers",
    diseno: "moderno",
    acento: "#c2410c",
    textos: {
      titulo: "Aplastada en la plancha.",
      subtitulo: "Doble queso, siempre.",
      historia: "Carne picada todos los días, bollo de papa horneado acá y cheddar en serio. Hacemos pocas hamburguesas y las hacemos bien.",
      datos: ["Carne picada en el día", "Bollo de papa casero", "Opción veggie"],
    },
    semana: semana({ 2: [F("Noche", "19:30", "00:30")], 3: [F("Noche", "19:30", "00:30")], 4: [F("Noche", "19:30", "00:30")], 5: [F("Noche", "19:30", "01:30")], 6: [F("Mediodía", "12:00", "15:30"), F("Noche", "19:30", "01:30")], 0: [F("Mediodía", "12:00", "15:30"), F("Noche", "19:30", "00:30")] }),
    salon: [{ zona: "Salón", mesas: [2, 2, 4, 4] }, { zona: "Vereda", mesas: [4, 6] }],
    modulos: { ...TODO, reservas: false, delivery: true },
    reservas: RESERVAS_BASE,
    demoraLlevar: 20,
    delivery: { costo: 2500, minimo: 12000, zona: "Hasta 4 km del local", demora: 40 },
    cubierto: 0,
    categorias: [
      { id: "burgers", nombre: "Burgers", nota: "Todas con papas fritas. Pan sin TACC: +$ 1.500." },
      { id: "papas", nombre: "Papas" },
      { id: "combos", nombre: "Combos" },
      { id: "postres", nombre: "Postres" },
      { id: "bebidas", nombre: "Bebidas" },
    ],
    carta: [
      ["burgers", "Clásica", "Medallón smash, cheddar, lechuga, tomate y salsa de la casa.", 11500],
      ["burgers", "Doble Queso", "Doble medallón, doble cheddar, cebolla y pepinos.", 14500, { destacado: true }],
      ["burgers", "Triple smash", "Tres medallones, triple cheddar y panceta.", 17800],
      ["burgers", "Bacon BBQ", "Doble, panceta crocante, cebolla crispy y barbacoa.", 15800, { destacado: true }],
      ["burgers", "Jalapeño", "Doble, cheddar, jalapeños y mayo picante.", 15200, { etiquetas: ["picante"] }],
      ["burgers", "Veggie de lentejas", "Medallón de lentejas y remolacha, palta y rúcula.", 12800, { etiquetas: ["vegano"] }],
      ["papas", "Papas fritas", "", 5200, { etiquetas: ["vegano", "sintacc"] }],
      ["papas", "Papas cheddar y bacon", "", 8200],
      ["papas", "Bastones de batata", "Con alioli.", 6200, { etiquetas: ["vegetariano", "sintacc"] }],
      ["combos", "Combo Doble Queso", "Doble Queso, papas y gaseosa.", 17500, { destacado: true }],
      ["combos", "Combo para dos", "Dos dobles, papas grandes y dos gaseosas.", 32000, { porcion: "Para 2" }],
      ["postres", "Brownie con helado", "", 6500, { etiquetas: ["vegetariano"] }],
      ["postres", "Milkshake", "Vainilla, chocolate o dulce de leche.", 6200, { etiquetas: ["vegetariano", "sintacc"] }],
      ["bebidas", "Gaseosa 500 cc", "", 2800],
      ["bebidas", "Cerveza artesanal pinta", "", 5200, { llevar: false }],
      ["bebidas", "Limonada", "Con menta y jengibre.", 3900, { etiquetas: ["vegano", "sintacc"] }],
    ],
  },

  rotiseria: {
    id: "rotiseria",
    nombre: "Rotisería o comida para llevar",
    resumen: "Menú del día, para retirar o con envío. Sin salón",
    ejemplo: "Lo de Coca",
    bajada: "Rotisería · Comida casera",
    direccion: "Av. Patria 820, General Paz",
    instagram: "lodecoca.roti",
    diseno: "pizarra",
    acento: "",
    textos: {
      titulo: "Comida de casa,",
      subtitulo: "sin lavar los platos.",
      historia: "Cocinamos todos los días como para la familia: milanesas, pollo al spiedo y el plato del día. Pedí por acá, pasá a buscar o te lo llevamos.",
      datos: ["Menú del día", "Envíos en el barrio", "Pagá como quieras"],
    },
    semana: semana({ 1: [F("Mediodía", "11:30", "14:30"), F("Noche", "19:30", "22:30")], 2: [F("Mediodía", "11:30", "14:30"), F("Noche", "19:30", "22:30")], 3: [F("Mediodía", "11:30", "14:30"), F("Noche", "19:30", "22:30")], 4: [F("Mediodía", "11:30", "14:30"), F("Noche", "19:30", "22:30")], 5: [F("Mediodía", "11:30", "14:30"), F("Noche", "19:30", "22:30")], 6: [F("Mediodía", "11:30", "14:30"), F("Noche", "19:30", "22:30")], 0: [F("Mediodía", "11:30", "14:30")] }),
    salon: [],
    modulos: { salon: false, ocupacionWeb: false, reservas: false, llevar: true, delivery: true, caja: true, tienda: false },
    reservas: RESERVAS_BASE,
    demoraLlevar: 20,
    delivery: { costo: 2000, minimo: 10000, zona: "General Paz, Juniors y Pueyrredón", demora: 40 },
    cubierto: 0,
    categorias: [
      { id: "dia", nombre: "Hoy en el pizarrón", nota: "Cambia todos los días." },
      { id: "minutas", nombre: "Minutas" },
      { id: "spiedo", nombre: "Al spiedo" },
      { id: "empanadas", nombre: "Empanadas" },
      { id: "guarniciones", nombre: "Guarniciones" },
      { id: "postres", nombre: "Postres" },
    ],
    carta: [
      ["dia", "Pastel de papas", "Con carne cortada a cuchillo.", 9800, { destacado: true, etiquetas: ["sintacc"] }],
      ["dia", "Canelones de verdura", "Con salsa blanca y tuco.", 9500, { etiquetas: ["vegetariano"] }],
      ["dia", "Guiso de lentejas", "Con chorizo colorado.", 8500, { porcion: "Abundante" }],
      ["minutas", "Milanesa de carne con puré", "", 10500, { destacado: true }],
      ["minutas", "Milanesa de pollo con fritas", "", 9800],
      ["minutas", "Suprema napolitana", "Con papas fritas.", 12500],
      ["spiedo", "Pollo al spiedo entero", "Con papas.", 16500, { porcion: "Entero", destacado: true, etiquetas: ["sintacc"] }],
      ["spiedo", "Medio pollo al spiedo", "Con papas.", 9200, { porcion: "Medio", etiquetas: ["sintacc"] }],
      ["empanadas", "Empanadas de carne", "La docena.", 15500, { porcion: "Docena" }],
      ["empanadas", "Empanadas de pollo", "La docena.", 15000, { porcion: "Docena" }],
      ["empanadas", "Empanadas de verdura", "La docena.", 14500, { porcion: "Docena", etiquetas: ["vegetariano"] }],
      ["guarniciones", "Puré de papas", "", 3800, { etiquetas: ["vegetariano", "sintacc"] }],
      ["guarniciones", "Ensalada rusa", "", 4200, { etiquetas: ["vegetariano", "sintacc"] }],
      ["guarniciones", "Papas fritas", "", 4500, { etiquetas: ["vegano", "sintacc"] }],
      ["postres", "Flan casero", "", 3800, { etiquetas: ["sintacc"] }],
      ["postres", "Arroz con leche", "", 3500, { etiquetas: ["sintacc"] }],
    ],
  },
};

// ---------- Opciones, promos y envíos de cada tipo ----------
const g = (nombre: string, ...valores: (string | [string, number])[]): GrupoOpciones => ({
  nombre,
  valores: valores.map((v) => (typeof v === "string" ? { nombre: v, extra: 0 } : { nombre: v[0], extra: v[1] })),
});
const redondo = (n: number) => Math.round(n / 100) * 100;
const PUNTO = g("Punto", "Jugoso", "A punto", "Cocido");
const GUARNICION = g("Guarnición", "Papas fritas", "Puré", "Ensalada mixta");
const SALSA = g("Salsa", "Pomodoro", ["Bolognesa", 1500], ["Crema de hongos", 1800], "Manteca y salvia");
const HAPPY = { activa: true } as const;

const EXTRAS: Record<IdTipo, Extras> = {
  bodegon: {
    barra: ["bebidas"],
    opciones: {
      "Milanesa napolitana": () => [GUARNICION],
      "Bife de chorizo": () => [PUNTO],
      "Ñoquis": () => [SALSA],
      "Sorrentinos": () => [SALSA],
      "Tallarines": () => [SALSA],
    },
    dias: { "Locro de la casa": [0, 6] },
    promos: [{ nombre: "Menú del mediodía", dias: [2, 3, 4, 5], desde: "12:30", hasta: "15:30", porcentaje: 15, categorias: ["principales", "pastas"], ...HAPPY }],
    envios: [],
  },
  parrilla: {
    barra: ["vinos"],
    opciones: {
      "Bife de chorizo": () => [PUNTO],
      "Ojo de bife": () => [PUNTO],
      "Entraña": () => [PUNTO],
      "Vacío": () => [PUNTO],
      "Asado de tira": () => [PUNTO],
      "Copa de vino": () => [g("Vino", "Malbec", "Torrontés")],
    },
    dias: {},
    promos: [],
    envios: [],
  },
  pizzeria: {
    barra: ["bebidas"],
    opciones: {
      Muzzarella: (p) => [g("Tamaño", "Grande", ["Media", -redondo(p * 0.4)])],
      Napolitana: (p) => [g("Tamaño", "Grande", ["Media", -redondo(p * 0.4)])],
      "Fugazzeta": (p) => [g("Tamaño", "Grande", ["Media", -redondo(p * 0.4)])],
      "Cuatro quesos": (p) => [g("Tamaño", "Grande", ["Media", -redondo(p * 0.4)])],
      "Rúcula": (p) => [g("Tamaño", "Grande", ["Media", -redondo(p * 0.4)])],
      Calabresa: (p) => [g("Tamaño", "Grande", ["Media", -redondo(p * 0.4)])],
      "Sorrentinos": () => [SALSA],
      "Ñoquis": () => [SALSA],
      "Ravioles": () => [SALSA],
      "Helado artesanal": () => [g("Gustos", "Chocolate y dulce de leche", "Frutilla y limón", "Vainilla y sambayón")],
    },
    dias: {},
    promos: [{ nombre: "Martes y miércoles de pizza", dias: [2, 3], desde: "19:30", hasta: "00:00", porcentaje: 20, categorias: ["pizzas"], ...HAPPY }],
    envios: [
      { nombre: "Güemes", costo: 2000, minimo: 12000 },
      { nombre: "Nueva Córdoba", costo: 2500, minimo: 15000 },
      { nombre: "Centro", costo: 2500, minimo: 15000 },
      { nombre: "Observatorio", costo: 3000, minimo: 18000 },
    ],
  },
  cafe: {
    barra: ["cafe"],
    opciones: {
      Cortado: () => [g("Leche", "Entera", "Descremada", ["Avena", 600])],
      "Flat white": () => [g("Leche", "Entera", "Descremada", ["Avena", 600])],
      Latte: () => [g("Tamaño", "Chico", ["Grande", 900]), g("Leche", "Entera", "Descremada", ["Avena", 600])],
      "Café en grano": () => [g("Molienda", "En grano", "Para filtro", "Para espresso", "Para prensa francesa")],
      "Tostado": () => [g("Pan", "De miga", ["Sin TACC", 1200])],
    },
    dias: {},
    promos: [{ nombre: "Hora de la merienda", dias: [1, 2, 3, 4, 5], desde: "16:00", hasta: "19:00", porcentaje: 15, categorias: ["pasteleria"], ...HAPPY }],
    envios: [],
  },
  bar: {
    barra: ["tiradas", "tragos"],
    opciones: {
      IPA: (p) => [g("Medida", "Pinta", ["Media pinta", -redondo(p * 0.35)])],
      APA: (p) => [g("Medida", "Pinta", ["Media pinta", -redondo(p * 0.35)])],
      Honey: (p) => [g("Medida", "Pinta", ["Media pinta", -redondo(p * 0.35)])],
      Stout: (p) => [g("Medida", "Pinta", ["Media pinta", -redondo(p * 0.35)])],
      Golden: (p) => [g("Medida", "Pinta", ["Media pinta", -redondo(p * 0.35)])],
      "Gin tonic": () => [g("Gin", "Cordobés", ["Importado", 2500])],
      "Clásica": () => [PUNTO],
      "La de la casa": () => [PUNTO],
      "Recarga de growler": () => [g("Estilo", "IPA", "APA", "Honey", "Stout", "Golden")],
    },
    dias: {},
    promos: [{ nombre: "Happy hour", dias: [0, 3, 4, 5, 6], desde: "19:00", hasta: "21:00", porcentaje: 25, categorias: ["tiradas"], ...HAPPY }],
    envios: [],
  },
  sushi: {
    barra: ["bebidas"],
    opciones: {
      Combinado: () => [g("Salsa", "Soja", "Teriyaki", "Agridulce"), g("Palitos", "Sí", "No, gracias")],
      Philadelphia: () => [g("Arroz", "Blanco", ["Integral", 800])],
      "New York": () => [g("Arroz", "Blanco", ["Integral", 800])],
    },
    dias: {},
    promos: [{ nombre: "Happy sushi", dias: [2, 3, 4], desde: "20:00", hasta: "21:00", porcentaje: 20, categorias: ["rolls"], ...HAPPY }],
    envios: [
      { nombre: "Alberdi", costo: 2500, minimo: 20000 },
      { nombre: "Centro", costo: 3000, minimo: 25000 },
      { nombre: "Nueva Córdoba", costo: 3000, minimo: 25000 },
      { nombre: "Güemes", costo: 3500, minimo: 25000 },
    ],
  },
  hamburguesas: {
    barra: ["bebidas"],
    opciones: {
      "Clásica": () => [g("Punto", "Jugosa", "A punto"), g("Pan", "De papa", ["Sin TACC", 1500])],
      "Doble Queso": () => [g("Punto", "Jugosa", "A punto"), g("Extra", "Sin extra", ["Panceta", 1800], ["Huevo", 1200]), g("Pan", "De papa", ["Sin TACC", 1500])],
      "Triple smash": () => [g("Pan", "De papa", ["Sin TACC", 1500])],
      "Bacon BBQ": () => [g("Pan", "De papa", ["Sin TACC", 1500])],
      "Jalapeño": () => [g("Pan", "De papa", ["Sin TACC", 1500])],
      "Combo Doble Queso": () => [g("Bebida", "Coca-Cola", "Sprite", "Agua", ["Pinta artesanal", 2500])],
      Milkshake: () => [g("Sabor", "Vainilla", "Chocolate", "Dulce de leche")],
    },
    dias: {},
    promos: [{ nombre: "Martes de smash", dias: [2], desde: "19:30", hasta: "00:30", porcentaje: 30, categorias: ["burgers"], ...HAPPY }],
    envios: [
      { nombre: "Alberdi", costo: 2000, minimo: 10000 },
      { nombre: "Alto Alberdi", costo: 2500, minimo: 12000 },
      { nombre: "Centro", costo: 2500, minimo: 12000 },
      { nombre: "Marechal", costo: 3000, minimo: 15000 },
    ],
  },
  rotiseria: {
    barra: [],
    opciones: {
      "Milanesa de carne": () => [g("Guarnición", "Puré", "Papas fritas", "Ensalada")],
      "Milanesa de pollo": () => [g("Guarnición", "Papas fritas", "Puré", "Ensalada")],
      "Empanadas de carne": () => [g("Cocción", "Al horno", "Fritas")],
    },
    dias: { "Guiso de lentejas": [1, 3, 5], "Canelones": [2, 4, 6] },
    promos: [],
    envios: [
      { nombre: "General Paz", costo: 1500, minimo: 8000 },
      { nombre: "Juniors", costo: 2000, minimo: 10000 },
      { nombre: "Pueyrredón", costo: 2000, minimo: 10000 },
    ],
  },
};

export const TIPOS = Object.fromEntries(Object.entries(BASE).map(([id, b]) => [id, { ...b, ...EXTRAS[id as IdTipo] }])) as Record<IdTipo, TipoLocal>;

export const LISTA_TIPOS = Object.values(TIPOS);

export const esTipo = (x: unknown): x is IdTipo => typeof x === "string" && x in TIPOS;
