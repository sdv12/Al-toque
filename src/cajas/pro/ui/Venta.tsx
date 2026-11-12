"use client";

import { useMemo, useRef, useState } from "react";
import { hacer } from "../lib/estado";
import { buscarProductos, porCodigo, saldo, stockDe, tipoPara, totalCarrito, validarVenta, vender } from "../lib/logica";
import { MEDIOS, type Comprobante, type EstadoPro, type ItemCarrito, type Medio } from "../lib/tipos";
import { Icono, Modal, QrDemo, boton, control, plata, useAviso } from "./comunes";

/**
 * Nueva venta. El buscador también recibe el lector de código de barras: el lector "tipea" el
 * código y manda Enter; si coincide con un producto, entra al carrito y el buscador queda listo
 * para el siguiente.
 */
export default function Venta({ e, onCerrar, onVendida }: { e: EstadoPro; onCerrar: () => void; onVendida: (c: Comprobante) => void }) {
  const aviso = useAviso();
  const sucursalId = e.actual!.sucursalId;
  const [texto, setTexto] = useState("");
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [clienteId, setClienteId] = useState<string>("");
  const [medio, setMedio] = useState<Medio>("efectivo");
  const [qr, setQr] = useState<string | null>(null);
  const buscador = useRef<HTMLInputElement>(null);

  const resultados = useMemo(() => buscarProductos(e, texto).slice(0, 40), [e, texto]);
  const cantidadDe = (id: string) => carrito.find((c) => c.productoId === id)?.cantidad ?? 0;
  const { total } = totalCarrito(e, carrito);
  const cliente = e.clientes.find((c) => c.id === clienteId);
  const error = validarVenta(e, carrito, medio, clienteId || null);
  const ejemplo = e.productos.find((p) => p.activo && stockDe(e, sucursalId, p.id) > 3);

  function sumar(productoId: string, delta = 1) {
    const hay = stockDe(e, sucursalId, productoId);
    setCarrito((c) => {
      const actual = c.find((x) => x.productoId === productoId)?.cantidad ?? 0;
      const nueva = Math.min(hay, actual + delta);
      if (nueva <= 0) return c.filter((x) => x.productoId !== productoId);
      return actual ? c.map((x) => (x.productoId === productoId ? { ...x, cantidad: nueva } : x)) : [...c, { productoId, cantidad: nueva }];
    });
  }

  function alEnter() {
    const p = porCodigo(e, texto);
    if (p) {
      if (cantidadDe(p.id) >= stockDe(e, sucursalId, p.id)) aviso(`No queda más ${p.nombre} en esta sucursal.`, "error");
      else {
        sumar(p.id);
        aviso(`${p.nombre} agregado`);
      }
      setTexto("");
    } else if (resultados.length === 1) {
      sumar(resultados[0]!.id);
      setTexto("");
    } else if (/^\d{6,}$/.test(texto.trim())) aviso(`No hay ningún producto con el código ${texto.trim()}.`, "error");
  }

  function cobrar(referencia?: string) {
    const medioFinal = referencia ? "qr" : medio;
    const r = hacer((x, ctx) => vender(x, { carrito, medio: medioFinal, clienteId: clienteId || null, referencia }, ctx));
    if (!r.ok) return aviso(r.error, "error");
    onVendida(r.valor);
  }

  return (
    <Modal titulo="Nueva venta" onCerrar={onCerrar} ancho="max-w-5xl">
      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-3">
          <label className="relative block">
            <span className="sr-only">Buscar producto o escanear código</span>
            <Icono nombre="escaner" className="absolute top-2.5 left-3 size-5 text-slate-500" />
            <input
              ref={buscador}
              autoFocus
              className={`${control} pl-10`}
              placeholder="Buscá por nombre o pasá el lector de código de barras"
              value={texto}
              onChange={(ev) => setTexto(ev.target.value)}
              onKeyDown={(ev) => {
                if (ev.key === "Enter") {
                  ev.preventDefault();
                  alEnter();
                }
              }}
            />
          </label>
          {ejemplo && (
            <p className="mt-2 text-xs text-slate-600">
              Probá el lector: escribí{" "}
              <button
                type="button"
                className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-800 hover:bg-slate-200"
                onClick={() => {
                  setTexto(ejemplo.codigo);
                  buscador.current?.focus();
                }}
              >
                {ejemplo.codigo}
              </button>{" "}
              y apretá Enter, como hace el lector.
            </p>
          )}
          <ul className="mt-3 max-h-[30dvh] divide-y md:max-h-[46dvh] divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
            {resultados.map((p) => {
              const hay = stockDe(e, sucursalId, p.id) - cantidadDe(p.id);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    disabled={hay <= 0}
                    onClick={() => sumar(p.id)}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{p.nombre}</span>
                      <span className="block text-xs text-slate-600">
                        {p.marca} · {p.codigo} · {hay > 0 ? `quedan ${hay}` : "sin stock acá"}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">{plata(p.precio)}</span>
                  </button>
                </li>
              );
            })}
            {resultados.length === 0 && <li className="px-3 py-8 text-center text-sm text-slate-600">No hay productos con «{texto}».</li>}
          </ul>
        </div>

        <div className="flex flex-col md:col-span-2 md:border-l md:border-slate-200 md:pl-6">
          {qr ? (
            <div className="flex flex-col items-center text-center">
              <p className="text-sm font-semibold">Cobro con QR de Mercado Pago</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">{plata(total)}</p>
              <QrDemo texto={qr} className="my-4 size-52 rounded-lg border border-slate-200 p-2" />
              <p className="flex items-center gap-2 text-sm text-slate-700">
                <span className="size-2.5 animate-pulse rounded-full bg-sky-500" aria-hidden /> Esperando que el cliente pague…
              </p>
              <p className="mt-2 text-xs text-slate-600">En la caja real el QR es de tu cuenta y la venta se cierra sola cuando Mercado Pago avisa que entró la plata.</p>
              <div className="mt-4 flex w-full flex-col gap-2">
                <button type="button" className={boton.primario} onClick={() => cobrar(qr)}>
                  Simular pago acreditado
                </button>
                <button type="button" className={boton.secundario} onClick={() => setQr(null)}>
                  Volver
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-sm font-semibold">Ticket</h3>
              <ul className="mt-2 max-h-52 flex-1 space-y-2 overflow-y-auto">
                {carrito.map((i) => {
                  const p = e.productos.find((x) => x.id === i.productoId)!;
                  return (
                    <li key={i.productoId} className="flex items-center gap-2 text-sm">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{p.nombre}</span>
                        <span className="text-xs text-slate-600 tabular-nums">
                          {plata(p.precio)} × {i.cantidad} = {plata(p.precio * i.cantidad)}
                        </span>
                      </span>
                      <button type="button" className="grid size-8 place-items-center rounded-md border border-slate-300" onClick={() => sumar(p.id, -1)} aria-label={`Uno menos de ${p.nombre}`}>
                        <Icono nombre="menos" className="size-4" />
                      </button>
                      <span className="w-6 text-center tabular-nums">{i.cantidad}</span>
                      <button
                        type="button"
                        className="grid size-8 place-items-center rounded-md border border-slate-300 disabled:opacity-40"
                        disabled={i.cantidad >= stockDe(e, sucursalId, p.id)}
                        onClick={() => sumar(p.id)}
                        aria-label={`Uno más de ${p.nombre}`}
                      >
                        <Icono nombre="mas" className="size-4" />
                      </button>
                    </li>
                  );
                })}
                {carrito.length === 0 && <li className="py-6 text-center text-sm text-slate-600">Agregá productos de la lista o con el lector.</li>}
              </ul>

              <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Cliente</span>
                  <select className={control} value={clienteId} onChange={(ev) => setClienteId(ev.target.value)}>
                    <option value="">Consumidor final</option>
                    {e.clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1 block text-xs text-slate-600">
                    Sale <strong>{tipoPara(cliente)}</strong>
                    {cliente?.limite ? ` · crédito disponible ${plata(cliente.limite - saldo(e, cliente.id))}` : ""}
                  </span>
                </label>
                <fieldset>
                  <legend className="mb-1 text-sm font-medium">Medio de pago</legend>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(Object.keys(MEDIOS) as Medio[]).map((m) => (
                      <label key={m} className="cursor-pointer">
                        <input type="radio" name="medio" value={m} checked={medio === m} onChange={() => setMedio(m)} className="peer sr-only" />
                        <span className="flex min-h-10 items-center justify-center rounded-lg border border-slate-300 px-1 text-center text-xs leading-tight font-medium peer-checked:border-teal-700 peer-checked:bg-teal-700 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-700">
                          {MEDIOS[m]}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <p className="flex items-baseline justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">{plata(total)}</span>
                </p>
                {carrito.length > 0 && error && <p className="text-xs font-medium text-red-700">{error}</p>}
                <button
                  type="button"
                  className={`${boton.primario} w-full`}
                  disabled={!!error}
                  onClick={() => (medio === "qr" ? setQr(String(1_300_000_000 + (Date.now() % 99_999_999))) : cobrar())}
                >
                  {medio === "qr" ? <><Icono nombre="qr" className="size-4" /> Mostrar QR</> : "Cobrar y facturar"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
