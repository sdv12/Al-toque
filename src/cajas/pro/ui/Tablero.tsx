"use client";

import { useState } from "react";
import { inicioDelDia, masVendidos, nombreDe, resumenEmpleados, resumenVentas, sesionAbierta, stockBajo, stockDe, totalesSesion, ventasPorDia } from "../lib/logica";
import { MEDIOS, type EstadoPro, type Medio } from "../lib/tipos";
import { Cabecera, Etiqueta, Kpi, Vacio, control, diaCorto, hora, plata, tarjeta } from "./comunes";

const corto = (n: number) => (n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1).replace(".", ",")} M` : `$${Math.round(n / 1000)} mil`);

export default function Tablero({ e, ahora }: { e: EstadoPro; ahora: number }) {
  const [periodo, setPeriodo] = useState<"hoy" | "semana">("hoy");
  const [sucursal, setSucursal] = useState<string>("");
  const suc = sucursal || null;
  const desde = periodo === "hoy" ? inicioDelDia(ahora) : inicioDelDia(ahora) - 6 * 86_400_000;
  const r = resumenVentas(e, desde, suc);
  const dias = ventasPorDia(e, suc, 7, ahora);
  const max = Math.max(1, ...dias.map((d) => d.total));
  const empleados = resumenEmpleados(e, desde, suc);
  const top = masVendidos(e, desde, suc);
  const maxMedio = Math.max(1, ...Object.values(r.porMedio));
  const bajos = (suc ? [suc] : e.sucursales.map((s) => s.id)).flatMap((s) => stockBajo(e, s).map((p) => ({ p, s })));

  return (
    <>
      <Cabecera titulo="Tablero" bajada={`${e.negocio.nombre} · todo lo que pasa en tus sucursales, al día.`}>
        <label>
          <span className="sr-only">Período</span>
          <select className={`${control} w-40`} value={periodo} onChange={(ev) => setPeriodo(ev.target.value as "hoy" | "semana")}>
            <option value="hoy">Hoy</option>
            <option value="semana">Últimos 7 días</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Sucursal</span>
          <select className={`${control} w-44`} value={sucursal} onChange={(ev) => setSucursal(ev.target.value)}>
            <option value="">Todas las sucursales</option>
            {e.sucursales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </label>
      </Cabecera>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi titulo="Vendido" valor={plata(r.total)} detalle={periodo === "hoy" ? "Hoy" : "Últimos 7 días"} />
        <Kpi titulo="Ventas" valor={String(r.cantidad)} detalle={`Ticket promedio ${plata(r.ticketPromedio)}`} />
        <Kpi titulo="Margen bruto" valor={plata(r.margen)} detalle={r.total ? `${Math.round((r.margen / r.total) * 100)} % de lo vendido` : "—"} />
        <Kpi titulo="Stock bajo" valor={String(bajos.length)} detalle="Productos en el mínimo o debajo" tono={bajos.length ? "alerta" : "neutro"} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className={`${tarjeta} p-4 lg:col-span-2`} aria-labelledby="dias-titulo">
          <h2 id="dias-titulo" className="text-sm font-semibold">
            Ventas de los últimos 7 días
          </h2>
          <p className="text-xs text-slate-600">{suc ? `Sucursal ${e.sucursales.find((s) => s.id === suc)?.nombre}` : "Las dos sucursales"} · pasá el mouse o tabulá por las columnas</p>
          {/* Columnas de un solo tono: es una sola serie (lo vendido por día). Hoy lleva su valor escrito. */}
          <div className="mt-4 flex h-52 items-end gap-2 border-b border-slate-300">
            {dias.map((d, i) => {
              const esHoy = i === dias.length - 1;
              return (
                <div
                  key={d.dia}
                  tabIndex={0}
                  role="img"
                  aria-label={`${diaCorto(d.dia)}: ${plata(d.total)} en ${d.cantidad} ventas`}
                  className="group relative flex h-full flex-1 flex-col items-center justify-end outline-offset-2"
                >
                  <span className="pointer-events-none absolute bottom-full z-10 mb-1 hidden rounded-md bg-slate-900 px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block group-focus-visible:block">
                    {plata(d.total)} · {d.cantidad} ventas
                  </span>
                  {esHoy && <span className="mb-1 text-xs font-semibold text-slate-900 tabular-nums">{corto(d.total)}</span>}
                  <span
                    className={`block w-full max-w-12 rounded-t-[4px] ${esHoy ? "bg-teal-700" : "bg-teal-700/70"} group-hover:bg-teal-800`}
                    style={{ height: `${Math.max(2, (d.total / max) * (esHoy ? 82 : 92))}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-1.5 flex gap-2" aria-hidden>
            {dias.map((d, i) => (
              <span key={d.dia} className={`flex-1 text-center text-xs capitalize ${i === dias.length - 1 ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                {i === dias.length - 1 ? "Hoy" : diaCorto(d.dia)}
              </span>
            ))}
          </div>
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer text-xs font-medium text-teal-800">Ver como tabla</summary>
            <table className="mt-2 w-full max-w-sm text-sm">
              <thead className="text-left text-xs text-slate-600">
                <tr>
                  <th className="py-1 font-medium">Día</th>
                  <th className="py-1 text-right font-medium">Ventas</th>
                  <th className="py-1 text-right font-medium">Vendido</th>
                </tr>
              </thead>
              <tbody>
                {dias.map((d) => (
                  <tr key={d.dia} className="border-t border-slate-100">
                    <td className="py-1 capitalize">{diaCorto(d.dia)}</td>
                    <td className="py-1 text-right tabular-nums">{d.cantidad}</td>
                    <td className="py-1 text-right tabular-nums">{plata(d.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </section>

        <section className={`${tarjeta} p-4`} aria-labelledby="medios-t">
          <h2 id="medios-t" className="text-sm font-semibold">
            Cómo te pagan
          </h2>
          {r.cantidad === 0 ? (
            <Vacio>Sin ventas en el período.</Vacio>
          ) : (
            <ul className="mt-3 space-y-3">
              {(Object.keys(MEDIOS) as Medio[])
                .filter((m) => r.porMedio[m] > 0)
                .sort((a, b) => r.porMedio[b] - r.porMedio[a])
                .map((m) => (
                  <li key={m}>
                    <span className="flex justify-between text-sm">
                      <span>{MEDIOS[m]}</span>
                      <span className="font-medium tabular-nums">
                        {plata(r.porMedio[m])} <span className="text-xs font-normal text-slate-600">({Math.round((r.porMedio[m] / r.total) * 100)} %)</span>
                      </span>
                    </span>
                    <span className="mt-1 block h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden>
                      <span className="block h-full rounded-full bg-teal-700" style={{ width: `${(r.porMedio[m] / maxMedio) * 100}%` }} />
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className={`${tarjeta} p-4`} aria-labelledby="cajas-t">
          <h2 id="cajas-t" className="text-sm font-semibold">
            Cajas ahora
          </h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {e.sucursales.map((s) => {
              const ses = sesionAbierta(e, s.id);
              const t = ses ? totalesSesion(ses, e.movimientos) : null;
              return (
                <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span>
                    <span className="block text-sm font-medium">{s.nombre}</span>
                    <span className="text-xs text-slate-600">{ses ? `${nombreDe(e, ses.abiertaPor)} desde las ${hora(ses.apertura)}` : "Cerrada"}</span>
                  </span>
                  {t ? <Etiqueta tono="verde">Abierta · {plata(t.ventas)}</Etiqueta> : <Etiqueta>Cerrada</Etiqueta>}
                </li>
              );
            })}
          </ul>
        </section>

        <section className={`${tarjeta} overflow-x-auto p-4`} aria-labelledby="equipo-t">
          <h2 id="equipo-t" className="text-sm font-semibold">
            Equipo
          </h2>
          {empleados.length === 0 ? (
            <Vacio>Sin movimientos en el período.</Vacio>
          ) : (
            <table className="mt-2 w-full text-sm">
              <thead className="text-left text-xs text-slate-600">
                <tr>
                  <th className="py-1.5 font-medium">Persona</th>
                  <th className="py-1.5 text-right font-medium">Ventas</th>
                  <th className="py-1.5 text-right font-medium">Vendido</th>
                  <th className="py-1.5 text-right font-medium">A revisar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {empleados.map((x) => (
                  <tr key={x.usuarioId}>
                    <td className="py-1.5">{nombreDe(e, x.usuarioId)}</td>
                    <td className="py-1.5 text-right tabular-nums">{x.ventas}</td>
                    <td className="py-1.5 text-right tabular-nums">{plata(x.total)}</td>
                    <td className="py-1.5 text-right">{x.sensibles ? <Etiqueta tono="ambar">{x.sensibles}</Etiqueta> : <span className="text-slate-500">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className={`${tarjeta} p-4`} aria-labelledby="top-t">
          <h2 id="top-t" className="text-sm font-semibold">
            Más vendidos
          </h2>
          {top.length === 0 ? (
            <Vacio>Sin ventas en el período.</Vacio>
          ) : (
            <ol className="mt-2 divide-y divide-slate-100">
              {top.map((p, i) => (
                <li key={p.nombre} className="flex items-baseline gap-3 py-1.5 text-sm">
                  <span className="w-4 text-xs text-slate-600 tabular-nums">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate">{p.nombre}</span>
                  <span className="text-xs text-slate-600 tabular-nums">{p.unidades} u.</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {bajos.length > 0 && (
        <section className={`${tarjeta} mt-4 p-4`} aria-labelledby="bajos-t">
          <h2 id="bajos-t" className="text-sm font-semibold">
            Para reponer
          </h2>
          <ul className="mt-2 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {bajos.map(({ p, s }) => (
              <li key={`${s}-${p.id}`} className="flex justify-between gap-3">
                <span className="truncate">
                  {p.nombre} <span className="text-xs text-slate-600">· {e.sucursales.find((x) => x.id === s)?.nombre}</span>
                </span>
                <span className="shrink-0 font-medium text-red-700 tabular-nums">
                  {stockDe(e, s, p.id)} / mín. {p.minimo}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
