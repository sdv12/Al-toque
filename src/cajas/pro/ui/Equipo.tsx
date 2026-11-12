"use client";

import { useState } from "react";
import { hacer } from "../lib/estado";
import { guardarUsuario } from "../lib/logica";
import { PERMISOS, ROLES, type EstadoPro, type Permiso, type Rol, type Usuario } from "../lib/tipos";
import { Cabecera, Campo, Etiqueta, Icono, Modal, boton, control, tarjeta, useAviso } from "./comunes";

export default function Equipo({ e }: { e: EstadoPro }) {
  const [abierto, setAbierto] = useState<Usuario | "nuevo" | null>(null);
  return (
    <>
      <Cabecera titulo="Equipo" bajada="Cada persona entra con su usuario y ve solo lo que le habilitás. Todo cambio de permisos queda en la auditoría.">
        <button type="button" className={boton.primario} onClick={() => setAbierto("nuevo")}>
          <Icono nombre="mas" className="size-4" /> Agregar persona
        </button>
      </Cabecera>
      <ul className="grid gap-3 lg:grid-cols-2">
        {e.usuarios.map((u) => (
          <li key={u.id} className={`${tarjeta} p-4 ${u.activo ? "" : "bg-slate-50"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {u.nombre} {!u.activo && <Etiqueta>Dado de baja</Etiqueta>}
                </p>
                <p className="text-sm text-slate-600">
                  {ROLES[u.rol].nombre} · {u.sucursales.map((s) => e.sucursales.find((x) => x.id === s)?.nombre).join(" y ")}
                </p>
              </div>
              <button type="button" className={boton.fantasma} onClick={() => setAbierto(u)}>
                <Icono nombre="editar" className="size-4" /> Editar<span className="sr-only"> a {u.nombre}</span>
              </button>
            </div>
            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={`Permisos de ${u.nombre}`}>
              {(Object.keys(PERMISOS) as Permiso[]).map((p) => {
                const tiene = u.rol === "dueno" || u.permisos.includes(p);
                return (
                  <li key={p}>
                    <Etiqueta tono={tiene ? "verde" : "gris"}>
                      <span aria-hidden>{tiene ? "✓" : "—"}</span> {PERMISOS[p].nombre}
                      <span className="sr-only">{tiene ? " (sí)" : " (no)"}</span>
                    </Etiqueta>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
      {abierto && <EditarUsuario e={e} u={abierto === "nuevo" ? null : abierto} onCerrar={() => setAbierto(null)} />}
    </>
  );
}

function EditarUsuario({ e, u, onCerrar }: { e: EstadoPro; u: Usuario | null; onCerrar: () => void }) {
  const aviso = useAviso();
  const [f, setF] = useState<Usuario>(
    u ?? { id: "", nombre: "", rol: "vendedor", permisos: ROLES.vendedor.permisos, sucursales: [e.actual!.sucursalId], activo: true },
  );
  const [error, setError] = useState<string>();
  const alternar = <T,>(lista: T[], x: T) => (lista.includes(x) ? lista.filter((y) => y !== x) : [...lista, x]);
  const enviar = () => {
    const r = hacer((x, c) => guardarUsuario(x, { ...f, id: f.id || c.nuevoId() }, c));
    if (!r.ok) return setError(r.error);
    aviso(u ? "Cambios guardados" : `${f.nombre} ya puede entrar`);
    onCerrar();
  };
  return (
    <Modal
      titulo={u ? `Editar a ${u.nombre}` : "Agregar persona"}
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
        className="space-y-5"
        onSubmit={(ev) => {
          ev.preventDefault();
          enviar();
        }}
      >
        <Campo etiqueta="Nombre">{(id) => <input id={id} autoFocus className={control} value={f.nombre} onChange={(ev) => setF({ ...f, nombre: ev.target.value })} />}</Campo>
        <Campo etiqueta="Rol" ayuda="El rol carga permisos típicos; después podés tocarlos uno por uno.">
          {(id, d) => (
            <select
              id={id}
              aria-describedby={d}
              className={control}
              value={f.rol}
              onChange={(ev) => {
                const rol = ev.target.value as Rol;
                setF({ ...f, rol, permisos: ROLES[rol].permisos });
              }}
            >
              {(Object.keys(ROLES) as Rol[]).map((r) => (
                <option key={r} value={r}>
                  {ROLES[r].nombre}
                </option>
              ))}
            </select>
          )}
        </Campo>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Qué puede hacer</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(PERMISOS) as Permiso[]).map((p) => (
              <label key={p} className={`flex gap-2.5 rounded-lg border border-slate-200 p-2.5 ${f.rol === "dueno" ? "opacity-60" : "cursor-pointer hover:bg-slate-50"}`}>
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-teal-700"
                  disabled={f.rol === "dueno"}
                  checked={f.rol === "dueno" || f.permisos.includes(p)}
                  onChange={() => setF({ ...f, permisos: alternar(f.permisos, p) })}
                />
                <span>
                  <span className="block text-sm font-medium">{PERMISOS[p].nombre}</span>
                  <span className="block text-xs text-slate-600">{PERMISOS[p].detalle}</span>
                </span>
              </label>
            ))}
          </div>
          {f.rol === "dueno" && <p className="mt-2 text-xs text-slate-600">Dueño/a tiene todos los permisos.</p>}
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Sucursales</legend>
          <div className="flex flex-wrap gap-3">
            {e.sucursales.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4 accent-teal-700" checked={f.sucursales.includes(s.id)} onChange={() => setF({ ...f, sucursales: alternar(f.sucursales, s.id) })} />
                {s.nombre}
              </label>
            ))}
          </div>
        </fieldset>
        {u && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 accent-teal-700" checked={f.activo} onChange={(ev) => setF({ ...f, activo: ev.target.checked })} />
            Puede entrar (sacalo para dar de baja sin borrar su historial)
          </label>
        )}
        {error && <p className="text-sm font-medium text-red-700">{error}</p>}
      </form>
    </Modal>
  );
}
