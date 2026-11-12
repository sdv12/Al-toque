"use client";

import { useMemo, useState } from "react";
import CustomerForm from "@/cajas/simple/components/CustomerForm";
import CustomerSheet from "@/cajas/simple/components/CustomerSheet";
import SearchBox, { matches } from "@/cajas/simple/components/SearchBox";
import { useToast } from "@/cajas/simple/components/Toast";
import { debts } from "@/cajas/simple/lib/fiado";
import { formatMoney } from "@/cajas/simple/lib/format";
import { saveCustomer, useStore } from "@/cajas/simple/lib/store";

export default function FiadoScreen() {
  const { customers, sales, moves } = useStore();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const owed = useMemo(() => debts(sales, moves), [sales, moves]);
  const active = customers.filter((c) => !c.deleted);
  const list = active
    .filter((c) => matches(c.name, query))
    .sort(
      (a, b) =>
        (owed.get(b.id) ?? 0) - (owed.get(a.id) ?? 0) || a.name.localeCompare(b.name, "es", { sensitivity: "base" }),
    );
  const totalOwed = active.reduce((sum, c) => sum + Math.max(0, owed.get(c.id) ?? 0), 0);
  const opened = active.find((c) => c.id === openId);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border-2 border-borde/60 bg-white px-4 py-3">
        <p className="text-xl font-bold">Te deben en total</p>
        <p className="text-4xl font-extrabold tabular-nums">{formatMoney(totalOwed)}</p>
      </div>

      <button
        type="button"
        onClick={() => setCreating(true)}
        className="min-h-16 rounded-2xl border-2 border-dashed border-acento bg-acento-claro text-xl font-bold text-acento-oscuro"
      >
        ➕ Cliente nuevo
      </button>

      {active.length > 5 && <SearchBox value={query} onChange={setQuery} placeholder="Buscar cliente" />}

      {active.length === 0 && (
        <p className="rounded-2xl bg-amarillo-claro p-4 text-xl">
          Todavía no hay nadie en el fiado. Se agregan al cobrar con &quot;Fiado&quot;, o acá con &quot;Cliente nuevo&quot; para pasar los del
          cuaderno.
        </p>
      )}
      {active.length > 0 && list.length === 0 && (
        <p className="rounded-2xl bg-amarillo-claro p-4 text-xl">No hay ningún cliente que se llame &quot;{query}&quot;.</p>
      )}

      <ul className="grid gap-3 md:grid-cols-2">
        {list.map((c) => {
          const debt = owed.get(c.id) ?? 0;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setOpenId(c.id)}
                className="flex min-h-20 w-full items-center justify-between gap-3 rounded-2xl border-2 border-borde/60 bg-white px-4 py-2 text-left active:bg-acento-claro"
              >
                <span className="min-w-0">
                  <span className="block text-xl font-bold leading-tight">👤 {c.name}</span>
                  <span className="text-base font-bold text-acento">Ver detalle</span>
                </span>
                {debt > 0 ? (
                  <span className="shrink-0 text-right">
                    <span className="block text-base font-bold text-rojo">Debe</span>
                    <span className="text-2xl font-extrabold tabular-nums">{formatMoney(debt)}</span>
                  </span>
                ) : (
                  <span className="shrink-0 text-lg font-bold text-acento">✅ No debe</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {opened && <CustomerSheet customer={opened} debt={owed.get(opened.id) ?? 0} onClose={() => setOpenId(null)} />}

      {creating && (
        <CustomerForm
          onClose={() => setCreating(false)}
          onSave={(c) => {
            setCreating(false);
            saveCustomer(c);
            setOpenId(c.id);
            toast(`¡Listo! Agregaste a ${c.name}`, () => {
              setOpenId(null);
              saveCustomer({ ...c, deleted: true });
            });
          }}
        />
      )}
    </div>
  );
}
