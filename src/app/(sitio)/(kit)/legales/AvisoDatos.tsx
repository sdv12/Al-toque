import Link from "next/link";
import { LEYENDA_AAIP } from "./datos";

/**
 * Aviso donde se piden datos (Ley 25.326, art. 6, y Res. AAIP 14/2018: antes de recolectarlos y en
 * un lugar visible). `accion`: el texto del botón ("Enviar", "Pedir mi caja…").
 */
export function AvisoDatos({ accion = "Enviar", className = "" }: { accion?: string; className?: string }) {
  return (
    <div className={`text-mini text-tinta-suave ${className}`}>
      <p>
        Al tocar «{accion}» aceptás los{" "}
        <Link href="/terminos" className="underline">
          Términos y condiciones
        </Link>{" "}
        y la{" "}
        <Link href="/privacidad" className="underline">
          Política de privacidad
        </Link>
        . Usamos tus datos solo para responderte y armar tu pedido; podés pedir verlos, corregirlos o borrarlos cuando quieras.
      </p>
      <p className="mt-1 opacity-80">{LEYENDA_AAIP}</p>
    </div>
  );
}
