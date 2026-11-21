"use client";

import { useState, type FormEvent } from "react";
import { claseControl } from "../configurador/campos";
import { boton } from "../_home/Secciones";
import { AvisoDatos } from "../legales/AvisoDatos";
import { contarEvento } from "../pedido";

/*
 * Lista de espera de Al Toque Tienda. Llega como aviso (Netlify Forms → correo), igual que los
 * pedidos: así medimos cuánta gente la quiere y para qué antes de construirla.
 */

const PRODUCTOS = ["Hasta 30", "De 30 a 200", "Más de 200"];
const HOY = ["Por Instagram o WhatsApp", "En un local", "En Mercado Libre u otra plataforma", "Todavía no vendo"];

export function ListaEspera() {
  const [f, setF] = useState({ nombre: "", contacto: "", negocio: "", vende: "", productos: "", hoy: "", comentario: "" });
  const [estado, setEstado] = useState<"lista" | "enviando" | "ok" | "error">("lista");
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (f.nombre.trim().length < 2 || f.contacto.trim().length < 6) {
      setError("Dejanos tu nombre y un WhatsApp o correo para avisarte.");
      return;
    }
    setError(null);
    setEstado("enviando");
    try {
      const r = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ "form-name": "tienda", subject: `Lista de espera Tienda · ${f.negocio.trim() || f.nombre.trim()}`, ...f }).toString(),
      });
      if (r.ok) contarEvento("Tienda", "tienda");
      setEstado(r.ok ? "ok" : "error");
    } catch {
      setEstado("error");
    }
  }

  if (estado === "ok")
    return (
      <div role="status" className="rounded-base border-2 border-tinta bg-acento-relleno p-7 text-sobre-acento">
        <p className="text-subtitulo font-semibold">¡Listo, {f.nombre.trim().split(" ")[0]}! Ya estás en la lista.</p>
        <p className="mt-2">Te avisamos a {f.contacto.trim()} apenas la tienda esté lista, antes que a nadie.</p>
      </div>
    );

  return (
    <form onSubmit={enviar} noValidate className="grid gap-4 rounded-base border-2 border-tinta bg-superficie p-6 @3xl:grid-cols-2 @3xl:p-8">
      <label className="block">
        <span className="mb-1 block text-chico font-medium">Tu nombre *</span>
        <input className={claseControl} value={f.nombre} onChange={set("nombre")} autoComplete="name" maxLength={80} required />
      </label>
      <label className="block">
        <span className="mb-1 block text-chico font-medium">WhatsApp o correo *</span>
        <input className={claseControl} value={f.contacto} onChange={set("contacto")} autoComplete="email" maxLength={120} required />
      </label>
      <label className="block">
        <span className="mb-1 block text-chico font-medium">Nombre del negocio</span>
        <input className={claseControl} value={f.negocio} onChange={set("negocio")} autoComplete="organization" maxLength={80} />
      </label>
      <label className="block">
        <span className="mb-1 block text-chico font-medium">¿Qué vendés?</span>
        <input className={claseControl} value={f.vende} onChange={set("vende")} placeholder="Ej: ropa, regalería, productos de almacén" maxLength={120} />
      </label>
      <label className="block">
        <span className="mb-1 block text-chico font-medium">¿Cuántos productos tenés?</span>
        <select className={claseControl} value={f.productos} onChange={set("productos")}>
          <option value="">Elegí</option>
          {PRODUCTOS.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-chico font-medium">¿Cómo vendés hoy?</span>
        <select className={claseControl} value={f.hoy} onChange={set("hoy")}>
          <option value="">Elegí</option>
          {HOY.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
      <label className="block @3xl:col-span-2">
        <span className="mb-1 block text-chico font-medium">¿Qué te gustaría que tenga? (opcional)</span>
        <textarea className={`${claseControl} min-h-24`} value={f.comentario} onChange={set("comentario")} maxLength={1000} placeholder="Envíos, pagos con tarjeta, retiro en el local…" />
      </label>
      {error && <p className="text-chico font-semibold text-[#b3261e] @3xl:col-span-2">{error}</p>}
      {estado === "error" && (
        <p className="text-chico font-semibold text-[#b3261e] @3xl:col-span-2">No pudimos anotarte. Probá de nuevo en un rato o escribinos por WhatsApp.</p>
      )}
      <div className="flex flex-col gap-3 @3xl:col-span-2">
        <button type="submit" disabled={estado === "enviando"} className={`${boton.tinta} self-start disabled:opacity-50`}>
          {estado === "enviando" ? "Anotándote…" : "Sumarme a la lista"}
        </button>
        <AvisoDatos accion="Sumarme a la lista" />
      </div>
    </form>
  );
}
