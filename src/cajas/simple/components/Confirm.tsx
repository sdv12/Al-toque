"use client";

import { useCloseOnBack } from "@/cajas/simple/lib/back-button";

/** "¿Seguro que querés...?" con dos botones grandes: No / Sí. */
export default function Confirm({
  question,
  detail,
  yesLabel,
  danger = true,
  onYes,
  onNo,
}: {
  question: string;
  detail?: string;
  yesLabel: string;
  danger?: boolean;
  onYes: () => void;
  onNo: () => void;
}) {
  useCloseOnBack(onNo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="presentation">
      <div role="alertdialog" aria-modal="true" aria-label={question} className="w-full max-w-md rounded-3xl bg-papel p-5 shadow-2xl">
        <p className="text-2xl font-bold leading-snug">{question}</p>
        {detail && <p className="mt-2 text-lg text-gris">{detail}</p>}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button type="button" onClick={onNo} className="min-h-16 rounded-2xl border-2 border-borde text-xl font-bold">
            No
          </button>
          <button
            type="button"
            onClick={onYes}
            className={`min-h-16 rounded-2xl text-xl font-bold text-white ${danger ? "bg-rojo" : "bg-acento"}`}
          >
            {yesLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
