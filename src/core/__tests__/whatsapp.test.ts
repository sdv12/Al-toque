import { describe, expect, it } from "vitest";
import { normalizarWhatsappAR } from "../lib/whatsapp";

describe("normalizarWhatsappAR", () => {
  it.each([
    ["5493515551234", "5493515551234"],
    ["+54 9 351 555-1234", "5493515551234"],
    ["+54 351 555 1234", "5493515551234"],
    ["54 9 11 5555-1234", "5491155551234"],
    ["0351 15 555-1234", "5493515551234"],
    ["351 15 5551234", "5493515551234"],
    ["(0351) 555-1234", "5493515551234"],
    ["11 5555 1234", "5491155551234"],
    ["03543 15 42-1234", "5493543421234"],
    ["9 351 555 1234", "5493515551234"],
  ])("%s → %s", (entrada, esperado) => {
    expect(normalizarWhatsappAR(entrada)).toBe(esperado);
  });

  it.each(["", "555-1234", "hola", "351555123456789"])("no adivina con %j", (entrada) => {
    expect(normalizarWhatsappAR(entrada)).toBeNull();
  });
});
