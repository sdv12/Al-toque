// Nueve diseños (el de chat quedó afuera: el chat del kit es Alto). El de la página de reservas cambia de ESTRUCTURA (no solo de color);
// el panel admin hereda las variables (fuente, radios, bordes, sombras, paleta).
export const DISENOS = [
  { id: 'base', nombre: 'Base', bajada: 'Pasos en tarjetas. Claro y directo.', muestra: ['#ffffff', '#2563eb', '#0f172a'] },
  { id: 'ticket', nombre: 'Ticket', bajada: 'Comprobante de papel, mono y troquelado.', muestra: ['#f4efe6', '#1c1c1c', '#d9480f'] },
  { id: 'bruto', nombre: 'Bruto', bajada: 'Bordes gruesos, sombras duras, todo grande.', muestra: ['#fff7d6', '#111111', '#ff5a36'] },
  { id: 'agenda', nombre: 'Agenda', bajada: 'Planilla semanal de papel, serif y calma.', muestra: ['#fbf8f1', '#3f5a4a', '#b5835a'] },
  { id: 'kiosco', nombre: 'Kiosco', bajada: 'Una pregunta por pantalla, oscuro y enorme.', muestra: ['#0d0d10', '#c6ff3d', '#f2f2f2'] },
  { id: 'mes', nombre: 'Mes', bajada: 'Calendario mensual en tres columnas, profesional.', muestra: ['#f7f7fb', '#6d28d9', '#1e1b2e'] },
  { id: 'historias', nombre: 'Historias', bajada: 'Pantallas tipo stories: tocás y avanzás.', muestra: ['#ff7a59', '#c026d3', '#ffffff'] },
  { id: 'reloj', nombre: 'Reloj', bajada: 'Elegís la hora sobre un reloj y el día en una rueda.', muestra: ['#f6f1e7', '#14324a', '#c9973f'] },
  { id: 'pila', nombre: 'Pila', bajada: 'Cada paso se apila como tarjeta de billetera.', muestra: ['#eef0f4', '#7c5cff', '#3dd6b0'] },
] as const satisfies readonly { id: string; nombre: string; bajada: string; muestra: readonly string[] }[];

export type IdDiseno = (typeof DISENOS)[number]["id"];
export const esDiseno = (x: unknown): x is IdDiseno => DISENOS.some((d) => d.id === x);
