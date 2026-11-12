"use client";

import { useState, type ReactNode } from "react";
import { nombreDe, normalizar } from "../lib/logica";
import { MEDIOS, type Comprobante, type EstadoPro } from "../lib/tipos";
import { Cabecera, Etiqueta, Icono, Modal, QrDemo, Vacio, boton, control, fecha, fechaHora, plata, tarjeta } from "./comunes";

const cuit = (c: string) => (c.length === 11 ? `${c.slice(0, 2)}-${c.slice(2, 10)}-${c.slice(10)}` : c);

/** El comprobante como sale impreso. En la demo dice "sin validez fiscal" y el CAE es inventado. */
export function VistaComprobante({ e, c }: { e: EstadoPro; c: Comprobante }) {
  const sucursal = e.sucursales.find((s) => s.id === c.sucursalId);
  const cliente = c.clienteId ? e.clientes.find((x) => x.id === c.clienteId) : undefined;
  const letra = c.tipo.slice(-1);
  // En la A se discrimina el IVA (21 %); los precios de la demo son finales.
  const neto = Math.round(c.total / 1.21);
  return (
    <article data-imprimir className="relative overflow-hidden bg-white text-[13px] text-slate-900">
      <p aria-hidden className="pointer-events-none absolute inset-0 grid -rotate-12 place-items-center text-5xl font-black tracking-widest text-slate-900/[0.06]">
        DEMO · SIN VALIDEZ FISCAL
      </p>
      <header className="grid grid-cols-[1fr_auto_1fr] gap-3 border-b-2 border-slate-900 pb-3">
        <div>
          <p className="text-base font-bold">{e.negocio.nombre}</p>
          <p>{e.negocio.razonSocial}</p>
          <p>{sucursal?.direccion}, Córdoba</p>
          <p>IVA Responsable inscripto</p>
        </div>
        <div className="flex flex-col items-center">
          <span className="grid size-12 place-items-center border-2 border-slate-900 text-3xl font-bold">{letra}</span>
          <span className="mt-1 text-[10px]">Cód. {letra === "A" ? "001" : "006"}</span>
        </div>
        <div className="text-right">
          <p className="text-base font-bold">FACTURA</p>
          <p>Nº {c.numero}</p>
          <p>Fecha: {fecha(c.fecha)}</p>
          <p>CUIT: {cuit(e.negocio.cuit)}</p>
        </div>
      </header>
      <section className="grid gap-x-6 gap-y-0.5 border-b border-slate-300 py-3 sm:grid-cols-2">
        <p>
          <span className="text-slate-600">Cliente:</span> {c.clienteNombre}
        </p>
        <p>
          <span className="text-slate-600">{c.documento.length === 11 ? "CUIT" : "DNI"}:</span> {c.documento ? cuit(c.documento) : "—"}
        </p>
        <p>
          <span className="text-slate-600">Condición IVA:</span> {cliente?.condicionIva ?? "Consumidor final"}
        </p>
        <p>
          <span className="text-slate-600">Pago:</span> {MEDIOS[c.medio]}
        </p>
      </section>
      <table className="my-3 w-full">
        <thead>
          <tr className="border-b border-slate-300 text-left text-xs text-slate-600">
            <th className="py-1 font-medium">Producto</th>
            <th className="py-1 text-right font-medium">Cant.</th>
            <th className="py-1 text-right font-medium">Precio</th>
            <th className="py-1 text-right font-medium">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {c.lineas.map((l) => (
            <tr key={l.productoId} className="border-b border-slate-100">
              <td className="py-1 pr-2">{l.nombre}</td>
              <td className="py-1 text-right tabular-nums">{l.cantidad}</td>
              <td className="py-1 text-right tabular-nums">{plata(letra === "A" ? Math.round(l.precio / 1.21) : l.precio)}</td>
              <td className="py-1 text-right tabular-nums">{plata(letra === "A" ? Math.round((l.precio * l.cantidad) / 1.21) : l.precio * l.cantidad)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="ml-auto w-full max-w-60 space-y-0.5">
        {letra === "A" && (
          <>
            <p className="flex justify-between">
              <span>Neto gravado</span>
              <span className="tabular-nums">{plata(neto)}</span>
            </p>
            <p className="flex justify-between">
              <span>IVA 21 %</span>
              <span className="tabular-nums">{plata(c.total - neto)}</span>
            </p>
          </>
        )}
        <p className="flex justify-between border-t border-slate-900 pt-1 text-base font-bold">
          <span>Total</span>
          <span className="tabular-nums">{plata(c.total)}</span>
        </p>
      </div>
      <footer className="mt-4 flex items-end gap-4 border-t border-slate-300 pt-3">
        <QrDemo texto={`arca-${c.cae}`} className="size-20" />
        <div className="text-xs">
          <p className="font-semibold">Comprobante autorizado (demo)</p>
          <p>CAE: {c.cae}</p>
          <p>Vto. CAE: {fecha(c.vencimientoCae)}</p>
          <p className="mt-1 text-slate-600">Atendió: {nombreDe(e, c.emitidoPor)}</p>
        </div>
      </footer>
    </article>
  );
}

export function ModalComprobante({ e, c, onCerrar, extra }: { e: EstadoPro; c: Comprobante; onCerrar: () => void; extra?: ReactNode }) {
  return (
    <Modal
      titulo={`${c.tipo} ${c.numero}`}
      onCerrar={onCerrar}
      ancho="max-w-2xl"
      pie={
        <>
          {extra}
          <button type="button" className={boton.secundario} onClick={() => window.print()}>
            <Icono nombre="imprimir" className="size-4" /> Imprimir
          </button>
          <button type="button" className={boton.primario} onClick={onCerrar}>
            Listo
          </button>
        </>
      }
    >
      <VistaComprobante e={e} c={c} />
    </Modal>
  );
}

export default function Comprobantes({ e }: { e: EstadoPro }) {
  const [texto, setTexto] = useState("");
  const [sucursal, setSucursal] = useState<string>(e.actual?.sucursalId ?? "");
  const [abierto, setAbierto] = useState<Comprobante | null>(null);
  const q = normalizar(texto);
  const lista = e.comprobantes
    .filter((c) => (!sucursal || c.sucursalId === sucursal) && (!q || normalizar(`${c.numero} ${c.clienteNombre} ${c.tipo}`).includes(q)))
    .sort((a, b) => b.fecha - a.fecha);
  const visibles = lista.slice(0, 80);

  return (
    <>
      <Cabecera titulo="Comprobantes" bajada="Cada venta sale con su factura electrónica. En la demo el CAE es de prueba; en la real lo autoriza ARCA en el momento." />
      <div className="mb-4 flex flex-wrap gap-3">
        <label className="relative min-w-60 flex-1">
          <span className="sr-only">Buscar comprobante</span>
          <Icono nombre="buscar" className="absolute top-2.5 left-3 size-5 text-slate-500" />
          <input className={`${control} pl-10`} placeholder="Número, cliente o tipo" value={texto} onChange={(ev) => setTexto(ev.target.value)} />
        </label>
        <label className="w-48">
          <span className="sr-only">Sucursal</span>
          <select className={control} value={sucursal} onChange={(ev) => setSucursal(ev.target.value)}>
            <option value="">Todas las sucursales</option>
            {e.sucursales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className={`${tarjeta} overflow-x-auto`}>
        {visibles.length === 0 ? (
          <Vacio>No hay comprobantes con esa búsqueda.</Vacio>
        ) : (
          <table className="w-full min-w-[46rem] text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-600">
              <tr>
                <th className="px-4 py-2.5 font-medium">Fecha</th>
                <th className="px-4 py-2.5 font-medium">Comprobante</th>
                <th className="px-4 py-2.5 font-medium">Cliente</th>
                <th className="px-4 py-2.5 font-medium">Pago</th>
                <th className="px-4 py-2.5 font-medium">Sucursal</th>
                <th className="px-4 py-2.5 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibles.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 whitespace-nowrap tabular-nums text-slate-700">{fechaHora(c.fecha)}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <button type="button" className="font-medium text-teal-800 underline-offset-2 hover:underline" onClick={() => setAbierto(c)}>
                      {c.tipo} {c.numero}
                    </button>
                  </td>
                  <td className="px-4 py-2">{c.clienteNombre}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{c.medio === "cuenta" ? <Etiqueta tono="ambar">A cuenta</Etiqueta> : MEDIOS[c.medio]}</td>
                  <td className="px-4 py-2">{e.sucursales.find((s) => s.id === c.sucursalId)?.nombre}</td>
                  <td className="px-4 py-2 text-right font-medium tabular-nums">{plata(c.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {lista.length > visibles.length && <p className="mt-2 text-xs text-slate-600">Se muestran los últimos {visibles.length} de {lista.length}. Buscá para encontrar uno más viejo.</p>}
      {abierto && <ModalComprobante e={e} c={abierto} onCerrar={() => setAbierto(null)} />}
    </>
  );
}
