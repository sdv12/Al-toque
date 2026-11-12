/** Sin tildes ni mayúsculas: "limon" encuentra "Limón". */
export function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export function matches(name: string, query: string): boolean {
  const q = normalize(query);
  return q === "" || normalize(name).includes(q);
}

/** "  marta   gómez " → "Marta gómez" (sin espacios de más, primera en mayúscula). */
export function cleanName(text: string): string {
  const t = text.trim().replace(/\s+/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
}
