/** Línea horizontal de 1 px entre secciones, centrada al 85 % del ancho, con el color de borde de la plantilla. */
export function Separador({ className = "" }: { className?: string }) {
  return <hr className={`mx-auto my-0 w-[85%] border-0 border-t border-borde ${className}`} />;
}
