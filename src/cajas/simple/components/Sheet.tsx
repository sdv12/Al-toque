"use client";

import { useEffect, type ReactNode } from "react";
import { useCloseOnBack } from "@/cajas/simple/lib/back-button";

// Ventana que sube desde abajo y ocupa casi toda la pantalla.
// No usa <dialog> para que el mensaje de "Deshacer" siempre se pueda tocar.

export default function Sheet({
  title,
  onClose,
  children,
  footer,
  closeLabel = "✕ Cerrar",
}: {
  title: string;
  /** Texto del botón de arriba (ej. "✕ Cancelar" donde "Cerrar" se presta a confusión). */
  closeLabel?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useCloseOnBack(onClose);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 sm:items-center" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[98dvh] w-full max-w-xl flex-col rounded-t-3xl bg-papel shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between gap-3 border-b-2 border-borde/40 px-4 py-2">
          <h2 className="min-w-0 text-2xl font-bold leading-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-14 shrink-0 rounded-2xl border-2 border-borde px-4 text-lg font-bold"
          >
            {closeLabel}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">{children}</div>
        {footer && <div className="border-t-2 border-borde/40 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">{footer}</div>}
      </div>
    </div>
  );
}
