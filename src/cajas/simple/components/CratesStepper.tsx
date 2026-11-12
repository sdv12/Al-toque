import { formatHalves, formatAmount } from "@/cajas/simple/lib/stock";
import type { Product } from "@/cajas/simple/lib/types";

/** − 1½ + : cantidad de cajones, de a medio cajón. */
export default function CratesStepper({
  product,
  value,
  onChange,
  big = false,
}: {
  product: Pick<Product, "name" | "unit" | "crate">;
  value: number;
  onChange: (n: number) => void;
  big?: boolean;
}) {
  const btn = `${big ? "min-h-20 w-24 text-5xl" : "min-h-14 w-14 text-3xl"} shrink-0 rounded-2xl border-2 font-bold active:scale-95 disabled:opacity-30`;
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={value <= 0}
        onClick={() => onChange(Math.max(0, value - 0.5))}
        aria-label={`Medio cajón menos de ${product.name}`}
        className={`${btn} border-borde bg-white`}
      >
        −
      </button>
      <p className="min-w-[4.5rem] flex-1 text-center leading-tight" aria-live="polite">
        <span className={`block font-extrabold tabular-nums ${big ? "text-6xl" : "text-3xl"}`}>{formatHalves(value)}</span>
        <span className={big ? "text-xl text-gris" : "text-base text-gris"}>
          {value > 1 ? "cajones" : "cajón"}
          {product.crate && value > 0 ? ` · ${formatAmount(product.unit, value * product.crate)}` : ""}
        </span>
      </p>
      <button
        type="button"
        disabled={value >= 50}
        onClick={() => onChange(value + 0.5)}
        aria-label={`Medio cajón más de ${product.name}`}
        className={`${btn} border-acento bg-acento-claro text-acento-oscuro`}
      >
        +
      </button>
    </div>
  );
}
