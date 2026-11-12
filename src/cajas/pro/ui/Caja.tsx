"use client";

import { useState } from "react";
import { hacer } from "../lib/estado";
import { abrirCaja, cerrarCaja, movimientoManual, nombreDe, puede, sesionAbierta, totalesSesion, usuarioActual } from "../lib/logica";
import { MEDIOS, type Comprobante, type EstadoPro, type Medio } from "../lib/tipos";
import { Cabecera, Campo, Etiqueta, Icono, Kpi, Modal, Vacio, aNumero, boton, control, fechaHora, hora, plata, tarjeta, useAviso } from "./comunes";
import { ModalComprobante } from "./Comprobantes";
import Venta from "./Venta";

type Abierto = { tipo: "venta" } | { tipo: "abrir" } | { tipo: "cerrar" } | { tipo: "manual"; mov: "ingreso" | "egreso" } | { tipo: "comprobante"; c: Comprobante };

export default function Caja({ e }: { e: EstadoPro }) {
  const [abierto, setAbierto] = useState<Abierto | null>(null);
  const yo = usuarioActual(e)!;
  const sucursalId = e.actual!.sucursalId;
  const sucursal = e.sucursales.find((s) => s.id === sucursalId)!;
  const sesion = sesionAbierta(e, sucursalId);
  const t = sesion ? totalesSesion(sesion, e.movimientos) : null;
  const manejaCaja = puede(yo, "caja");
  const veMargen = puede(yo, "reportes");
  const movimientos = sesion ? e.movimientos.filter((m) => m.sesionId === sesion.id).sort((a, b) => b.fecha - a.fecha) : [];
  const cierres = e.sesiones
    .filter((s) => s.sucursalId === sucursalId && s.cierre)
    .sort((a, b) => b.cierre! - a.cierre!)
    .slice(0, 8);
  const cerrar = () => setAbierto(null);

  return (
    <>
      <Cabecera
        titulo={`Caja · ${sucursal.nombre}`}
        bajada={sesion ? `Abierta por ${nombreDe(e, sesion.abiertaPor)} a las ${hora(sesion.apertura)} con ${plata(sesion.fondo)} de fondo.` : "La caja está cerrada."}
      >
        {sesion && puede(yo, "vender") && (
          <button type="button" className={boton.primario} onClick={() => setAbierto({ tipo: "venta" })}>
            <Icono nombre="mas" className="size-4" /> Nueva venta
          </button>
        )}
        {sesion && manejaCaja && (
          <>
            <button type="button" className={boton.secundario} onClick={() => setAbierto({ tipo: "manual", mov: "ingreso" })}>
              Ingreso
            </button>
            <button type="button" className={boton.secundario} onClick={() => setAbierto({ tipo: "manual", mov: "egreso" })}>
              Egreso
            </button>
            <button type="button" className={boton.secundario} onClick={() => setAbierto({ tipo: "cerrar" })}>
              Cerrar caja
            </button>
          </>
        )}
      </Cabecera>

      {!sesion ? (
        <div className={`${tarjeta} flex flex-wrap items-center justify-between gap-4 p-6`}>
          <div>
            <p className="font-semibold">La caja de {sucursal.nombre} está cerrada</p>
            <p className="text-sm text-slate-600">
              {manejaCaja ? "Abrila con el efectivo que hay en el cajón para empezar a vender." : "Pedile a alguien con permiso de caja que la abra."}
            </p>
          </div>
          {manejaCaja && (
            <button type="button" className={boton.primario} onClick={() => setAbierto({ tipo: "abrir" })}>
              Abrir caja
            </button>
          )}
        </div>
      ) : (
        t && (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Kpi titulo="Vendido" valor={plata(t.ventas)} detalle={`${t.cantidad} ${t.cantidad === 1 ? "venta" : "ventas"}`} />
              <Kpi titulo="Efectivo en el cajón" valor={plata(t.esperado)} detalle={`Fondo ${plata(sesion.fondo)} + movimientos`} />
              <Kpi titulo="Ingresos y egresos" valor={`${plata(t.ingresos)} / −${plata(t.egresos)}`} detalle="Cobros de cuentas, gastos" />
              {veMargen ? (
                <Kpi titulo="Margen" valor={plata(t.margen)} detalle={t.ventas ? `${Math.round((t.margen / t.ventas) * 100)} % de lo vendido` : "Sin ventas todavía"} />
              ) : (
                <Kpi titulo="Ticket promedio" valor={plata(t.cantidad ? Math.round(t.ventas / t.cantidad) : 0)} />
              )}
            </div>

            <section className={`${tarjeta} mt-4 p-4`} aria-labelledby="medios-titulo">
              <h2 id="medios-titulo" className="text-sm font-semibold">
                Por medio de pago
              </h2>
              <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-6">
                {(Object.keys(MEDIOS) as Medio[]).map((m) => (
                  <div key={m}>
                    <dt className="text-xs text-slate-600">{MEDIOS[m]}</dt>
                    <dd className="font-semibold tabular-nums">{plata(t.porMedio[m])}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className={`${tarjeta} mt-4 overflow-x-auto`} aria-labelledby="movs-titulo">
              <h2 id="movs-titulo" className="px-4 pt-4 text-sm font-semibold">
                Movimientos de esta caja
              </h2>
              {movimientos.length === 0 ? (
                <Vacio>Todavía no hubo movimientos.</Vacio>
              ) : (
                <table className="mt-2 w-full min-w-[40rem] text-sm">
                  <thead className="bg-slate-50 text-left text-xs text-slate-600">
                    <tr>
                      <th className="px-4 py-2 font-medium">Hora</th>
                      <th className="px-4 py-2 font-medium">Detalle</th>
                      <th className="px-4 py-2 font-medium">Medio</th>
                      <th className="px-4 py-2 font-medium">Quién</th>
                      <th className="px-4 py-2 text-right font-medium">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {movimientos.map((m) => {
                      const c = m.comprobanteId ? e.comprobantes.find((x) => x.id === m.comprobanteId) : undefined;
                      return (
                        <tr key={m.id}>
                          <td className="px-4 py-2 tabular-nums text-slate-700">{hora(m.fecha)}</td>
                          <td className="px-4 py-2">
                            {c ? (
                              <button type="button" className="text-left font-medium text-teal-800 hover:underline" onClick={() => setAbierto({ tipo: "comprobante", c })}>
                                {m.detalle}
                              </button>
                            ) : (
                              <span className="flex flex-wrap items-center gap-2">
                                <Etiqueta tono={m.tipo === "egreso" ? "rojo" : "azul"}>{m.tipo === "egreso" ? "Egreso" : "Ingreso"}</Etiqueta>
                                {m.detalle}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">{MEDIOS[m.medio]}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-slate-700">{nombreDe(e, m.usuarioId)}</td>
                          <td className={`px-4 py-2 text-right font-medium tabular-nums ${m.tipo === "egreso" ? "text-red-700" : ""}`}>
                            {m.tipo === "egreso" ? "−" : ""}
                            {plata(m.monto)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </section>
          </>
        )
      )}

      {manejaCaja && (
        <section className={`${tarjeta} mt-4 overflow-x-auto`} aria-labelledby="cierres-titulo">
          <h2 id="cierres-titulo" className="px-4 pt-4 text-sm font-semibold">
            Cierres anteriores
          </h2>
          {cierres.length === 0 ? (
            <Vacio>Todavía no hay cierres.</Vacio>
          ) : (
            <table className="mt-2 w-full min-w-[44rem] text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-600">
                <tr>
                  <th className="px-4 py-2 font-medium">Cierre</th>
                  <th className="px-4 py-2 font-medium">Cerró</th>
                  <th className="px-4 py-2 text-right font-medium">Esperado</th>
                  <th className="px-4 py-2 text-right font-medium">Contado</th>
                  <th className="px-4 py-2 font-medium">Diferencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cierres.map((s) => {
                  const dif = (s.contado ?? 0) - (s.esperado ?? 0);
                  return (
                    <tr key={s.id}>
                      <td className="px-4 py-2 tabular-nums text-slate-700">{fechaHora(s.cierre!)}</td>
                      <td className="px-4 py-2">{nombreDe(e, s.cerradaPor ?? "")}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{plata(s.esperado ?? 0)}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{plata(s.contado ?? 0)}</td>
                      <td className="px-4 py-2">
                        {dif === 0 ? (
                          <Etiqueta tono="verde">Sin diferencia</Etiqueta>
                        ) : (
                          <span className="flex flex-wrap items-center gap-2">
                            <Etiqueta tono="rojo">
                              <Icono nombre="alerta" className="size-3.5" />
                              {dif > 0 ? "Sobran" : "Faltan"} {plata(Math.abs(dif))}
                            </Etiqueta>
                            <span className="text-xs text-slate-700">{s.motivo}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      )}

      {abierto?.tipo === "venta" && <Venta e={e} onCerrar={cerrar} onVendida={(c) => setAbierto({ tipo: "comprobante", c })} />}
      {abierto?.tipo === "comprobante" && (
        <ModalComprobante
          e={e}
          c={abierto.c}
          onCerrar={cerrar}
          extra={
            sesion &&
            puede(yo, "vender") && (
              <button type="button" className={boton.secundario} onClick={() => setAbierto({ tipo: "venta" })}>
                Otra venta
              </button>
            )
          }
        />
      )}
      {abierto?.tipo === "abrir" && <AbrirCaja onCerrar={cerrar} />}
      {abierto?.tipo === "cerrar" && t && sesion && <CerrarCaja esperado={t.esperado} fondo={sesion.fondo} onCerrar={cerrar} />}
      {abierto?.tipo === "manual" && <MovimientoManual tipo={abierto.mov} onCerrar={cerrar} />}
    </>
  );
}

function AbrirCaja({ onCerrar }: { onCerrar: () => void }) {
  const aviso = useAviso();
  const [fondo, setFondo] = useState("");
  const [error, setError] = useState<string>();
  const enviar = () => {
    const r = hacer((x, c) => abrirCaja(x, aNumero(fondo), c));
    if (!r.ok) return setError(r.error);
    aviso("Caja abierta");
    onCerrar();
  };
  return (
    <Modal
      titulo="Abrir caja"
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className={boton.secundario} onClick={onCerrar}>
            Cancelar
          </button>
          <button type="button" className={boton.primario} onClick={enviar}>
            Abrir
          </button>
        </>
      }
    >
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          enviar();
        }}
      >
        <Campo etiqueta="Efectivo con el que arranca (fondo)" ayuda="Lo que hay en el cajón para dar vuelto." error={error}>
          {(id, d) => <input id={id} aria-describedby={d} aria-invalid={!!error} inputMode="numeric" autoFocus className={control} value={fondo} onChange={(ev) => setFondo(ev.target.value)} placeholder="20000" />}
        </Campo>
      </form>
    </Modal>
  );
}

function CerrarCaja({ esperado, fondo, onCerrar }: { esperado: number; fondo: number; onCerrar: () => void }) {
  const aviso = useAviso();
  const [contado, setContado] = useState("");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string>();
  const n = aNumero(contado);
  const dif = Number.isNaN(n) ? null : n - esperado;
  const enviar = () => {
    const r = hacer((x, c) => cerrarCaja(x, n, motivo, c));
    if (!r.ok) return setError(r.error);
    aviso(dif ? "Caja cerrada con diferencia: quedó registrada" : "Caja cerrada sin diferencias");
    onCerrar();
  };
  return (
    <Modal
      titulo="Cerrar caja (arqueo)"
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className={boton.secundario} onClick={onCerrar}>
            Cancelar
          </button>
          <button type="button" className={boton.primario} onClick={enviar}>
            Cerrar caja
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
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-slate-600">Fondo inicial</p>
            <p className="font-semibold tabular-nums">{plata(fondo)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-slate-600">Tendría que haber</p>
            <p className="font-semibold tabular-nums">{plata(esperado)}</p>
          </div>
        </div>
        <Campo etiqueta="Efectivo contado" error={!dif ? error : undefined}>
          {(id, d) => <input id={id} aria-describedby={d} inputMode="numeric" autoFocus className={control} value={contado} onChange={(ev) => setContado(ev.target.value)} />}
        </Campo>
        {dif !== null && (
          <p className={`rounded-lg p-3 text-sm font-medium ${dif === 0 ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"}`}>
            {dif === 0 ? "Coincide: sin diferencias." : `${dif > 0 ? "Sobran" : "Faltan"} ${plata(Math.abs(dif))}. Queda registrado en la auditoría.`}
          </p>
        )}
        {!!dif && (
          <Campo etiqueta="Motivo de la diferencia" error={error}>
            {(id, d) => <textarea id={id} aria-describedby={d} aria-invalid={!!error} rows={2} className={`${control} py-2`} value={motivo} onChange={(ev) => setMotivo(ev.target.value)} />}
          </Campo>
        )}
      </form>
    </Modal>
  );
}

function MovimientoManual({ tipo, onCerrar }: { tipo: "ingreso" | "egreso"; onCerrar: () => void }) {
  const aviso = useAviso();
  const [monto, setMonto] = useState("");
  const [medio, setMedio] = useState<Exclude<Medio, "cuenta">>("efectivo");
  const [detalle, setDetalle] = useState("");
  const [error, setError] = useState<string>();
  const enviar = () => {
    const r = hacer((x, c) => movimientoManual(x, { tipo, medio, monto: aNumero(monto), detalle }, c));
    if (!r.ok) return setError(r.error);
    aviso(tipo === "egreso" ? "Egreso registrado" : "Ingreso registrado");
    onCerrar();
  };
  return (
    <Modal
      titulo={tipo === "egreso" ? "Sacar plata de la caja" : "Poner plata en la caja"}
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className={boton.secundario} onClick={onCerrar}>
            Cancelar
          </button>
          <button type="button" className={tipo === "egreso" ? boton.peligro : boton.primario} onClick={enviar}>
            Registrar {tipo}
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
        <Campo etiqueta="Monto">
          {(id) => <input id={id} inputMode="numeric" autoFocus className={control} value={monto} onChange={(ev) => setMonto(ev.target.value)} />}
        </Campo>
        <Campo etiqueta="Medio">
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
        <Campo etiqueta={tipo === "egreso" ? "¿En qué se gastó?" : "¿De dónde viene?"} error={error} ayuda={tipo === "egreso" ? "Los egresos quedan marcados para revisar en la auditoría." : undefined}>
          {(id, d) => <input id={id} aria-describedby={d} aria-invalid={!!error} className={control} value={detalle} onChange={(ev) => setDetalle(ev.target.value)} />}
        </Campo>
      </form>
    </Modal>
  );
}
