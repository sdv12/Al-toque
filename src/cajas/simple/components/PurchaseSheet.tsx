"use client";

import { useState } from "react";
import { formatMoney } from "@/cajas/simple/lib/format";
import { formatCrates } from "@/cajas/simple/lib/stock";
import { activeProducts, saveProduct, savePurchase, useStore } from "@/cajas/simple/lib/store";
import type { Product } from "@/cajas/simple/lib/types";
import { useInventory } from "@/cajas/simple/lib/use-inventory";
import CrateSizeSheet from "./CrateSizeSheet";
import CratesStepper from "./CratesStepper";
import MoneySheet from "./MoneySheet";
import ProductImage from "./ProductImage";
import ProductPicker from "./ProductPicker";
import Sheet from "./Sheet";
import { useToast } from "./Toast";

interface Row {
  productId: string;
  crates: number;
  /** Lo que se pagó por todo eso (centavos), si se cargó. */
  paid: number | null;
}

/** "Cargar lo que compré": arranca con la lista del mercado, se ajusta y se guarda. */
export default function PurchaseSheet({ onClose }: { onClose: () => void }) {
  const { products } = useStore();
  const inventory = useInventory();
  const toast = useToast();
  const [rows, setRows] = useState<Row[]>(() =>
    inventory.filter((r) => r.toBuy > 0).map((r) => ({ productId: r.product.id, crates: r.toBuy, paid: null })),
  );
  const [adding, setAdding] = useState(false);
  const [sizing, setSizing] = useState<Product | null>(null);
  const [paying, setPaying] = useState<string | null>(null);

  const byId = new Map(activeProducts(products).map((p) => [p.id, p]));
  const visible = rows.filter((r) => byId.has(r.productId));
  const totalPaid = visible.reduce((sum, r) => sum + (r.crates > 0 ? (r.paid ?? 0) : 0), 0);

  const update = (id: string, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.productId === id ? { ...r, ...patch } : r)));

  async function save() {
    const bought = visible.filter((r) => r.crates > 0).map((r) => ({ product: byId.get(r.productId)!, crates: r.crates, paid: r.paid }));
    onClose();
    const undo = await savePurchase(bought);
    toast(`¡Listo! Compra guardada (${bought.length} ${bought.length === 1 ? "producto" : "productos"})`, () => {
      undo();
      toast("Listo, la compra se borró.");
    });
  }

  function add(p: Product) {
    setAdding(false);
    if (!p.crate) setSizing(p);
    else setRows((rs) => [...rs, { productId: p.id, crates: 1, paid: null }]);
  }

  const payingProduct = paying ? byId.get(paying) : undefined;
  const payingRow = rows.find((r) => r.productId === paying);

  return (
    <>
      <Sheet
        title="📥 Cargar lo que compré"
        onClose={onClose}
        footer={
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={onClose} className="min-h-16 rounded-2xl border-2 border-borde text-xl font-bold">
              Cancelar
            </button>
            <button
              type="button"
              disabled={!visible.some((r) => r.crates > 0)}
              onClick={save}
              className="min-h-16 rounded-2xl bg-acento text-xl font-bold text-white disabled:bg-borde/50 disabled:text-tinta"
            >
              ✔ Guardar compra
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-lg">Poné cuántos cajones trajiste de cada cosa. Lo que pagaste es opcional.</p>
          <ul className="flex flex-col gap-2">
            {visible.map((r) => {
              const p = byId.get(r.productId)!;
              return (
                <li key={r.productId} className={`rounded-2xl border-2 bg-white p-2 ${r.crates > 0 ? "border-acento" : "border-borde/40 opacity-70"}`}>
                  <div className="mb-1 flex items-center gap-2">
                    <ProductImage product={p} size={32} />
                    <p className="min-w-0 flex-1 text-xl font-bold leading-tight">{p.name}</p>
                    <button
                      type="button"
                      onClick={() => setPaying(p.id)}
                      className="min-h-14 shrink-0 rounded-xl border-2 border-borde px-2 text-base font-bold"
                    >
                      {r.paid ? `💲 ${formatMoney(r.paid)}` : "💲 Pagué…"}
                    </button>
                  </div>
                  <CratesStepper product={p} value={r.crates} onChange={(n) => update(p.id, { crates: n })} />
                </li>
              );
            })}
          </ul>
          {visible.length === 0 && <p className="rounded-2xl bg-amarillo-claro p-4 text-lg">Agregá lo que compraste.</p>}
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="min-h-16 rounded-2xl border-2 border-dashed border-acento bg-acento-claro text-xl font-bold text-acento-oscuro"
          >
            ➕ Agregar producto
          </button>
          {totalPaid > 0 && <p className="text-right text-xl">Pagaste en total: <strong>{formatMoney(totalPaid)}</strong></p>}
        </div>
      </Sheet>

      {adding && (
        <ProductPicker title="¿Qué compraste?" exclude={visible.map((r) => r.productId)} onPick={add} onClose={() => setAdding(false)} />
      )}

      {sizing && (
        <CrateSizeSheet
          product={sizing}
          onClose={() => setSizing(null)}
          onSave={(crate) => {
            saveProduct({ ...sizing, crate });
            setRows((rs) => [...rs, { productId: sizing.id, crates: 1, paid: null }]);
            setSizing(null);
          }}
        />
      )}

      {payingProduct && payingRow && (
        <MoneySheet
          title={`Cuánto pagaste por ${formatCrates(payingRow.crates)} de ${payingProduct.name}`}
          previous={payingRow.paid}
          optional
          onClose={() => setPaying(null)}
          onSave={(cents) => {
            update(payingProduct.id, { paid: cents && cents > 0 ? cents : null });
            setPaying(null);
          }}
        />
      )}
    </>
  );
}
