"use client";

import { useEffect, useRef } from "react";

// Teclado numérico grande. Se usa para precios (y después para kilos y "¿con cuánto paga?").
// También acepta el teclado físico en tablets con teclado.

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "⌫"] as const;

export default function NumPad({
  value,
  onChange,
  maxDecimals = 2,
  maxIntDigits = 9,
  compact = false,
}: {
  value: string;
  onChange: (next: string) => void;
  maxDecimals?: number;
  maxIntDigits?: number;
  /** Teclas un poco más bajas (igual ≥ 56px) cuando hay más cosas en la ventana. */
  compact?: boolean;
}) {
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  });

  function press(key: string) {
    const v = valueRef.current;
    if (key === "⌫") return onChange(v.slice(0, -1));
    if (key === ",") {
      if (maxDecimals === 0 || v.includes(",")) return;
      return onChange(v === "" ? "0," : `${v},`);
    }
    const [int = "", dec] = v.split(",");
    if (dec !== undefined) {
      if (dec.length >= maxDecimals) return;
    } else {
      if (int.length >= maxIntDigits) return;
      if (int === "0") return onChange(key); // no "05"
    }
    onChange(v + key);
  }

  const pressRef = useRef(press);
  useEffect(() => {
    pressRef.current = press;
  });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (/^[0-9]$/.test(e.key)) pressRef.current(e.key);
      else if (e.key === "," || e.key === ".") pressRef.current(",");
      else if (e.key === "Backspace") pressRef.current("⌫");
      else return;
      e.preventDefault();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={`grid grid-cols-3 ${compact ? "gap-2" : "gap-3"}`}>
      {KEYS.map((k) => {
        const disabled = k === "," && maxDecimals === 0;
        return (
          <button
            key={k}
            type="button"
            disabled={disabled}
            onClick={() => press(k)}
            aria-label={k === "⌫" ? "Borrar el último número" : k === "," ? "Coma" : k}
            className={`${compact ? "min-h-14" : "min-h-16"} rounded-2xl border-2 text-3xl font-bold active:scale-95 disabled:opacity-0 ${
              k === "⌫" ? "border-rojo bg-rojo-claro text-rojo text-xl" : "border-borde bg-white"
            }`}
          >
            {k === "⌫" ? "⌫ Borrar" : k}
          </button>
        );
      })}
    </div>
  );
}
