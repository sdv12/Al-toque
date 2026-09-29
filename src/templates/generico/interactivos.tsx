"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { linkWhatsApp, mensajeContacto } from "@/core/lib/mensajes";
import type { Imagen } from "@/core/schema/comun";
import { IconoWhatsApp } from "@/ui/primitives/IconoWhatsApp";
import { boton } from "./estilos";
import { Foto } from "./Foto";

/**
 * Antes / después con cortina deslizable. El control es un <input type="range"> nativo
 * (flechas, Inicio/Fin y lectores de pantalla funcionan solos) superpuesto e invisible.
 */
export function Comparador({ antes, despues, titulo }: { antes: Imagen | undefined; despues: Imagen | undefined; titulo: string }) {
  const [pos, setPos] = useState(50);
  const etiqueta = "absolute top-3 rounded-control bg-fondo/90 px-2.5 py-1 text-mini font-semibold text-tinta";
  return (
    <div className="relative overflow-hidden rounded-base has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-4 has-[input:focus-visible]:outline-foco">
      <div className="relative">
        <Foto imagen={despues ?? { alt: `Después: ${titulo}` }} aspecto="4 / 3" sizes="(min-width: 1024px) 55vw, 100vw" />
        <span className={`${etiqueta} right-3`}>Después</span>
      </div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Foto imagen={antes ?? { alt: `Antes: ${titulo}` }} aspecto="4 / 3" sizes="(min-width: 1024px) 55vw, 100vw" className="h-full" />
        <span className={`${etiqueta} left-3`}>Antes</span>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-acento" style={{ left: `${pos}%` }}>
        <span className="absolute left-1/2 top-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-acento-relleno text-sobre-acento">
          ↔
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`Comparar antes y después: ${titulo}`}
        aria-valuetext={`${pos} % de la foto de antes`}
        className="absolute inset-0 size-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}

/** Carrusel horizontal con scroll-snap y botones (también se recorre con dedo o teclado). */
export function Carrusel({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  const pista = useRef<HTMLDivElement>(null);
  const [bordes, setBordes] = useState({ inicio: true, fin: false });

  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    const medir = () => setBordes({ inicio: el.scrollLeft < 8, fin: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
    el.addEventListener("scroll", medir, { passive: true });
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", medir);
      ro.disconnect();
    };
  }, []);

  const mover = (sentido: 1 | -1) => {
    const el = pista.current;
    if (!el) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: sentido * el.clientWidth * 0.85, behavior: reducido ? "auto" : "smooth" });
  };

  const flecha = "grid size-12 place-items-center rounded-full border-2 border-tinta text-subtitulo font-bold hover:bg-tinta hover:text-fondo disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-tinta";
  return (
    <div>
      <div ref={pista} role="region" aria-label={etiqueta} tabIndex={0} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none]">
        {children}
      </div>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={() => mover(-1)} disabled={bordes.inicio} aria-label="Anterior" className={flecha}>
          <span aria-hidden>‹</span>
        </button>
        <button type="button" onClick={() => mover(1)} disabled={bordes.fin} aria-label="Siguiente" className={flecha}>
          <span aria-hidden>›</span>
        </button>
      </div>
    </div>
  );
}

/** Formulario corto: arma el mensaje y abre WhatsApp. Nada se guarda en un servidor. */
export function FormularioContacto({ negocio, temas }: { negocio: { nombre: string; whatsapp: string }; temas: string[] }) {
  const id = useId();
  const [nombre, setNombre] = useState("");
  const [tema, setTema] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [zona, setZona] = useState("");
  const [enviado, setEnviado] = useState<string | null>(null);

  function enviar(e: FormEvent) {
    e.preventDefault();
    const link = linkWhatsApp(negocio.whatsapp, mensajeContacto({ negocio, nombre, tema, mensaje, zona }));
    window.open(link, "_blank", "noopener,noreferrer");
    setEnviado(link);
  }

  const campo = "mt-1.5 block w-full rounded-control border-2 border-borde bg-fondo px-4 py-3 text-cuerpo text-tinta focus:border-tinta";
  return (
    <form onSubmit={enviar} className="space-y-4">
      <div className="grid gap-4 @xl:grid-cols-2">
        <div>
          <label htmlFor={`${id}-n`} className="text-chico font-semibold">
            Tu nombre
          </label>
          <input id={`${id}-n`} required minLength={2} autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} className={campo} />
        </div>
        <div>
          <label htmlFor={`${id}-t`} className="text-chico font-semibold">
            ¿Por qué nos escribís?
          </label>
          <select id={`${id}-t`} value={tema} onChange={(e) => setTema(e.target.value)} className={campo}>
            <option value="">Elegí una opción</option>
            {temas.map((t) => (
              <option key={t}>{t}</option>
            ))}
            <option>Otra cosa</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor={`${id}-m`} className="text-chico font-semibold">
          Contanos qué necesitás
        </label>
        <textarea id={`${id}-m`} required minLength={5} rows={4} value={mensaje} onChange={(e) => setMensaje(e.target.value)} className={campo} />
      </div>
      <div>
        <label htmlFor={`${id}-z`} className="text-chico font-semibold">
          Barrio o zona <span className="font-normal text-tinta-suave">(opcional)</span>
        </label>
        <input id={`${id}-z`} value={zona} onChange={(e) => setZona(e.target.value)} className={campo} />
      </div>
      <button type="submit" className={`${boton.primario} w-full @xl:w-auto`}>
        <IconoWhatsApp className="size-5" /> Enviar por WhatsApp
      </button>
      <p role="status" className="min-h-5 text-chico text-tinta-suave">
        {enviado && (
          <>
            Se abrió WhatsApp con tu mensaje.{" "}
            <a href={enviado} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              ¿No se abrió? Tocá acá
            </a>
            .
          </>
        )}
      </p>
    </form>
  );
}
