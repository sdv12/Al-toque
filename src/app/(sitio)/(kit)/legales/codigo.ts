/** Código de identificación de una solicitud de arrepentimiento o de baja (Res. SCI 424/2020). */
export function codigoSolicitud(tipo: "arrepentimiento" | "baja", ahora = Date.now()): string {
  const azar = Math.floor(Math.random() * 36 ** 3).toString(36).padStart(3, "0");
  return `${tipo === "arrepentimiento" ? "ARR" : "BAJ"}-${ahora.toString(36).toUpperCase()}-${azar.toUpperCase()}`;
}
