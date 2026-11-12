"use client";

import { useSyncExternalStore } from "react";
import type { Contexto, Hecho } from "./logica";
import { estadoInicial } from "./semilla";
import type { EstadoPro } from "./tipos";

/*
 * Estado de la demo pro en el navegador. Se guarda en localStorage (la versión real va a una base
 * de datos con usuarios de verdad). Las acciones son las funciones puras de logica.ts.
 */
const CLAVE = "altoque:caja-pro-demo";
const oyentes = new Set<() => void>();
let estado: EstadoPro | null = null;

function leer(): EstadoPro {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) ?? "null") as EstadoPro | null;
    if (guardado?.version === 1) return guardado;
  } catch {}
  return estadoInicial();
}

function guardar() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch {}
}

function actual(): EstadoPro {
  estado ??= leer();
  return estado;
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

/** null en el servidor y en el primer dibujo: la demo vive en el navegador. */
export function useEstadoPro(): EstadoPro | null {
  return useSyncExternalStore(suscribir, actual, () => null);
}

export function contexto(): Contexto {
  return { ahora: Date.now(), nuevoId: () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}` };
}

/** Aplica una acción. Si sale bien guarda y avisa; si no, devuelve el error para mostrarlo. */
export function hacer<T>(accion: (e: EstadoPro, ctx: Contexto) => Hecho<T>): Hecho<T> {
  const r = accion(actual(), contexto());
  if (r.ok) cambiar(r.estado);
  return r;
}

/** Para cambios que no pueden fallar (ej. salir). */
export function cambiar(siguiente: EstadoPro) {
  estado = siguiente;
  guardar();
  oyentes.forEach((o) => o());
}

/** "Empezar de cero": vuelve a los datos de ejemplo, con la semana terminando hoy. */
export function reiniciar() {
  try {
    localStorage.removeItem(CLAVE);
  } catch {}
  cambiar(estadoInicial());
}
