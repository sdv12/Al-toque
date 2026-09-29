/**
 * Formato canónico de WhatsApp para Argentina: 549 + código de área + número (13 dígitos),
 * sin "+", sin 0 de larga distancia y sin 15. Es lo que usa wa.me.
 */
export const WHATSAPP_AR = /^549\d{10}$/;

/**
 * Normaliza lo que escribe una persona ("0351 15-555-1234", "+54 9 351 555 1234",
 * "351 5551234") al formato canónico. Devuelve null si no se puede interpretar sin adivinar.
 */
export function normalizarWhatsappAR(entrada: string): string | null {
  let digitos = entrada.replace(/\D/g, "");

  if (digitos.startsWith("549") && digitos.length === 13) return digitos;
  if (digitos.startsWith("54") && digitos.length === 12) return `549${digitos.slice(2)}`;
  if (digitos.startsWith("54")) digitos = digitos.slice(2);
  if (digitos.startsWith("9") && digitos.length === 11) digitos = digitos.slice(1);
  if (digitos.startsWith("0")) digitos = digitos.slice(1);

  if (digitos.length === 10) return `549${digitos}`;

  // Número nacional con 15 después del código de área (2 a 4 dígitos).
  if (digitos.length === 12) {
    const candidatos = [2, 3, 4]
      .filter((largoArea) => digitos.slice(largoArea, largoArea + 2) === "15")
      .map((largoArea) => digitos.slice(0, largoArea) + digitos.slice(largoArea + 2));
    if (candidatos.length === 1) return `549${candidatos[0]}`;
  }

  return null;
}
