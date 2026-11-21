"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { claseControl } from "../configurador/campos";
import { boton } from "../_home/Secciones";
import { codigoSolicitud } from "./codigo";

/*
 * Formulario del botón de arrepentimiento y del de baja. Sin registro previo. El código de la
 * solicitud se muestra en el momento y viaja en el aviso (Netlify Forms → correo), así se puede
 * confirmar por el mismo medio dentro de las 24 h (Res. SCI 424/2020). Si el envío falla, el
 * código igual queda en pantalla con un correo armado para mandarlo.
 */

const SERVICIOS = ["Página web", "Agenda de turnos", "Caja simple", "Caja pro", "Otro"];

export function Solicitud({ tipo, email }: { tipo: "arrepentimiento" | "baja"; email: string }) {
  const id = useId();
  const [f, setF] = useState({ nombre: "", contacto: "", pedido: "", servicio: "", fecha: "", motivo: "" });
  const [estado, setEstado] = useState<{ codigo: string; enviada: boolean } | "enviando" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const es = tipo === "arrepentimiento";
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (f.nombre.trim().length < 2 || f.contacto.trim().length < 6) {
      setError("Completá tu nombre y un correo o WhatsApp para confirmarte la solicitud.");
      return;
    }
    setError(null);
    setEstado("enviando");
    const codigo = codigoSolicitud(tipo);
    let enviada = false;
    try {
      const r = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": tipo,
          subject: `${es ? "Arrepentimiento" : "Baja"} ${codigo} · ${f.nombre.trim()}`,
          codigo,
          ...f,
        }).toString(),
      });
      enviada = r.ok;
    } catch {}
    setEstado({ codigo, enviada });
  }

  if (estado && estado !== "enviando") {
    const mail = `mailto:${email}?subject=${encodeURIComponent(`${es ? "Arrepentimiento" : "Baja"} ${estado.codigo}`)}&body=${encodeURIComponent(
      `Código: ${estado.codigo}\nNombre: ${f.nombre}\nContacto: ${f.contacto}\nPedido: ${f.pedido}\nServicio: ${f.servicio}\nFecha: ${f.fecha}\nMotivo: ${f.motivo}`,
    )}`;
    return (
      <div role="status" className="mt-8 rounded-base border-2 border-tinta bg-superficie p-6">
        <p className="font-semibold">{es ? "Recibimos tu solicitud de arrepentimiento." : "Recibimos tu solicitud de baja."}</p>
        <p className="mt-2">Este es el código de identificación de tu solicitud. Guardalo:</p>
        <p className="mt-3 inline-block rounded-control bg-acento-relleno px-4 py-2 font-mono text-subtitulo font-semibold text-sobre-acento select-all">{estado.codigo}</p>
        <p className="mt-3 text-chico text-tinta-suave">
          Te lo confirmamos por el mismo medio que nos dejaste ({f.contacto}) dentro de las 24 horas
          {es ? " y te contamos cómo te devolvemos lo que pagaste." : " con la fecha en que rige la baja."}
        </p>
        {!estado.enviada && (
          <p className="mt-4 rounded-base border-2 border-[#b3261e] bg-[#fde7e5] p-3 text-chico text-[#7a1c16]">
            No pudimos enviarla automáticamente.{" "}
            <a href={mail} className="font-semibold underline">
              Mandala por correo con un toque
            </a>{" "}
            (ya va con el código y tus datos) o escribinos a {email}.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="mt-8 grid gap-4 rounded-base border-2 border-tinta bg-superficie p-6 @2xl:grid-cols-2">
      <label className="block">
        <span className="mb-1 block text-chico font-medium">Nombre y apellido *</span>
        <input className={claseControl} value={f.nombre} onChange={set("nombre")} autoComplete="name" required />
      </label>
      <label className="block">
        <span className="mb-1 block text-chico font-medium">Correo o WhatsApp *</span>
        <input className={claseControl} value={f.contacto} onChange={set("contacto")} autoComplete="email" required />
      </label>
      <label className="block">
        <span className="mb-1 block text-chico font-medium">Número de pedido o de factura</span>
        <input className={claseControl} value={f.pedido} onChange={set("pedido")} placeholder="Ej: #00015" />
      </label>
      <label className="block">
        <span className="mb-1 block text-chico font-medium">Servicio</span>
        <select className={claseControl} value={f.servicio} onChange={set("servicio")}>
          <option value="">Elegí uno</option>
          {SERVICIOS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-chico font-medium">{es ? "Fecha en que contrataste" : "Desde cuándo querés la baja"}</span>
        <input className={claseControl} type="date" value={f.fecha} onChange={set("fecha")} />
      </label>
      <label className="block @2xl:col-span-2">
        <span className="mb-1 block text-chico font-medium">Motivo (opcional)</span>
        <textarea className={`${claseControl} min-h-24`} value={f.motivo} onChange={set("motivo")} maxLength={1000} />
      </label>
      {error && (
        <p id={`${id}-error`} className="text-chico font-semibold text-[#b3261e] @2xl:col-span-2">
          {error}
        </p>
      )}
      <p className="text-mini text-tinta-suave @2xl:col-span-2">
        Usamos estos datos solo para gestionar tu solicitud. Ver la <Link href="/privacidad" className="underline">Política de privacidad</Link>.
      </p>
      <div className="@2xl:col-span-2">
        <button type="submit" disabled={estado === "enviando"} className={`${boton.tinta} disabled:opacity-50`}>
          {estado === "enviando" ? "Enviando…" : es ? "Enviar solicitud de arrepentimiento" : "Enviar solicitud de baja"}
        </button>
      </div>
    </form>
  );
}
