import type { IdDiseno, IdTipografia } from "./tipos";

/**
 * Diseños de la web pública. Cada uno cambia estructura (encabezado, cómo se lee la carta, cómo se
 * reserva), tipografías y paleta; no es solo un cambio de color. El panel hereda la paleta.
 */
export const DISENOS: { id: IdDiseno; nombre: string; bajada: string; oscuro: boolean; acento: string }[] = [
  { id: "imprenta", nombre: "Imprenta", bajada: "Carta de bodegón antiguo: tinta sobre papel, filetes y platos numerados", oscuro: false, acento: "#8e1d14" },
  { id: "pizarra", nombre: "Pizarra", bajada: "El pizarrón de la casa escrito a tiza, sobre marco de madera", oscuro: true, acento: "#f3d470" },
  { id: "trattoria", nombre: "Trattoria", bajada: "Mantel a cuadros, serif italiana y la carta en dos columnas", oscuro: false, acento: "#b3261e" },
  { id: "cafe", nombre: "Café", bajada: "Tonos crema, letra redonda y la carta en tarjetas, como una barra de especialidad", oscuro: false, acento: "#6b4a2f" },
  { id: "nocturno", nombre: "Nocturno", bajada: "Fondo negro, letra condensada y acento de neón: para la noche", oscuro: true, acento: "#ff3d7f" },
  { id: "brasa", nombre: "Brasa", bajada: "Madera quemada y brasas: los cortes como protagonistas, con su peso y su punto", oscuro: true, acento: "#e8792b" },
  { id: "moderno", nombre: "Moderno", bajada: "Blanco, negro y un solo color: limpio y rápido de leer en el celular", oscuro: false, acento: "#e4002b" },
];

export const disenoDe = (id: IdDiseno) => DISENOS.find((d) => d.id === id) ?? DISENOS[0]!;

/** Colores para el acento propio (Ajustes → Diseño). Todos con buen contraste con texto blanco. */
export const ACENTOS = [
  { id: "", nombre: "El del diseño" },
  { id: "#8e1d14", nombre: "Bordó" },
  { id: "#b3261e", nombre: "Tomate" },
  { id: "#c2410c", nombre: "Naranja" },
  { id: "#a16207", nombre: "Mostaza" },
  { id: "#15803d", nombre: "Verde" },
  { id: "#0f766e", nombre: "Petróleo" },
  { id: "#1d4ed8", nombre: "Azul" },
  { id: "#6d28d9", nombre: "Violeta" },
  { id: "#be185d", nombre: "Fucsia" },
];

/** Tipografías para cambiar la del diseño (Ajustes → Web → Diseño). */
export const TIPOGRAFIAS: { id: IdTipografia; nombre: string; disp: string; texto: string; ui: string }[] = [
  { id: "clasica", nombre: "Clásica", disp: "'Playfair Display', Georgia, serif", texto: "'Libre Franklin', system-ui, sans-serif", ui: "'Libre Franklin', system-ui, sans-serif" },
  { id: "moderna", nombre: "Moderna", disp: "'Inter Tight', system-ui, sans-serif", texto: "'Inter Tight', system-ui, sans-serif", ui: "'Inter Tight', system-ui, sans-serif" },
  { id: "redonda", nombre: "Redonda", disp: "'Fraunces', Georgia, serif", texto: "'DM Sans', system-ui, sans-serif", ui: "'DM Sans', system-ui, sans-serif" },
  { id: "condensada", nombre: "Condensada", disp: "'Bebas Neue', 'Arial Narrow', sans-serif", texto: "'Space Grotesk', system-ui, sans-serif", ui: "'Space Grotesk', system-ui, sans-serif" },
  { id: "slab", nombre: "Con serifa gruesa", disp: "'Alfa Slab One', Georgia, serif", texto: "'Bitter', Georgia, serif", ui: "'Karla', system-ui, sans-serif" },
  { id: "maquina", nombre: "Máquina de escribir", disp: "'Abril Fatface', Georgia, serif", texto: "'IBM Plex Mono', monospace", ui: "'Karla', system-ui, sans-serif" },
];
