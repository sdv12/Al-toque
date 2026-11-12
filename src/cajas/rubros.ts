import type { Unit } from "./simple/lib/types";

/**
 * Rubros de la caja simple. Cada uno trae sus productos de arranque (precios de referencia de
 * nov 2026, el dueño los ajusta el primer día desde "Precios") y los dibujos para elegir.
 *
 * Fila: [nombre, emoji, unidad, precio en pesos, cajón]. "Cajón" es lo que trae el cajón, la
 * bolsa o el bulto: kilos si se vende por kilo, unidades o atados si no. Solo lo usa el módulo
 * de cajones y mercado.
 */
export type FilaProducto = readonly [nombre: string, emoji: string, unidad: Unit, pesos: number, cajon: number];

export const RUBROS_CAJA = ["verduleria", "almacen", "kiosco", "dietetica"] as const;
export type RubroCaja = (typeof RUBROS_CAJA)[number];

export interface DefRubro {
  nombre: string;
  emoji: string;
  bajada: string;
  /** Nombre de ejemplo para el negocio. */
  ejemplo: string;
  /** Si el rubro puede usar "Cajones y mercado" (por ahora, el que compra por cajón). */
  cajones: boolean;
  productos: readonly FilaProducto[];
  emojis: readonly string[];
}

const VERDULERIA: FilaProducto[] = [
  ["Papa", "🥔", "kg", 1200, 25],
  ["Cebolla", "🧅", "kg", 1300, 20],
  ["Tomate", "🍅", "kg", 2500, 18],
  ["Lechuga", "🥬", "kg", 2800, 10],
  ["Zanahoria", "🥕", "kg", 1200, 20],
  ["Zapallo", "🎃", "kg", 1000, 20],
  ["Zapallito", "🥒", "kg", 2000, 18],
  ["Batata", "🍠", "kg", 1500, 20],
  ["Morrón", "🫑", "kg", 4500, 10],
  ["Pepino", "🥒", "kg", 2200, 15],
  ["Berenjena", "🍆", "kg", 2500, 15],
  ["Banana", "🍌", "kg", 2200, 20],
  ["Manzana", "🍎", "kg", 2600, 18],
  ["Naranja", "🍊", "kg", 1500, 20],
  ["Mandarina", "🍊", "kg", 1600, 20],
  ["Limón", "🍋", "kg", 1800, 18],
  ["Pera", "🍐", "kg", 2600, 18],
  ["Uva", "🍇", "kg", 5500, 8],
  ["Frutilla", "🍓", "kg", 6000, 5],
  ["Durazno", "🍑", "kg", 3500, 10],
  ["Kiwi", "🥝", "kg", 5000, 10],
  ["Palta", "🥑", "unidad", 1500, 40],
  ["Ajo", "🧄", "unidad", 500, 50],
  ["Brócoli", "🥦", "unidad", 2000, 12],
  ["Choclo", "🌽", "unidad", 800, 50],
  ["Ananá", "🍍", "unidad", 3500, 8],
  ["Acelga", "🥬", "atado", 1500, 12],
  ["Espinaca", "🥬", "atado", 1800, 12],
  ["Perejil", "🌿", "atado", 800, 20],
  ["Cebolla de verdeo", "🌱", "atado", 900, 20],
];

const ALMACEN: FilaProducto[] = [
  ["Leche 1 L", "🥛", "unidad", 1500, 12],
  ["Pan lactal", "🍞", "unidad", 2800, 10],
  ["Yerba 1 kg", "🧉", "unidad", 5500, 10],
  ["Azúcar 1 kg", "🍬", "unidad", 1300, 10],
  ["Fideos 500 g", "🍝", "unidad", 1200, 20],
  ["Arroz 1 kg", "🍚", "unidad", 1600, 10],
  ["Aceite 900 ml", "🫒", "unidad", 3200, 12],
  ["Harina 1 kg", "🌾", "unidad", 1000, 10],
  ["Huevos (maple)", "🥚", "unidad", 5500, 6],
  ["Galletitas", "🍪", "unidad", 1500, 20],
  ["Gaseosa 2,25 L", "🥤", "unidad", 3200, 6],
  ["Agua 2 L", "💧", "unidad", 1400, 6],
  ["Vino", "🍷", "unidad", 4500, 6],
  ["Café 250 g", "☕", "unidad", 6000, 10],
  ["Dulce de leche", "🍯", "unidad", 2800, 12],
  ["Puré de tomate", "🥫", "unidad", 900, 24],
  ["Atún", "🐟", "unidad", 2500, 24],
  ["Jabón en polvo", "🧼", "unidad", 4500, 10],
  ["Lavandina", "🧴", "unidad", 1300, 12],
  ["Papel higiénico x4", "🧻", "unidad", 3800, 12],
  ["Queso cremoso", "🧀", "kg", 9500, 4],
  ["Jamón cocido", "🍖", "kg", 14000, 4],
  ["Salame", "🥓", "kg", 16000, 3],
  ["Pan", "🥖", "kg", 2500, 10],
];

const KIOSCO: FilaProducto[] = [
  ["Alfajor", "🍫", "unidad", 1000, 24],
  ["Chocolate", "🍫", "unidad", 2200, 20],
  ["Turrón", "🍬", "unidad", 400, 50],
  ["Caramelo", "🍬", "unidad", 100, 100],
  ["Chicles", "🍬", "unidad", 600, 20],
  ["Galletitas", "🍪", "unidad", 1500, 20],
  ["Papas fritas", "🍟", "unidad", 2500, 12],
  ["Barrita de cereal", "🌾", "unidad", 900, 20],
  ["Gaseosa 500 ml", "🥤", "unidad", 1500, 6],
  ["Agua 500 ml", "💧", "unidad", 900, 12],
  ["Jugo", "🧃", "unidad", 1200, 12],
  ["Energizante", "⚡", "unidad", 2500, 6],
  ["Helado palito", "🍦", "unidad", 1500, 20],
  ["Café para llevar", "☕", "unidad", 1500, 50],
  ["Medialuna", "🥐", "unidad", 600, 12],
  ["Sándwich de miga", "🥪", "unidad", 900, 12],
  ["Encendedor", "🔥", "unidad", 1000, 50],
  ["Pilas AA x2", "🔋", "unidad", 1500, 20],
  ["Pañuelitos", "🧻", "unidad", 600, 24],
];

const DIETETICA: FilaProducto[] = [
  ["Almendras", "🌰", "kg", 18000, 5],
  ["Nueces", "🌰", "kg", 16000, 5],
  ["Maní", "🥜", "kg", 5000, 5],
  ["Mix frutos secos", "🥜", "kg", 15000, 5],
  ["Pasas de uva", "🍇", "kg", 7000, 5],
  ["Dátiles", "🌴", "kg", 9000, 5],
  ["Coco rallado", "🥥", "kg", 8000, 5],
  ["Avena", "🌾", "kg", 2500, 25],
  ["Granola", "🥣", "kg", 6000, 5],
  ["Semillas de chía", "🌱", "kg", 7000, 5],
  ["Semillas de lino", "🌱", "kg", 3500, 5],
  ["Semillas de girasol", "🌻", "kg", 5000, 5],
  ["Harina integral", "🌾", "kg", 1800, 25],
  ["Arroz integral", "🍚", "kg", 2500, 25],
  ["Lentejas", "🫘", "kg", 3500, 25],
  ["Garbanzos", "🫘", "kg", 4000, 25],
  ["Porotos", "🫘", "kg", 3500, 25],
  ["Azúcar mascabo", "🍯", "kg", 4000, 25],
  ["Miel", "🍯", "unidad", 6000, 12],
  ["Yerba orgánica", "🧉", "unidad", 7500, 10],
  ["Té en hebras", "🍵", "unidad", 3500, 10],
  ["Leche de almendras", "🥛", "unidad", 3500, 12],
];

/** Dibujos generales que se suman a los del rubro (para productos que no estaban en la lista). */
const GENERALES = ["🛒", "📦", "🏷️", "⭐", "🎁", "🧺", "🛍️", "🧾"];

function emojisDe(filas: readonly FilaProducto[], extra: readonly string[]): string[] {
  return [...new Set([...filas.map((f) => f[1]), ...extra, ...GENERALES])];
}

export const RUBROS: Record<RubroCaja, DefRubro> = {
  verduleria: {
    nombre: "Verdulería",
    emoji: "🥬",
    bajada: "Por kilo, por unidad o por atado. Con cajones y lista para el mercado.",
    ejemplo: "Verdulería Don Pepe",
    cajones: true,
    productos: VERDULERIA,
    emojis: emojisDe(VERDULERIA, ["🌶️", "🫚", "🫛", "🍄", "🍏", "🍒", "🍉", "🍈", "🥭", "🫐", "🥥", "🥚"]),
  },
  almacen: {
    nombre: "Almacén",
    emoji: "🧃",
    bajada: "Productos por unidad y fiambres o pan por kilo.",
    ejemplo: "Almacén La Esquina",
    cajones: false,
    productos: ALMACEN,
    emojis: emojisDe(ALMACEN, ["🧈", "🥫", "🧂", "🍫", "🧃", "🍺", "🥩", "🍗", "🧽"]),
  },
  kiosco: {
    nombre: "Kiosco",
    emoji: "🍫",
    bajada: "Golosinas, bebidas y algo para el paso, todo por unidad.",
    ejemplo: "Kiosco El Paso",
    cajones: false,
    productos: KIOSCO,
    emojis: emojisDe(KIOSCO, ["🍭", "🧁", "🍩", "🥨", "🍿", "🧉", "🎈", "✏️"]),
  },
  dietetica: {
    nombre: "Dietética",
    emoji: "🥜",
    bajada: "Frutos secos, semillas y legumbres sueltos, por kilo.",
    ejemplo: "Dietética Grano a Grano",
    cajones: false,
    productos: DIETETICA,
    emojis: emojisDe(DIETETICA, ["🍫", "🍪", "🧂", "🫚", "🌿", "🥣"]),
  },
};
