"use client";

import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { horariosPedido } from "../lib/horarios";
import { claveItem, envioPara, faltaMinimo, totalItems } from "../lib/logica";
import type { Sumar } from "./Carta";
import { esCliente, useModo } from "../lib/modo";
import { mensajePedidoWeb } from "../lib/publicado";
import { linkWhatsApp } from "../lib/util";
import { useAhora, useResto } from "../lib/store";
import type { Entrega, Item, Medio } from "../lib/tipos";
import { plata } from "../lib/util";

const PAGOS: { id: Medio; nombre: string }[] = [
  { id: "efectivo", nombre: "Efectivo" },
  { id: "transferencia", nombre: "Transferencia" },
  { id: "qr", nombre: "QR Mercado Pago" },
];

export default function Bolsa({ bolsa, soloTienda, sumar, vaciar, cerrar }: { bolsa: Item[]; soloTienda: boolean; sumar: Sumar; vaciar: () => void; cerrar: () => void }) {
  const { st, act } = useResto();
  const { local } = st;
  const ahora = new Date(useAhora());
  const puedeRetirar = local.modulos.llevar || soloTienda;
  const puedeEnvio = local.modulos.delivery;
  const [entregaSel, setEntrega] = useState<Entrega>(puedeRetirar ? "retiro" : "envio");
  const entrega: Entrega = entregaSel === "envio" && puedeEnvio ? "envio" : puedeRetirar ? "retiro" : "envio";
  const horas = horariosPedido(local.horarios, ahora, entrega === "envio" ? local.delivery.demora : local.demoraLlevar);
  const [nombre, setNombre] = useState("");
  const [tel, setTel] = useState("");
  const [direccion, setDireccion] = useState("");
  const [horaSel, setHora] = useState("");
  const [pago, setPago] = useState<Medio>("efectivo");
  const [nota, setNota] = useState("");
  const [error, setError] = useState("");
  const [hecho, setHecho] = useState<{ num: number | null; hora: string; entrega: Entrega; link?: string } | null>(null);
  const cliente = esCliente(useModo());

  const hora = horaSel && (horaSel === "Cuanto antes" || horas.includes(horaSel)) ? horaSel : "Cuanto antes";
  const subtotal = totalItems(bolsa);
  const zonas = local.delivery.zonas;
  const [zonaSel, setZona] = useState("");
  const zona = zonas.find((z) => z.id === zonaSel);
  const env = envioPara(local, zona?.id);
  const envio = entrega === "envio" ? env.costo : 0;
  const falta = entrega === "envio" ? faltaMinimo(env.minimo, subtotal) : 0;
  const desde = zonas.length ? Math.min(...zonas.map((z) => z.costo)) : local.delivery.costo;

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || tel.replace(/\D/g, "").length < 8) return setError("Necesitamos tu nombre y un WhatsApp.");
    if (!horas.length) return setError("Por hoy ya no tomamos pedidos. ¡Te esperamos el próximo turno!");
    if (entrega === "envio" && zonas.length && !zona) return setError("Elegí tu barrio para calcular el envío.");
    if (entrega === "envio" && direccion.trim().length < 5) return setError("Poné la dirección de entrega (calle, número y piso si hace falta).");
    if (falta > 0) return setError(`El pedido mínimo para envío ${zona ? `a ${zona.nombre} ` : ""}es ${plata(env.minimo)}: te faltan ${plata(falta)}.`);
    const datos = { nombre: nombre.trim(), tel: tel.trim(), hora, entrega, direccion: direccion.trim(), envio, ...(entrega === "envio" && zona ? { zonaEnvio: zona.id } : {}), pago, items: bolsa, nota: nota.trim() };
    if (cliente) {
      // Sin nube todavía: el pedido le llega al restaurante por WhatsApp, con el detalle armado.
      const link = linkWhatsApp(local.whatsapp, mensajePedidoWeb(st, { ...datos, zona: zona?.nombre }));
      window.open(link, "_blank", "noopener");
      setHecho({ num: null, hora, entrega, link });
    } else setHecho({ num: act.nuevoPedido(datos), hora, entrega });
    vaciar();
  };

  return (
    <div className="capa" onClick={cerrar}>
      <aside className="bolsa" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Tu pedido">
        <div className="bolsa-cab">
          <h3>Tu pedido</h3>
          <button onClick={cerrar} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        {hecho ? (
          <div className="bolsa-ok">
            <span className="sec-et">{hecho.num ? "Pedido recibido" : "Pedido armado"}</span>
            {hecho.num ? (
              <strong className="bolsa-num">#{hecho.num}</strong>
            ) : (
              <p>
                Te abrimos WhatsApp con tu pedido: <b>mandá el mensaje</b> y te confirmamos por ahí.{" "}
                {hecho.link && (
                  <a href={hecho.link} target="_blank" rel="noreferrer">
                    ¿No se abrió? Tocá acá.
                  </a>
                )}
              </p>
            )}
            <p>
              {hecho.entrega === "envio"
                ? hecho.hora === "Cuanto antes"
                  ? `Sale apenas esté listo (unos ${local.delivery.demora} minutos).`
                  : `Te lo llevamos para las ${hecho.hora}.`
                : hecho.hora === "Cuanto antes"
                  ? `Lo podés pasar a buscar en unos ${local.demoraLlevar} minutos.`
                  : `Lo pasás a buscar a las ${hecho.hora}.`}{" "}
              Si falta algo te escribimos por WhatsApp.
            </p>
            <button className="btn btn-1" onClick={cerrar}>
              Listo
            </button>
          </div>
        ) : (
          <form onSubmit={enviar} noValidate>
            {puedeRetirar && puedeEnvio && (
              <div className="entrega" role="radiogroup" aria-label="Cómo lo recibís">
                <button type="button" role="radio" aria-checked={entrega === "retiro"} className={entrega === "retiro" ? "on" : ""} onClick={() => setEntrega("retiro")}>
                  <b>Retiro</b>
                  <small>Listo en {local.demoraLlevar} min</small>
                </button>
                <button type="button" role="radio" aria-checked={entrega === "envio"} className={entrega === "envio" ? "on" : ""} onClick={() => setEntrega("envio")}>
                  <b>Envío {zonas.length ? `desde ${plata(desde)}` : plata(local.delivery.costo)}</b>
                  <small>Llega en {local.delivery.demora} min</small>
                </button>
              </div>
            )}
            <ul className="bolsa-items">
              {bolsa.map((i) => (
                <li key={claveItem(i)}>
                  <span>
                    {i.nombre}
                    {(i.opciones?.length || i.nota) && <small className="linea-ops">{[...(i.opciones ?? []), i.nota].filter(Boolean).join(" · ")}</small>}
                  </span>
                  <span className="pl-cant">
                    <button type="button" onClick={() => sumar(i, -1)} aria-label={"Quitar " + i.nombre}>
                      <Minus size={14} />
                    </button>
                    <b>{i.cant}</b>
                    <button type="button" onClick={() => sumar(i, 1)} aria-label={"Sumar " + i.nombre}>
                      <Plus size={14} />
                    </button>
                  </span>
                  <b>{plata(i.precio * i.cant)}</b>
                </li>
              ))}
            </ul>
            {envio > 0 && (
              <p className="bolsa-linea">
                <span>Envío</span>
                <span>{plata(envio)}</span>
              </p>
            )}
            <p className="bolsa-total">
              <span>Total</span>
              <b>{plata(subtotal + envio)}</b>
            </p>
            {entrega === "envio" && (
              <p className="nota-chica">
                {zona ? `Envío a ${zona.nombre}: ${plata(zona.costo)}.` : `Envíos a ${local.delivery.zona || "la zona"}.`} {falta > 0 ? `Pedido mínimo ${plata(env.minimo)}: te faltan ${plata(falta)}.` : ""}
              </p>
            )}
            <div className="campos">
              <label>
                Nombre
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" />
              </label>
              <label>
                WhatsApp
                <input value={tel} onChange={(e) => setTel(e.target.value)} inputMode="tel" autoComplete="tel" />
              </label>
              {entrega === "envio" && zonas.length > 0 && (
                <label className="ancho">
                  Barrio
                  <select value={zonaSel} onChange={(e) => setZona(e.target.value)}>
                    <option value="">Elegí tu barrio…</option>
                    {zonas.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.nombre} · envío {plata(z.costo)}
                        {z.minimo ? ` · mínimo ${plata(z.minimo)}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {entrega === "envio" && (
                <label className="ancho">
                  Dirección de entrega
                  <input value={direccion} onChange={(e) => setDireccion(e.target.value)} autoComplete="street-address" placeholder="Calle, número, piso y depto." />
                </label>
              )}
              <label>
                {entrega === "envio" ? "¿Para cuándo?" : "Lo retiro"}
                <select value={hora} onChange={(e) => setHora(e.target.value)} disabled={!horas.length}>
                  {horas.length ? (
                    <>
                      <option value="Cuanto antes">Cuanto antes</option>
                      {horas.map((h) => (
                        <option key={h} value={h}>
                          {entrega === "envio" ? "Para las " : "A las "}
                          {h}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value="">Sin horarios hoy</option>
                  )}
                </select>
              </label>
              <label>
                Pago
                <select value={pago} onChange={(e) => setPago(e.target.value as Medio)}>
                  {PAGOS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                      {p.id !== "transferencia" ? (entrega === "envio" ? " al recibir" : " al retirar") : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="ancho">
                Aclaraciones <small>(opcional)</small>
                <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Sin cebolla, timbre que no anda…" />
              </label>
            </div>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button className="btn btn-1 ancho" type="submit">
              Hacer el pedido · {plata(subtotal + envio)}
            </button>
          </form>
        )}
      </aside>
    </div>
  );
}
