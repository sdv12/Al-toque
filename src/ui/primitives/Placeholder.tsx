type Props = {
  /** Qué foto va acá, para quien la tenga que cargar (y para lectores de pantalla). */
  descripcion: string;
  /** Relación de aspecto CSS, ej. "4 / 5". */
  aspecto?: string;
  className?: string;
};

/**
 * Placeholder honesto hasta que el cliente cargue su foto: bloque con la trama propia de la
 * plantilla (--lk-placeholder-trama) y la etiqueta "Tu foto acá". No simula una foto.
 */
export function Placeholder({ descripcion, aspecto = "4 / 3", className }: Props) {
  return (
    <div
      role="img"
      aria-label={`Foto pendiente: ${descripcion}`}
      className={`relative grid place-items-center overflow-hidden rounded-base ${className ?? ""}`}
      style={{
        aspectRatio: aspecto,
        background: "var(--lk-placeholder-trama), var(--lk-placeholder-fondo)",
      }}
    >
      <span aria-hidden className="px-3 text-center text-mini text-tinta-suave">
        <span className="block font-medium text-tinta">Tu foto acá</span>
        {descripcion}
      </span>
    </div>
  );
}
