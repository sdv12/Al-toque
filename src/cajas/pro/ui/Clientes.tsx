"use client";

import { useState } from "react";
import { hacer } from "../lib/estado";
import { guardarCliente, nombreDe, normalizar, pagoCuenta, saldo, sesionAbierta } from "../lib/logica";
import { MEDIOS, type Cliente, type CondicionIva, type EstadoPro, type Medio } from "../lib/tipos";
import { Cabecera, Campo, Etiqueta, Icono, Modal, Vacio, aNumero, boton, control, fechaHora, plata, tarjeta, useAviso } from "./comunes";

type Abierto = { tipo: "editar"; c: Cliente | null } | { tipo: "cuenta"; c: Cliente } | { tipo: "pago"; c: Cliente };

export default function Clientes({ e }: { e: EstadoPro }) {
  const [texto, setTexto] = useState("");
  const [abierto, setAbierto] = useState<Abierto | null>(null);
  const q = normalizar(texto);
  const lista = e.clientes.filter((c) => !q || normalizar(`${c.nombre} ${c.documento}`).includes(q));
  const totalDeuda = e.clientes.reduce((t, c) => t + saldo(e, c.id), 0);

  return (
    <>
      <Cabecera titulo="Clientes" bajada={`Cuentas corrientes: te deben ${plata(totalDeuda)} en total.`}>
        <button type="button" className={boton.primario} onClick={() => setAbierto({ tipo: "editar", c: null })}>
          <Icono nombre="mas" className="size-4" /> Nuevo cliente
        </button>
      </Cabecera>
      <label className="relative mb-4 block max-w-md">
        <span className="sr-only">Buscar cliente</span>
        <Icono nombre="buscar" className="absolute top-2.5 left-3 size-5 text-slate-500" />
        <input className={`${control} pl-10`} placeholder="Nombre, CUIT o DNI" value={texto} onChange={(ev) => setTexto(ev.target.value)} />
      </label>
      <div className={`${tarjeta} overflow-x-auto`}>
        {lista.length === 0 ? (
          <Vacio>No hay clientes con esa búsqueda.</Vacio>
        ) : (
          <table className="w-full min-w-[46rem] text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-600">
              <tr>
                <th className="px-4 py-2.5 font-medium">Cliente</th>
                <th className="px-4 py-2.5 font-medium">Condición IVA</th>
                <th className="px-4 py-2.5 text-right font-medium">Debe</th>
                <th className="px-4 py-2.5 font-medium">Crédito usado</th>
                <th className="px-4 py-2.5 font-medium"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lista.map((c) => {
                const debe = saldo(e, c.id);
                const uso = c.limite ? Math.min(1, debe / c.limite) : 0;
                return (
                  <tr key={c.id}>
                    <td className="px-4 py-2">
                      <span className="block font-medium">{c.nombre}</span>
                      <span className="text-xs text-slate-600">{c.documento || "Sin documento"}</span>
                    </td>
                    <td className="px-4 py-2">{c.condicionIva}</td>
                    <td className="px-4 py-2 text-right font-medium tabular-nums">{plata(debe)}</td>
                    <td className="px-4 py-2">
                      {c.limite ? (
                        <span className="flex items-center gap-2" title={`${plata(debe)} de ${plata(c.limite)}`}>
                          <span className="h-2 w-24 overflow-hidden rounded-full bg-slate-200" aria-hidden>
                            <span className={`block h-full rounded-full ${uso > 0.85 ? "bg-red-600" : "bg-teal-700"}`} style={{ width: `${uso * 100}%` }} />
                          </span>
                          <span className="text-xs text-slate-700 tabular-nums">
                            {Math.round(uso * 100)} % de {plata(c.limite)}
                          </span>
                        </span>
                      ) : (
                        <Etiqueta>Sin cuenta corriente</Etiqueta>
                      )}
                    </td>
                    <td className="px-2 py-2 text-right whitespace-nowrap">
                      {c.limite > 0 && (
                        <button type="button" className={boton.fantasma} onClick={() => setAbierto({ tipo: "cuenta", c })}>
                          Cuenta<span className="sr-only"> de {c.nombre}</span>
                        </button>
                      )}
                      {debe > 0 && (
                        <button type="button" className={boton.fantasma} onClick={() => setAbierto({ tipo: "pago", c })}>
                          Cobrar<span className="sr-only"> a {c.nombre}</span>
                        </button>
                      )}
                      <button type="button" className={boton.fantasma} onClick={() => setAbierto({ tipo: "editar", c })}>
                        Editar<span className="sr-only"> {c.nombre}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {abierto?.tipo === "editar" && <EditarCliente c={abierto.c} onCerrar={() => setAbierto(null)} />}
      {abierto?.tipo === "cuenta" && <Cuenta e={e} c={abierto.c} onCerrar={() => setAbierto(null)} onCobrar={() => setAbierto({ tipo: "pago", c: abierto.c })} />}
      {abierto?.tipo === "pago" && <Cobrar e={e} c={abierto.c} onCerrar={() => setAbierto(null)} />}
    </>
  );
}

function Cuenta({ e, c, onCerrar, onCobrar }: { e: EstadoPro; c: Cliente; onCerrar: () => void; onCobrar: () => void }) {
  const movs = e.cuentas.filter((m) => m.clienteId === c.id).sort((a, b) => b.fecha - a.fecha);
  const debe = saldo(e, c.id);
  const telefono = c.telefono.replace(/\D/g, "");
  const mensaje = `Hola! Te escribimos de ${e.negocio.nombre}. Tu saldo en cuenta corriente es de ${plata(debe)}. ¡Gracias!`;
  return (
    <Modal
      titulo={`Cuenta corriente · ${c.nombre}`}
      onCerrar={onCerrar}
      ancho="max-w-2xl"
      pie={
        <>
          {telefono && debe > 0 && (
            <a className={boton.secundario} href={`https://wa.me/549${telefono}?text=${encodeURIComponent(mensaje)}`} target="_blank" rel="noopener noreferrer">
              <Icono nombre="whatsapp" className="size-4" /> Mandar saldo
            </a>
          )}
          {debe > 0 && (
            <button type="button" className={boton.primario} onClick={onCobrar}>
              Registrar pago
            </button>
          )}
        </>
      }
    >
      <div className="mb-4 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-slate-600">Debe</p>
          <p className="text-lg font-semibold tabular-nums">{plata(debe)}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-slate-600">Límite</p>
          <p className="text-lg font-semibold tabular-nums">{plata(c.limite)}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-slate-600">Disponible</p>
          <p className="text-lg font-semibold tabular-nums">{plata(Math.max(0, c.limite - debe))}</p>
        </div>
      </div>
      {movs.length === 0 ? (
        <Vacio>Sin movimientos.</Vacio>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-slate-600">
            <tr className="border-b border-slate-200">
              <th className="py-2 font-medium">Fecha</th>
              <th className="py-2 font-medium">Detalle</th>
              <th className="py-2 text-right font-medium">Cargo</th>
              <th className="py-2 text-right font-medium">Pago</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {movs.map((m) => (
              <tr key={m.id}>
                <td className="py-2 pr-3 whitespace-nowrap tabular-nums text-slate-700">{fechaHora(m.fecha)}</td>
                <td className="py-2 pr-3">
                  {m.detalle} <span className="text-xs text-slate-600">· {nombreDe(e, m.usuarioId)}</span>
                </td>
                <td className="py-2 text-right tabular-nums">{m.tipo === "cargo" ? plata(m.monto) : ""}</td>
                <td className="py-2 text-right tabular-nums text-emerald-800">{m.tipo === "pago" ? plata(m.monto) : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Modal>
  );
}

function Cobrar({ e, c, onCerrar }: { e: EstadoPro; c: Cliente; onCerrar: () => void }) {
  const aviso = useAviso();
  const debe = saldo(e, c.id);
  const [monto, setMonto] = useState(String(debe));
  const [medio, setMedio] = useState<Exclude<Medio, "cuenta">>("efectivo");
  const [error, setError] = useState<string>();
  const cajaAbierta = !!sesionAbierta(e, e.actual!.sucursalId);
  const enviar = () => {
    const r = hacer((x, ctx) => pagoCuenta(x, c.id, aNumero(monto), medio, ctx));
    if (!r.ok) return setError(r.error);
    aviso(`Pago de ${c.nombre} registrado`);
    onCerrar();
  };
  return (
    <Modal
      titulo={`Cobrar a ${c.nombre}`}
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className={boton.secundario} onClick={onCerrar}>
            Cancelar
          </button>
          <button type="button" className={boton.primario} onClick={enviar} disabled={!cajaAbierta}>
            Registrar pago
          </button>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(ev) => {
          ev.preventDefault();
          enviar();
        }}
      >
        <p className="text-sm text-slate-700">
          Debe <strong>{plata(debe)}</strong>. El pago entra a la caja abierta de esta sucursal.
        </p>
        {!cajaAbierta && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">La caja está cerrada: abrila para cobrar.</p>}
        <Campo etiqueta="Monto" error={error}>
          {(id, d) => <input id={id} aria-describedby={d} aria-invalid={!!error} inputMode="numeric" autoFocus className={control} value={monto} onChange={(ev) => setMonto(ev.target.value)} />}
        </Campo>
        <Campo etiqueta="Cómo paga">
          {(id) => (
            <select id={id} className={control} value={medio} onChange={(ev) => setMedio(ev.target.value as Exclude<Medio, "cuenta">)}>
              {(Object.keys(MEDIOS) as Medio[])
                .filter((m): m is Exclude<Medio, "cuenta"> => m !== "cuenta")
                .map((m) => (
                  <option key={m} value={m}>
                    {MEDIOS[m]}
                  </option>
                ))}
            </select>
          )}
        </Campo>
      </form>
    </Modal>
  );
}

const CONDICIONES: CondicionIva[] = ["Consumidor final", "Monotributo", "Responsable inscripto"];

function EditarCliente({ c, onCerrar }: { c: Cliente | null; onCerrar: () => void }) {
  const aviso = useAviso();
  const [f, setF] = useState({
    nombre: c?.nombre ?? "",
    documento: c?.documento ?? "",
    condicionIva: c?.condicionIva ?? ("Consumidor final" as CondicionIva),
    telefono: c?.telefono ?? "",
    limite: c ? String(c.limite) : "0",
  });
  const [error, setError] = useState<string>();
  const enviar = () => {
    const cliente: Cliente = { id: c?.id ?? "", ...f, limite: aNumero(f.limite) || 0 };
    const r = hacer((x, ctx) => guardarCliente(x, { ...cliente, id: cliente.id || ctx.nuevoId() }, ctx));
    if (!r.ok) return setError(r.error);
    aviso(c ? "Cliente actualizado" : "Cliente agregado");
    onCerrar();
  };
  return (
    <Modal
      titulo={c ? `Editar ${c.nombre}` : "Nuevo cliente"}
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className={boton.secundario} onClick={onCerrar}>
            Cancelar
          </button>
          <button type="button" className={boton.primario} onClick={enviar}>
            Guardar
          </button>
        </>
      }
    >
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(ev) => {
          ev.preventDefault();
          enviar();
        }}
      >
        <div className="sm:col-span-2">
          <Campo etiqueta="Nombre o razón social">{(id) => <input id={id} autoFocus className={control} value={f.nombre} onChange={(ev) => setF({ ...f, nombre: ev.target.value })} />}</Campo>
        </div>
        <Campo etiqueta="Condición frente al IVA" ayuda="Responsable inscripto recibe factura A; el resto, B.">
          {(id, d) => (
            <select id={id} aria-describedby={d} className={control} value={f.condicionIva} onChange={(ev) => setF({ ...f, condicionIva: ev.target.value as CondicionIva })}>
              {CONDICIONES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          )}
        </Campo>
        <Campo etiqueta="CUIT o DNI">{(id) => <input id={id} inputMode="numeric" className={control} value={f.documento} onChange={(ev) => setF({ ...f, documento: ev.target.value })} />}</Campo>
        <Campo etiqueta="WhatsApp">{(id) => <input id={id} type="tel" className={control} value={f.telefono} onChange={(ev) => setF({ ...f, telefono: ev.target.value })} placeholder="351 555-0000" />}</Campo>
        <Campo etiqueta="Límite de cuenta corriente" ayuda="0 = no puede comprar a cuenta. Cambiarlo queda en la auditoría.">
          {(id, d) => <input id={id} aria-describedby={d} inputMode="numeric" className={control} value={f.limite} onChange={(ev) => setF({ ...f, limite: ev.target.value })} />}
        </Campo>
        {error && <p className="text-sm font-medium text-red-700 sm:col-span-2">{error}</p>}
      </form>
    </Modal>
  );
}
