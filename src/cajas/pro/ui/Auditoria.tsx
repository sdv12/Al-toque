"use client";

import { useState } from "react";
import { nombreDe } from "../lib/logica";
import type { EstadoPro, Evento } from "../lib/tipos";
import { Cabecera, Etiqueta, Icono, Vacio, control, fechaHora, tarjeta } from "./comunes";

const MODULOS: Record<Evento["modulo"], string> = {
  caja: "Caja",
  ventas: "Ventas",
  stock: "Stock",
  clientes: "Clientes",
  equipo: "Equipo",
  sesion: "Ingresos",
};

export default function Auditoria({ e }: { e: EstadoPro }) {
  const [modulo, setModulo] = useState("");
  const [usuario, setUsuario] = useState("");
  const [soloSensibles, setSoloSensibles] = useState(true);
  const lista = e.eventos
    .filter((ev) => (!modulo || ev.modulo === modulo) && (!usuario || ev.usuarioId === usuario) && (!soloSensibles || ev.sensible))
    .sort((a, b) => b.fecha - a.fecha);
  const visibles = lista.slice(0, 100);
  const sensibles = e.eventos.filter((ev) => ev.sensible).length;

  return (
    <>
      <Cabecera
        titulo="Auditoría"
        bajada="Quién hizo qué, cuándo y en qué sucursal. No se puede borrar ni editar. Lo marcado para revisar: egresos, diferencias de caja, cambios de precio, ajustes que bajan stock y permisos."
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="w-44">
          <span className="sr-only">Módulo</span>
          <select className={control} value={modulo} onChange={(ev) => setModulo(ev.target.value)}>
            <option value="">Todos los módulos</option>
            {Object.entries(MODULOS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="w-48">
          <span className="sr-only">Persona</span>
          <select className={control} value={usuario} onChange={(ev) => setUsuario(ev.target.value)}>
            <option value="">Todas las personas</option>
            {e.usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm">
          <input type="checkbox" checked={soloSensibles} onChange={(ev) => setSoloSensibles(ev.target.checked)} className="size-4 accent-teal-700" />
          Solo para revisar <Etiqueta tono="ambar">{sensibles}</Etiqueta>
        </label>
      </div>
      <div className={`${tarjeta} overflow-x-auto`}>
        {visibles.length === 0 ? (
          <Vacio>No hay registros con esos filtros.</Vacio>
        ) : (
          <table className="w-full min-w-[48rem] text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-600">
              <tr>
                <th className="px-4 py-2.5 font-medium">Cuándo</th>
                <th className="px-4 py-2.5 font-medium">Quién</th>
                <th className="px-4 py-2.5 font-medium">Dónde</th>
                <th className="px-4 py-2.5 font-medium">Qué hizo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibles.map((ev) => (
                <tr key={ev.id} className={ev.sensible ? "bg-amber-50/40" : ""}>
                  <td className="px-4 py-2 whitespace-nowrap tabular-nums text-slate-700">{fechaHora(ev.fecha)}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{nombreDe(e, ev.usuarioId)}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{e.sucursales.find((s) => s.id === ev.sucursalId)?.nombre ?? "—"}</td>
                  <td className="px-4 py-2">
                    <span className="flex flex-wrap items-center gap-2">
                      {ev.sensible && (
                        <Etiqueta tono="ambar">
                          <Icono nombre="alerta" className="size-3.5" /> Revisar
                        </Etiqueta>
                      )}
                      <span className="font-medium">{ev.accion}</span>
                      <span className="text-slate-700">{ev.detalle}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {lista.length > visibles.length && <p className="mt-2 text-xs text-slate-600">Se muestran los últimos {visibles.length} de {lista.length}.</p>}
    </>
  );
}
