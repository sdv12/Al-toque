"use client";

import { useState } from "react";
import { findCustomerByName, newId } from "@/cajas/simple/lib/store";
import { cleanName } from "@/cajas/simple/lib/text";
import type { Customer } from "@/cajas/simple/lib/types";
import Sheet from "./Sheet";

/** Crear o cambiar un cliente del fiado: nombre y teléfono (opcional). */
export default function CustomerForm({
  customer,
  onSave,
  onClose,
}: {
  customer?: Customer;
  onSave: (c: Customer) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [error, setError] = useState("");

  function save() {
    const pretty = cleanName(name);
    if (!pretty) return setError("Falta el nombre.");
    const other = findCustomerByName(pretty, customer?.id);
    if (other) return setError(`Ya hay un cliente que se llama ${other.name}. Poné algo para diferenciarlos (ej: "${pretty} del 3° B").`);
    const now = Date.now();
    onSave({
      id: customer?.id ?? newId(),
      createdAt: customer?.createdAt ?? now,
      updatedAt: now,
      name: pretty,
      phone: phone.trim() || null,
    });
  }

  return (
    <Sheet
      title={customer ? `Cambiar datos de ${customer.name}` : "Cliente nuevo"}
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
      <div className="flex flex-col gap-5">
        {error && <p role="alert" className="rounded-2xl bg-rojo-claro p-3 text-xl font-bold text-rojo">{error}</p>}
        <label className="flex flex-col gap-2">
          <span className="text-xl font-bold">Nombre</span>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="Ej: Marta del 3° B"
            autoCapitalize="words"
            className="min-h-16 rounded-2xl border-2 border-borde bg-white px-4 text-2xl placeholder:text-gris"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xl font-bold">
            Teléfono <span className="font-normal text-gris">(si querés, para mandarle WhatsApp)</span>
          </span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            inputMode="tel"
            placeholder="Ej: 351 555 1234"
            className="min-h-16 rounded-2xl border-2 border-borde bg-white px-4 text-2xl placeholder:text-gris"
          />
        </label>
      </div>
    </Sheet>
  );
}
