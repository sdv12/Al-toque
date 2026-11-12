"use client";

import { useRef, useState } from "react";
import { formatMoney } from "@/cajas/simple/lib/format";
import { fileToSmallPhoto } from "@/cajas/simple/lib/photo";
import { cajaActiva } from "@/cajas/simple/lib/activa";
import { productEmojis } from "@/cajas/simple/lib/seed";
import { newId } from "@/cajas/simple/lib/store";
import { UNIT_LABEL, type Product, type Unit } from "@/cajas/simple/lib/types";
import { formatAmount } from "@/cajas/simple/lib/stock";
import CrateSizeSheet from "./CrateSizeSheet";
import MoneySheet from "./MoneySheet";
import ProductImage from "./ProductImage";
import Profit from "./Profit";
import Sheet from "./Sheet";

const UNITS: Unit[] = ["kg", "unidad", "atado"];

/** Crear o editar un producto. */
export default function ProductForm({
  product,
  onSave,
  onDelete,
  onClose,
}: {
  product?: Product;
  onSave: (p: Product) => void;
  onDelete?: (p: Product) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [emoji, setEmoji] = useState(product?.emoji ?? "🥬");
  const [photo, setPhoto] = useState<string | null>(product?.photo ?? null);
  const [unit, setUnit] = useState<Unit>(product?.unit ?? "kg");
  const [price, setPrice] = useState<number | null>(product?.price ?? null);
  const [cost, setCost] = useState<number | null>(product?.cost ?? null);
  const [crate, setCrate] = useState<number | null>(product?.crate ?? null);
  const [editing, setEditing] = useState<"price" | "cost" | "crate" | null>(null);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  function save() {
    const cleanName = name.trim().replace(/\s+/g, " ");
    if (!cleanName) return setError("Falta el nombre del producto.");
    if (!price) return setError("Falta el precio de venta.");
    const now = Date.now();
    onSave({
      id: product?.id ?? newId(),
      createdAt: product?.createdAt ?? now,
      updatedAt: now,
      name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
      emoji,
      photo,
      unit,
      price,
      cost,
      crate,
    });
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    try {
      setPhoto(await fileToSmallPhoto(file));
    } catch {
      setError("No se pudo cargar la foto. Probá de nuevo.");
    }
  }

  const per = unit === "kg" ? "el kilo" : unit === "unidad" ? "la unidad" : "el atado";

  return (
    <>
      <Sheet
        title={product ? `Cambiar ${product.name}` : "Producto nuevo"}
        onClose={onClose}
        footer={
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={onClose} className="min-h-16 rounded-2xl border-2 border-borde text-xl font-bold">
              Cancelar
            </button>
            <button type="button" onClick={save} className="min-h-16 rounded-2xl bg-acento text-xl font-bold text-white">
              ✔ Guardar
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          {error && <p role="alert" className="rounded-2xl bg-rojo-claro p-3 text-xl font-bold text-rojo">{error}</p>}

          <label className="flex flex-col gap-2">
            <span className="text-xl font-bold">Nombre</span>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="Ej: Papa negra"
              autoCapitalize="sentences"
              className="min-h-16 rounded-2xl border-2 border-borde bg-white px-4 text-2xl placeholder:text-gris"
            />
          </label>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-xl font-bold">¿Cómo se vende?</legend>
            <div className="grid grid-cols-3 gap-3">
              {UNITS.map((u) => (
                <button
                  key={u}
                  type="button"
                  aria-pressed={unit === u}
                  onClick={() => {
                    // Por kilo el cajón va en kilos; por unidad, en unidades: si cambia, hay que volver a ponerlo.
                    if ((u === "kg") !== (unit === "kg")) setCrate(null);
                    setUnit(u);
                  }}
                  className={`min-h-16 rounded-2xl border-2 text-lg font-bold ${
                    unit === u ? "border-acento bg-acento text-white" : "border-borde bg-white"
                  }`}
                >
                  {UNIT_LABEL[u].replace("por ", "Por ")}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-3">
            <span className="text-xl font-bold">Precio de venta ({per})</span>
            <button
              type="button"
              onClick={() => setEditing("price")}
              className="flex min-h-16 items-center justify-between rounded-2xl border-2 border-borde bg-white px-4 text-left"
            >
              <span className="text-3xl font-extrabold tabular-nums">{price ? formatMoney(price) : "Tocá para poner"}</span>
              <span className="text-lg font-bold text-acento">✏️ Cambiar</span>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xl font-bold">
              Precio de compra <span className="font-normal text-gris">(si querés, para ver la ganancia)</span>
            </span>
            <button
              type="button"
              onClick={() => setEditing("cost")}
              className="flex min-h-16 items-center justify-between rounded-2xl border-2 border-borde bg-white px-4 text-left"
            >
              <span className="text-2xl font-bold tabular-nums">{cost ? formatMoney(cost) : "Sin poner"}</span>
              <span className="text-lg font-bold text-acento">✏️ Cambiar</span>
            </button>
            {price && cost ? <Profit price={price} cost={cost} /> : null}
          </div>

          {cajaActiva().cajones && <div className="flex flex-col gap-3">
            <span className="text-xl font-bold">
              ¿Cuánto trae un cajón? <span className="font-normal text-gris">(o bolsa, o caja: para la lista del mercado)</span>
            </span>
            <button
              type="button"
              onClick={() => setEditing("crate")}
              className="flex min-h-16 items-center justify-between rounded-2xl border-2 border-borde bg-white px-4 text-left"
            >
              <span className="text-2xl font-bold">{crate ? formatAmount(unit, crate) : "Sin poner"}</span>
              <span className="text-lg font-bold text-acento">✏️ Cambiar</span>
            </button>
          </div>}

          <div className="flex flex-col gap-3">
            <span className="text-xl font-bold">Dibujo o foto</span>
            <div className="flex items-center gap-4">
              <span className="rounded-2xl border-2 border-borde bg-white p-2">
                <ProductImage product={{ emoji, photo }} size={80} />
              </span>
              <div className="flex flex-1 flex-col gap-3">
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="min-h-14 rounded-2xl border-2 border-borde bg-white px-3 text-lg font-bold"
                >
                  📷 Sacar foto
                </button>
                {photo && (
                  <button type="button" onClick={() => setPhoto(null)} className="min-h-14 rounded-2xl border-2 border-rojo px-3 text-lg font-bold text-rojo">
                    Quitar foto
                  </button>
                )}
              </div>
              <input ref={fileInput} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onPhoto(e.target.files?.[0])} />
            </div>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-8" role="group" aria-label="Elegí un dibujo">
              {productEmojis().map((e) => (
                <button
                  key={e}
                  type="button"
                  aria-pressed={!photo && emoji === e}
                  onClick={() => {
                    setEmoji(e);
                    setPhoto(null);
                  }}
                  className={`flex min-h-14 items-center justify-center rounded-xl border-2 text-4xl ${
                    !photo && emoji === e ? "border-acento bg-acento-claro" : "border-transparent"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {product && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(product)}
              className="mt-2 min-h-16 rounded-2xl border-2 border-rojo bg-rojo-claro text-xl font-bold text-rojo"
            >
              🗑 Borrar este producto
            </button>
          )}
        </div>
      </Sheet>

      {editing === "crate" && (
        <CrateSizeSheet
          product={{ name: name.trim() || "este producto", unit, crate }}
          onClose={() => setEditing(null)}
          onSave={(n) => {
            setCrate(n);
            setEditing(null);
          }}
        />
      )}

      {(editing === "price" || editing === "cost") && (
        <MoneySheet
          title={editing === "price" ? `Precio de venta (${per})` : `Precio de compra (${per})`}
          previous={editing === "price" ? price : cost}
          cost={editing === "price" ? cost : null}
          optional={editing === "cost"}
          onClose={() => setEditing(null)}
          onSave={(cents) => {
            if (editing === "price") setPrice(cents);
            else setCost(cents && cents > 0 ? cents : null);
            setError("");
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
