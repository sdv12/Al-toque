"use client";

import { useMemo, useState, type ReactNode } from "react";
import { formatMoney, formatTyping, parseMoney } from "@/cajas/simple/lib/format";
import { cashShortcuts } from "@/cajas/simple/lib/sale";
import { cajaActiva } from "@/cajas/simple/lib/activa";
import { debts } from "@/cajas/simple/lib/fiado";
import { checkout, findCustomerByName, newId, saveCustomer, useStore } from "@/cajas/simple/lib/store";
import { cleanName } from "@/cajas/simple/lib/text";
import { PAY_ICON, PAY_LABEL, type PayMethod, type Sale } from "@/cajas/simple/lib/types";
import NumPad from "./NumPad";
import SearchBox, { matches } from "./SearchBox";
import Sheet from "./Sheet";

type Step = "metodo" | "efectivo" | "fiado" | "nuevo";

const TITLES: Record<Step, string> = {
  metodo: "¿Cómo paga?",
  efectivo: "💵 Efectivo",
  fiado: "📒 Fiado: ¿a quién?",
  nuevo: "📒 Cliente nuevo",
};

/** Cobrar: elegir cómo paga y guardar la venta. */
export default function PaySheet({
  total,
  onDone,
  onClose,
}: {
  total: number;
  onDone: (sale: Sale, message: string) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("metodo");
  const [busy, setBusy] = useState(false);

  async function finish(method: PayMethod, extra: Parameters<typeof checkout>[1], message: string) {
    if (busy) return;
    setBusy(true);
    const sale = await checkout(method, extra);
    onDone(sale, message);
  }

  const back = (
    <button type="button" onClick={() => setStep(step === "nuevo" ? "fiado" : "metodo")} className="min-h-16 rounded-2xl border-2 border-borde text-xl font-bold">
      ← Volver
    </button>
  );

  return (
    <Sheet title={TITLES[step]} onClose={onClose} footer={step === "metodo" || step === "fiado" ? undefined : <Footer back={back} step={step} />}>
      {step !== "efectivo" && (
        <p className="mb-4 text-center">
          <span className="block text-xl font-bold">A cobrar</span>
          <span className="text-5xl font-extrabold tabular-nums">{formatMoney(total)}</span>
        </p>
      )}

      {step === "metodo" && (
        <div className="grid grid-cols-2 gap-4">
          {(Object.keys(PAY_LABEL) as PayMethod[]).filter((m) => m !== "fiado" || cajaActiva().fiado).map((m) => (
            <button
              key={m}
              type="button"
              disabled={busy}
              onClick={() => {
                if (m === "efectivo") setStep("efectivo");
                else if (m === "fiado") setStep("fiado");
                else finish(m, {}, `¡Listo! Venta guardada (${PAY_LABEL[m]})`);
              }}
              className="flex min-h-32 flex-col items-center justify-center gap-1 rounded-3xl border-2 border-acento bg-acento-claro p-2 text-xl font-extrabold leading-tight text-acento-oscuro active:scale-95"
            >
              <span aria-hidden="true" className="text-5xl">{PAY_ICON[m]}</span>
              {PAY_LABEL[m]}
            </button>
          ))}
        </div>
      )}

      {step === "efectivo" && <Cash total={total} onSave={(paidWith, change) =>
        finish("efectivo", { paidWith }, change > 0 ? `¡Listo! Venta guardada. Vuelto: ${formatMoney(change)}` : "¡Listo! Venta guardada")
      } />}

      {step === "fiado" && (
        <>
          <Customers onPick={(id, name) => finish("fiado", { customerId: id }, `¡Listo! Anotado en el fiado de ${name}`)} onNew={() => setStep("nuevo")} />
          <div className="mt-6">{back}</div>
        </>
      )}

      {step === "nuevo" && (
        <NewCustomer onSave={(id, name) => finish("fiado", { customerId: id }, `¡Listo! Anotado en el fiado de ${name}`)} />
      )}
    </Sheet>
  );
}

// El botón principal de cada paso vive dentro del paso (form="..."), así queda siempre visible abajo.
function Footer({ back, step }: { back: ReactNode; step: Step }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {back}
      <button type="submit" form={`pay-${step}`} className="min-h-16 rounded-2xl bg-acento text-xl font-bold text-white">
        {step === "efectivo" ? "✔ Guardar venta" : "✔ Guardar y anotar"}
      </button>
    </div>
  );
}

function Cash({ total, onSave }: { total: number; onSave: (paidWith: number | null, change: number) => void }) {
  const [text, setText] = useState("");
  const paid = parseMoney(text);
  const change = paid !== null ? paid - total : 0;
  const short = paid !== null && paid > 0 && paid < total;

  return (
    <form
      id="pay-efectivo"
      onSubmit={(e) => {
        e.preventDefault();
        if (short) return;
        onSave(paid && paid > 0 ? paid : null, Math.max(0, change));
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-white px-3 py-0.5">
          <p className="text-base font-bold">A cobrar</p>
          <p className="text-2xl font-extrabold whitespace-nowrap tabular-nums">{formatMoney(total)}</p>
        </div>
        <div className="rounded-2xl border-2 border-borde bg-white px-3 py-0.5" aria-live="polite">
          <p className="text-base font-bold">Paga con</p>
          <p className="text-2xl font-extrabold whitespace-nowrap tabular-nums">
            {text === "" ? <span className="text-gris">$ ?</span> : `$ ${formatTyping(text)}`}
          </p>
        </div>
      </div>

      <div aria-live="polite" className="my-2">
        {short ? (
          <div className="flex min-h-16 items-center justify-between gap-2 rounded-2xl bg-rojo-claro px-4 text-rojo">
            <p className="text-xl font-bold">FALTA</p>
            <p className="text-4xl font-extrabold tabular-nums">{formatMoney(total - paid)}</p>
          </div>
        ) : paid !== null && paid >= total ? (
          <div className="flex min-h-16 items-center justify-between gap-2 rounded-2xl bg-acento px-4 text-white">
            <p className="text-xl font-bold">VUELTO</p>
            <p className="text-4xl font-extrabold tabular-nums">{formatMoney(change)}</p>
          </div>
        ) : (
          <p className="flex min-h-16 items-center rounded-2xl bg-amarillo-claro px-3 text-base leading-snug">
            ¿Con cuánto paga? Tocá un billete o escribilo. Si paga justo, tocá Guardar.
          </p>
        )}
      </div>

      <div className="mb-2 grid grid-cols-3 gap-2">
        {cashShortcuts(total).slice(0, 3).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setText(String(v / 100))}
            className="min-h-14 rounded-2xl border-2 border-acento bg-acento-claro text-lg font-extrabold whitespace-nowrap text-acento-oscuro active:scale-95"
          >
            {formatMoney(v)}
          </button>
        ))}
      </div>
      <NumPad value={text} onChange={setText} compact />
    </form>
  );
}

function Customers({ onPick, onNew }: { onPick: (id: string, name: string) => void; onNew: () => void }) {
  const { customers, sales, moves } = useStore();
  const [query, setQuery] = useState("");
  const owed = useMemo(() => debts(sales, moves), [sales, moves]);
  const list = customers
    .filter((c) => !c.deleted && matches(c.name, query))
    .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));

  return (
    <div className="flex flex-col gap-3">
      <button type="button" onClick={onNew} className="min-h-16 rounded-2xl border-2 border-dashed border-acento bg-acento-claro text-xl font-bold text-acento-oscuro">
        ➕ Cliente nuevo
      </button>
      {customers.length > 5 && <SearchBox value={query} onChange={setQuery} placeholder="Buscar cliente" />}
      {customers.length === 0 && <p className="text-xl text-gris">Todavía no hay nadie en el fiado. Tocá &quot;Cliente nuevo&quot;.</p>}
      <ul className="flex flex-col gap-2">
        {list.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onPick(c.id, c.name)}
              className="flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl border-2 border-borde bg-white px-4 text-left active:bg-acento-claro"
            >
              <span className="text-xl font-bold">👤 {c.name}</span>
              <span className="shrink-0 text-lg text-gris">
                {(owed.get(c.id) ?? 0) > 0 ? <>Debe <strong className="text-tinta">{formatMoney(owed.get(c.id)!)}</strong></> : "No debe"}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NewCustomer({ onSave }: { onSave: (id: string, name: string) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    const pretty = cleanName(name);
    if (!pretty) return setError("Falta el nombre.");
    // Si ya existe alguien con ese nombre, se anota a esa persona.
    const existing = findCustomerByName(pretty);
    if (existing) return onSave(existing.id, existing.name);
    const now = Date.now();
    const id = newId();
    await saveCustomer({ id, name: pretty, phone: phone.trim() || null, createdAt: now, updatedAt: now });
    onSave(id, pretty);
  }

  return (
    <form
      id="pay-nuevo"
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
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
          autoFocus
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
    </form>
  );
}
