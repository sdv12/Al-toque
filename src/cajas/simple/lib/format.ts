// Formato argentino: $ 1.250,50 y 1,5 kg.
// La plata se guarda en centavos (enteros) para no tener errores de redondeo.

function withThousands(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** 125050 → "$ 1.250,50"; 120000 → "$ 1.200" (sin ",00" para que se lea más fácil). */
export function formatMoney(cents: number): string {
  const negative = cents < 0;
  const abs = Math.abs(Math.round(cents));
  const pesos = Math.floor(abs / 100);
  const rest = abs % 100;
  const text = rest === 0 ? withThousands(pesos) : `${withThousands(pesos)},${String(rest).padStart(2, "0")}`;
  // Espacio que no se corta: el "$" nunca queda solo al final de un renglón.
  return `${negative ? "−" : ""}$\u00a0${text}`;
}

/** 1500 gramos → "1,5 kg"; 250 → "0,25 kg"; 2000 → "2 kg". */
export function formatKg(grams: number): string {
  const kg = Math.round(grams) / 1000;
  return `${String(kg).replace(".", ",")}\u00a0kg`;
}

/**
 * Lo que se va tipeando en el teclado ("1250,5") → centavos (125050).
 * Devuelve null si está vacío o no es un número.
 */
export function parseMoney(text: string): number | null {
  const clean = text.trim().replace(/\./g, "").replace(",", ".");
  if (clean === "" || clean === ".") return null;
  const n = Number(clean);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

/** Muestra lo tipeado con puntos de miles mientras se escribe: "1250,5" → "1.250,5". */
export function formatTyping(text: string): string {
  const [int, dec] = text.split(",");
  const intPart = int === "" ? "0" : withThousands(Number(int));
  return dec === undefined ? intPart : `${intPart},${dec}`;
}

/** Centavos → texto para el teclado (125050 → "1250,5"). */
export function moneyToTyping(cents: number): string {
  const pesos = Math.floor(cents / 100);
  const rest = cents % 100;
  if (rest === 0) return String(pesos);
  return `${pesos},${String(rest).padStart(2, "0").replace(/0$/, "")}`;
}
