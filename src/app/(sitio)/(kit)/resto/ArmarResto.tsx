"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { formatearPesos } from "@/core/lib/mensajes";
import { PLANES_RESTO, preciosVigentesHasta, type IdPlanResto } from "@/core/lib/precios";
import { DISENOS } from "@/restos/lib/disenos";
import { LISTA_TIPOS, TIPOS } from "@/restos/lib/locales";
import { codificarPedidoResto, linkDemoResto, type PedidoResto } from "@/restos/lib/publicado";
import type { IdDiseno, IdTipo } from "@/restos/lib/tipos";
import { claseControl } from "../configurador/campos";
import { slugDe } from "../configurador/estado";
import { AvisoDatos } from "../legales/AvisoDatos";
import { afiche, boton } from "../_home/Secciones";
import { enviarPedido, type ResultadoPedido } from "../pedido";

type Envio = { estado: "enviando" } | ({ estado: "listo" } & ResultadoPedido) | { estado: "error" };

const tarjeta =
  "flex cursor-pointer flex-col gap-1 rounded-base border-2 border-tinta/25 bg-superficie p-4 transition-colors hover:border-tinta has-checked:border-tinta has-checked:bg-acento-relleno has-checked:text-sobre-acento has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-foco";

function Paso({ n, titulo, children }: { n: number; titulo: string; children: ReactNode }) {
  return (
    <fieldset className="border-t-2 border-tinta pt-6">
      <legend className="float-left mb-4 flex w-full items-baseline gap-3">
        <span className={`${afiche} text-[2rem] leading-none tabular-nums`}>{String(n).padStart(2, "0")}</span>
        <span className="text-subtitulo font-semibold">{titulo}</span>
      </legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

/** «Armalo con tus datos»: tipo de local, nombre, diseño y plan → demo con eso y pedido por WhatsApp. */
export function ArmarResto({ whatsapp }: { whatsapp: string | undefined }) {
  const [tipo, setTipo] = useState<IdTipo>("bodegon");
  const [nombre, setNombre] = useState("");
  const [diseno, setDiseno] = useState<IdDiseno>(TIPOS.bodegon.diseno);
  const [plan, setPlan] = useState<IdPlanResto>("completo");
  const [codigo, setCodigo] = useState<string | null>(null);
  const [envio, setEnvio] = useState<Envio | null>(null);
  const nombreOk = nombre.trim().length >= 2;
  const pedido: PedidoResto = { version: 1, tipo, nombre: nombre.trim(), diseno, plan };
  const p = PLANES_RESTO[plan];
  const estimado = `${formatearPesos(p.unico)} + ${formatearPesos(p.mensual)}/mes`;

  // El código RS1 se calcula aparte (comprimir es asíncrono).
  const clave = JSON.stringify(pedido);
  useEffect(() => {
    let vigente = true;
    const t = setTimeout(() => void codificarPedidoResto(JSON.parse(clave)).then((c) => vigente && setCodigo(c)), 200);
    return () => {
      vigente = false;
      clearTimeout(t);
    };
  }, [clave]);

  const elegirTipo = (t: IdTipo) => {
    setTipo(t);
    setDiseno(TIPOS[t].diseno);
  };

  async function pedir() {
    if (!whatsapp || !codigo || !nombreOk) return;
    const local = TIPOS[tipo].nombre;
    const nombreDiseno = DISENOS.find((d) => d.id === diseno)?.nombre ?? diseno;
    // Sin await antes de enviarPedido: abre la pestaña de WhatsApp en este mismo clic.
    const r = enviarPedido(
      {
        tipo: "Resto",
        negocio: pedido.nombre,
        detalle: `${local} · diseño ${nombreDiseno} · ${p.nombre}`,
        estimado,
        slug: slugDe(pedido.nombre),
        saludo: "Hola! Quiero Al Toque Resto para mi local.",
        resumen: [`Local: ${pedido.nombre}`, `Tipo: ${local}`, `Diseño: ${nombreDiseno}`, `Plan: ${p.nombre}`, `Estimado: ${estimado}`],
        configuracion: pedido,
        codigo,
        nivel: plan === "carta" ? "restoCarta" : "resto",
      },
      whatsapp,
    );
    setEnvio({ estado: "enviando" });
    const res = await r;
    setEnvio(res.porWhatsapp || res.respaldada || res.link ? { estado: "listo", ...res } : { estado: "error" });
  }

  return (
    <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
      <Paso n={1} titulo="¿Qué tipo de local tenés?">
        <div className="grid gap-3 @xl:grid-cols-2 @4xl:grid-cols-4">
          {LISTA_TIPOS.map((t) => (
            <label key={t.id} className={tarjeta}>
              <input type="radio" name="tipo-local" value={t.id} checked={tipo === t.id} onChange={() => elegirTipo(t.id)} className="sr-only" />
              <span className="font-semibold">{t.nombre}</span>
              <span className="text-chico opacity-80">{t.resumen}</span>
            </label>
          ))}
        </div>
        <p className="mt-3 text-chico text-tinta-suave">Arranca con la carta, los horarios y las funciones típicas de ese tipo de local. Después cambiás todo.</p>
      </Paso>

      <Paso n={2} titulo="¿Cómo se llama?">
        <label className="sr-only" htmlFor="resto-nombre">
          Nombre del local
        </label>
        <input id="resto-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={40} placeholder={TIPOS[tipo].ejemplo} autoComplete="organization" className={`${claseControl} text-subtitulo`} />
      </Paso>

      <Paso n={3} titulo="Elegí el diseño">
        <div className="grid gap-3 @xl:grid-cols-2 @4xl:grid-cols-4">
          {DISENOS.map((d) => (
            <label key={d.id} className={tarjeta}>
              <input type="radio" name="diseno-resto" value={d.id} checked={diseno === d.id} onChange={() => setDiseno(d.id)} className="sr-only" />
              <span className="font-semibold">
                {d.nombre}
                {TIPOS[tipo].diseno === d.id && <span className="ml-2 text-mini font-normal opacity-80">(sugerido)</span>}
              </span>
              <span className="text-chico opacity-80">{d.bajada}</span>
            </label>
          ))}
        </div>
      </Paso>

      <Paso n={4} titulo="¿Qué plan?">
        <div className="grid gap-3 @xl:grid-cols-2" data-precios>
          {(Object.keys(PLANES_RESTO) as IdPlanResto[]).map((id) => (
            <label key={id} className={tarjeta}>
              <input type="radio" name="plan-resto" value={id} checked={plan === id} onChange={() => setPlan(id)} className="sr-only" />
              <span className="font-semibold">{PLANES_RESTO[id].nombre}</span>
              <span className="tabular-nums">
                {formatearPesos(PLANES_RESTO[id].unico)} + {formatearPesos(PLANES_RESTO[id].mensual)} por mes
              </span>
              <span className="text-chico opacity-80">{id === "carta" ? "La web con carta, reservas y pedidos por WhatsApp, editor, QR y carta para imprimir." : "Todo lo anterior, más el panel: salón, cocina, cuenta dividida, caja, números y personal."}</span>
            </label>
          ))}
        </div>
      </Paso>

      <div className="rounded-base border-2 border-tinta bg-superficie p-6" data-precios>
        <p className="flex flex-wrap items-end justify-between gap-x-4">
          <span className="font-semibold">{p.nombre}</span>
          <span className="text-right">
            <span className={`${afiche} block text-[2.5rem] leading-none tabular-nums`}>{formatearPesos(p.unico)}</span>
            <span className="text-chico">+ {formatearPesos(p.mensual)} por mes</span>
          </span>
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={linkDemoResto({ tipo, nombre, diseno })} target="_blank" className={boton.contorno}>
            Ver cómo queda
          </Link>
          <button type="button" onClick={pedir} disabled={!whatsapp || !codigo || !nombreOk || envio?.estado === "enviando"} className={`${boton.tinta} disabled:cursor-not-allowed disabled:opacity-40`}>
            {envio?.estado === "enviando" ? "Enviando…" : "Lo quiero"}
          </button>
        </div>
        {!nombreOk && <p className="mt-3 text-chico text-tinta-suave">Poné el nombre del local para pedirlo.</p>}
        {envio?.estado === "listo" && (
          <p role="status" className="mt-3 text-chico">
            <span className="font-semibold">
              ¡Listo! Recibimos tu pedido{envio.numero && <span className="tabular-nums"> {envio.numero}</span>}.
            </span>{" "}
            {envio.porWhatsapp ? (
              "Se abrió WhatsApp con el mensaje: si todavía no lo mandaste, solo falta tocar enviar. Si ya armaste tu carta en la demo, descargá la copia (panel → Ajustes → Copia y datos) y mandánosla también."
            ) : envio.link ? (
              <>
                <a href={envio.link} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">
                  Abrí WhatsApp
                </a>{" "}
                y mandanos el mensaje con tu número de pedido.
              </>
            ) : null}
          </p>
        )}
        {envio?.estado === "error" && (
          <p role="alert" className="mt-3 text-chico text-[#b3261e]">
            No pudimos enviarlo. Probá de nuevo en un rato.
          </p>
        )}
        <AvisoDatos accion="Lo quiero" className="mt-3" />
        <p className="mt-3 text-mini text-tinta-suave">Precios de referencia en pesos argentinos, vigentes hasta el {preciosVigentesHasta()} (se actualizan cada tres meses).</p>
      </div>
    </form>
  );
}
