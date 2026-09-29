/**
 * Utilidades de color para garantizar contraste AA (WCAG 2.x) con acentos elegidos por el cliente.
 * Trabaja solo con hex #rrggbb.
 */

export const AA_TEXTO = 4.5;
export const AA_TEXTO_GRANDE = 3;

type Rgb = readonly [number, number, number];

const HEX = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;

export function esHex(valor: string): boolean {
  return HEX.test(valor);
}

export function hexARgb(hex: string): Rgb {
  const m = HEX.exec(hex);
  if (!m) throw new Error(`Color inválido: ${hex}`);
  return [parseInt(m[1]!, 16), parseInt(m[2]!, 16), parseInt(m[3]!, 16)];
}

export function rgbAHex([r, g, b]: Rgb): string {
  const canal = (n: number) =>
    Math.round(Math.min(255, Math.max(0, n)))
      .toString(16)
      .padStart(2, "0");
  return `#${canal(r)}${canal(g)}${canal(b)}`;
}

function lineal(canal: number): number {
  const c = canal / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminancia(hex: string): number {
  const [r, g, b] = hexARgb(hex);
  return 0.2126 * lineal(r) + 0.7152 * lineal(g) + 0.0722 * lineal(b);
}

export function contraste(a: string, b: string): number {
  const la = luminancia(a);
  const lb = luminancia(b);
  const [claro, oscuro] = la > lb ? [la, lb] : [lb, la];
  return (claro + 0.05) / (oscuro + 0.05);
}

/** Mezcla lineal en sRGB: t = 0 devuelve `a`, t = 1 devuelve `b`. */
export function mezclar(a: string, b: string, t: number): string {
  const ra = hexARgb(a);
  const rb = hexARgb(b);
  return rgbAHex([
    ra[0] + (rb[0] - ra[0]) * t,
    ra[1] + (rb[1] - ra[1]) * t,
    ra[2] + (rb[2] - ra[2]) * t,
  ]);
}

/**
 * Devuelve una versión del color que alcanza `minimo` de contraste contra `fondo`,
 * acercándolo al negro (fondos claros) o al blanco (fondos oscuros) lo mínimo necesario.
 * Si ya cumple, lo devuelve tal cual.
 */
export function ajustarContraste(color: string, fondo: string, minimo = AA_TEXTO): string {
  if (contraste(color, fondo) >= minimo) return color.toLowerCase();
  const destino = luminancia(fondo) > 0.18 ? "#000000" : "#ffffff";
  for (let paso = 1; paso <= 40; paso++) {
    const candidato = mezclar(color, destino, paso / 40);
    if (contraste(candidato, fondo) >= minimo) return candidato;
  }
  return destino;
}

/** Elige, entre dos tintas, la que mejor se lee sobre `fondo`. */
export function mejorTinta(fondo: string, clara: string, oscura: string): string {
  return contraste(clara, fondo) >= contraste(oscura, fondo) ? clara : oscura;
}
