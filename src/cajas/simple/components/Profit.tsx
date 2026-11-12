import { formatMoney } from "@/cajas/simple/lib/format";

/** "Te queda $ 400 (33%)" — en rojo si se vende a pérdida. */
export default function Profit({ price, cost, short = false }: { price: number; cost: number; short?: boolean }) {
  const diff = price - cost;
  const pct = cost > 0 ? Math.round((diff / cost) * 100) : null;
  const loss = diff < 0;
  return (
    <p className={`${short ? "text-base" : "text-lg"} font-bold ${loss ? "text-rojo" : "text-acento"}`}>
      {loss ? "⚠ Perdés " : short ? "Ganás " : "Te queda de ganancia: "}
      {formatMoney(Math.abs(diff))}
      {pct !== null && ` (${Math.abs(pct)}%)`}
    </p>
  );
}
