"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { cambiar, hacer, reiniciar, useEstadoPro } from "../lib/estado";
import { entrar, puede, salir, usuarioActual } from "../lib/logica";
import { ROLES, type EstadoPro, type Permiso } from "../lib/tipos";
import Auditoria from "./Auditoria";
import Caja from "./Caja";
import Clientes from "./Clientes";
import { Avisos, Icono, boton, tarjeta, useAviso, type NombreIcono } from "./comunes";
import Comprobantes from "./Comprobantes";
import Equipo from "./Equipo";
import Stock from "./Stock";
import Tablero from "./Tablero";

type Seccion = "tablero" | "caja" | "stock" | "clientes" | "comprobantes" | "equipo" | "auditoria";

const SECCIONES: { id: Seccion; nombre: string; icono: NombreIcono; permiso: Permiso }[] = [
  { id: "tablero", nombre: "Tablero", icono: "tablero", permiso: "reportes" },
  { id: "caja", nombre: "Caja y ventas", icono: "caja", permiso: "vender" },
  { id: "stock", nombre: "Stock", icono: "stock", permiso: "stock" },
  { id: "clientes", nombre: "Clientes", icono: "clientes", permiso: "clientes" },
  { id: "comprobantes", nombre: "Comprobantes", icono: "comprobantes", permiso: "comprobantes" },
  { id: "equipo", nombre: "Equipo", icono: "equipo", permiso: "equipo" },
  { id: "auditoria", nombre: "Auditoría", icono: "auditoria", permiso: "auditoria" },
];

function suscribirHash(avisar: () => void) {
  window.addEventListener("hashchange", avisar);
  return () => window.removeEventListener("hashchange", avisar);
}

export default function AppPro() {
  const e = useEstadoPro();
  return (
    <Avisos>
      <div className="min-h-dvh bg-slate-100 text-slate-900">
        <FranjaDemo />
        {!e ? <p className="p-6 text-sm text-slate-600">Cargando la demo…</p> : !e.actual ? <Ingreso e={e} /> : <Panel e={e} />}
      </div>
    </Avisos>
  );
}

function FranjaDemo() {
  const [confirmar, setConfirmar] = useState(false);
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-slate-900 px-4 py-2 text-center text-xs text-slate-100">
      <span>
        <strong className="font-semibold text-white">Demo de la caja pro</strong> · ferretería inventada, datos de ejemplo guardados solo en este navegador. Factura y QR simulados.
      </span>
      <span className="flex gap-3">
        {confirmar ? (
          <>
            <button
              type="button"
              className="font-semibold text-amber-300 underline underline-offset-2"
              onClick={() => {
                reiniciar();
                setConfirmar(false);
                history.replaceState(null, "", "#");
              }}
            >
              Sí, volver a los datos de ejemplo
            </button>
            <button type="button" className="underline underline-offset-2" onClick={() => setConfirmar(false)}>
              No
            </button>
          </>
        ) : (
          <button type="button" className="underline underline-offset-2" onClick={() => setConfirmar(true)}>
            Empezar de cero
          </button>
        )}
        <Link href="/caja#pro" className="font-semibold text-teal-300 underline underline-offset-2">
          Quiero la caja pro
        </Link>
      </span>
    </div>
  );
}

function Ingreso({ e }: { e: EstadoPro }) {
  const aviso = useAviso();
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-sm font-medium text-teal-800">{e.negocio.nombre}</p>
      <h1 className="mt-1 text-2xl font-semibold">¿Quién va a usar la caja?</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-700">
        En la caja real cada uno entra con su usuario y contraseña. Acá elegís una persona para ver la caja como la ve ella: la dueña ve todo; una
        vendedora, solo vender y clientes.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {e.usuarios.map((u) => (
          <li key={u.id} className={`${tarjeta} p-4 ${u.activo ? "" : "border-dashed bg-slate-50"}`}>
            <p className="font-semibold">{u.nombre}</p>
            <p className="text-sm text-slate-600">
              {ROLES[u.rol].nombre}
              {u.rol !== "dueno" && ` · ${u.permisos.length} de 8 permisos`}
            </p>
            {u.activo ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {u.sucursales.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={u.rol === "dueno" ? boton.primario : boton.secundario}
                    onClick={() => {
                      const r = hacer((x, c) => entrar(x, u.id, s, c));
                      if (!r.ok) aviso(r.error, "error");
                    }}
                  >
                    Entrar en {e.sucursales.find((x) => x.id === s)?.nombre}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">Dada de baja: no puede entrar (su historial queda).</p>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}

function Panel({ e }: { e: EstadoPro }) {
  const aviso = useAviso();
  const yo = usuarioActual(e)!;
  const permitidas = SECCIONES.filter((s) => puede(yo, s.permiso));
  const hash = useSyncExternalStore(suscribirHash, () => window.location.hash.slice(1), () => "");
  const seccion = permitidas.find((s) => s.id === hash)?.id ?? permitidas[0]?.id ?? "caja";
  const [ahora] = useState(() => Date.now());
  const sucursal = e.sucursales.find((s) => s.id === e.actual!.sucursalId)!;

  // Si la sección del link no está permitida para esta persona, la dirección muestra la que ve.
  useEffect(() => {
    if (hash && hash !== seccion) history.replaceState(null, "", `#${seccion}`);
  }, [hash, seccion]);

  return (
    <div className="lg:flex">
      <aside className="bg-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-60 lg:shrink-0 lg:flex-col lg:border-r lg:border-slate-200">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 lg:block">
          <p className="truncate font-semibold">{e.negocio.nombre}</p>
          <p className="truncate text-xs text-slate-600 max-lg:hidden">
            {yo.nombre} · {ROLES[yo.rol].nombre}
          </p>
          <button type="button" className={`${boton.fantasma} lg:hidden`} onClick={() => cambiar(salir(e))}>
            <Icono nombre="salir" className="size-4" /> {yo.nombre.split(" ")[0]}
          </button>
        </div>
        <nav aria-label="Secciones" className="overflow-x-auto lg:flex-1 lg:overflow-y-auto">
          <ul className="flex gap-1 p-2 lg:flex-col">
            {permitidas.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={s.id === seccion ? "page" : undefined}
                  className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 text-sm font-medium whitespace-nowrap text-slate-700 hover:bg-slate-100 aria-[current=page]:bg-teal-700 aria-[current=page]:text-white"
                >
                  <Icono nombre={s.icono} />
                  {s.nombre}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-slate-200 p-3 max-lg:hidden">
          <button type="button" className={`${boton.secundario} w-full`} onClick={() => cambiar(salir(e))}>
            <Icono nombre="salir" className="size-4" /> Cambiar de persona
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2.5 lg:px-8">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-slate-600">Sucursal</span>
            <select
              className="min-h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm font-medium"
              value={sucursal.id}
              disabled={yo.sucursales.length < 2}
              onChange={(ev) => {
                const r = hacer((x, c) => entrar(x, yo.id, ev.target.value, c));
                if (!r.ok) aviso(r.error, "error");
              }}
            >
              {e.sucursales
                .filter((s) => yo.sucursales.includes(s.id))
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
            </select>
          </label>
          <p className="text-xs text-slate-600">
            {permitidas.length < SECCIONES.length && `${yo.nombre.split(" ")[0]} ve ${permitidas.length} de ${SECCIONES.length} secciones · `}
            {sucursal.direccion}
          </p>
        </div>
        <main className="px-4 py-6 lg:px-8">
          {seccion === "tablero" && <Tablero e={e} ahora={ahora} />}
          {seccion === "caja" && <Caja e={e} />}
          {seccion === "stock" && <Stock e={e} />}
          {seccion === "clientes" && <Clientes e={e} />}
          {seccion === "comprobantes" && <Comprobantes e={e} />}
          {seccion === "equipo" && <Equipo e={e} />}
          {seccion === "auditoria" && <Auditoria e={e} />}
          <footer className="mt-10 text-center text-xs text-slate-600">
            Caja pro de{" "}
            <Link href="/" className="underline">
              Al toque
            </Link>{" "}
            · Versión {process.env.NEXT_PUBLIC_VERSION}
          </footer>
        </main>
      </div>
    </div>
  );
}
