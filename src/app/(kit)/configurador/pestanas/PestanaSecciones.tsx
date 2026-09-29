"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";
import { seccionesDe, type DefSeccion } from "@/core/registry";
import type { LandingConfig } from "@/core/schema/landing-config";
import { Bloque, Selector, botonKit } from "../campos";

type Props = { config: LandingConfig; editar: (f: (c: LandingConfig) => void) => void };
type SeccionPlana = { tipo: string; variante: string; activa: boolean };

/** Las secciones se editan sin tipos literales: el schema valida el resultado. */
function secciones(c: LandingConfig): SeccionPlana[] {
  return c.secciones as SeccionPlana[];
}

export function PestanaSecciones({ config, editar }: Props) {
  const defs = seccionesDe(config.plantilla);
  const lista = secciones(config);
  const inicio = lista.find((s) => defs[s.tipo]?.inicio);
  const movibles = lista.filter((s) => !defs[s.tipo]?.inicio);
  const etiqueta = (tipo: string) => defs[tipo]?.etiqueta ?? tipo;

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Reordena solo las movibles; la sección de inicio queda siempre primera.
  const mover = (desde: number, hasta: number) =>
    editar((c) => {
      const todas = secciones(c);
      const fija = todas.filter((s) => defs[s.tipo]?.inicio);
      const resto = arrayMove(
        todas.filter((s) => !defs[s.tipo]?.inicio),
        desde,
        hasta,
      );
      c.secciones = [...fija, ...resto] as typeof c.secciones;
    });

  const actualizar = (tipo: string, cambio: Partial<SeccionPlana>) =>
    editar((c) => {
      const s = secciones(c).find((x) => x.tipo === tipo);
      if (s) Object.assign(s, cambio);
    });

  const alSoltar = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const desde = movibles.findIndex((s) => s.tipo === active.id);
    const hasta = movibles.findIndex((s) => s.tipo === over.id);
    if (desde !== -1 && hasta !== -1) mover(desde, hasta);
  };

  const posicion = (id: string | number) => movibles.findIndex((s) => s.tipo === id) + 1;
  const anuncios: Announcements = {
    onDragStart: ({ active }) => `Tomaste ${etiqueta(String(active.id))}. Posición ${posicion(active.id)} de ${movibles.length}.`,
    onDragOver: ({ active, over }) => (over ? `${etiqueta(String(active.id))} pasa a la posición ${posicion(over.id)}.` : undefined),
    onDragEnd: ({ active, over }) =>
      over ? `Soltaste ${etiqueta(String(active.id))} en la posición ${posicion(over.id)}.` : `Soltaste ${etiqueta(String(active.id))}.`,
    onDragCancel: ({ active }) => `Cancelado. ${etiqueta(String(active.id))} vuelve a su lugar.`,
  };

  return (
    <Bloque
      titulo="Secciones"
      descripcion="Activá, elegí la variante y ordená. Para mover con teclado: foco en la manija, Espacio, flechas y Espacio para soltar."
    >
      {inicio && defs[inicio.tipo] && (
        <FilaSeccion seccion={inicio} def={defs[inicio.tipo]!} config={config} onCambio={actualizar} fija />
      )}

      <DndContext
        sensors={sensores}
        collisionDetection={closestCenter}
        onDragEnd={alSoltar}
        accessibility={{
          announcements: anuncios,
          screenReaderInstructions: {
            draggable: "Para mover la sección, apretá Espacio, usá las flechas y apretá Espacio de nuevo para soltarla. Escape cancela.",
          },
        }}
      >
        <SortableContext items={movibles.map((s) => s.tipo)} strategy={verticalListSortingStrategy}>
          <ol className="space-y-2">
            {movibles.map((s, i) => (
              <FilaOrdenable
                key={s.tipo}
                seccion={s}
                def={defs[s.tipo]!}
                config={config}
                onCambio={actualizar}
                onSubir={i > 0 ? () => mover(i, i - 1) : undefined}
                onBajar={i < movibles.length - 1 ? () => mover(i, i + 1) : undefined}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
    </Bloque>
  );
}

type PropsFila = {
  seccion: SeccionPlana;
  def: DefSeccion;
  config: LandingConfig;
  onCambio: (tipo: string, cambio: Partial<SeccionPlana>) => void;
};

function FilaOrdenable(props: PropsFila & { onSubir: (() => void) | undefined; onBajar: (() => void) | undefined }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: props.seccion.tipo });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "relative z-10 opacity-90 shadow-lg" : ""}
    >
      <FilaSeccion
        {...props}
        manija={
          <button
            ref={setActivatorNodeRef}
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Mover ${props.def.etiqueta}`}
            className="grid h-9 w-7 shrink-0 cursor-grab touch-none place-items-center rounded-control text-tinta-suave hover:text-tinta active:cursor-grabbing"
          >
            <svg viewBox="0 0 10 16" className="h-4 w-2.5" fill="currentColor" aria-hidden>
              {[2, 8, 14].flatMap((y) => [<circle key={`a${y}`} cx="2" cy={y} r="1.4" />, <circle key={`b${y}`} cx="8" cy={y} r="1.4" />])}
            </svg>
          </button>
        }
        orden={
          <div className="flex gap-1">
            <button type="button" className={botonKit.icono} onClick={props.onSubir} disabled={!props.onSubir} aria-label={`Subir ${props.def.etiqueta}`}>
              <span aria-hidden>↑</span>
            </button>
            <button type="button" className={botonKit.icono} onClick={props.onBajar} disabled={!props.onBajar} aria-label={`Bajar ${props.def.etiqueta}`}>
              <span aria-hidden>↓</span>
            </button>
          </div>
        }
      />
    </li>
  );
}

function FilaSeccion({
  seccion,
  def,
  config,
  onCambio,
  fija,
  manija,
  orden,
}: PropsFila & { fija?: boolean; manija?: ReactNode; orden?: ReactNode }) {
  const faltante = seccion.activa
    ? def.requiere?.find((clave) => !(config.contenido[clave] as unknown[] | undefined)?.length)
    : undefined;
  const opciones = Object.entries(def.variantes).map(([valor, texto]) => ({ valor, texto }));

  return (
    <div className={`rounded-base border border-borde bg-superficie p-3 ${seccion.activa ? "" : "bg-superficie-2"}`}>
      <div className="flex items-center gap-2">
        {manija ?? <span className="w-7 shrink-0" aria-hidden />}
        <label className="flex flex-1 cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={seccion.activa}
            disabled={fija}
            onChange={(e) => onCambio(seccion.tipo, { activa: e.target.checked })}
            className="size-4 accent-[var(--lk-acento)]"
          />
          <span className={`font-medium ${seccion.activa ? "" : "text-tinta-suave"}`}>{def.etiqueta}</span>
          {fija && <span className="text-mini text-tinta-suave">· siempre primera</span>}
        </label>
        {orden}
      </div>
      <div className="mt-2 pl-9">
        {opciones.length > 1 ? (
          <Selector etiqueta={`Variante de ${def.etiqueta}`} oculto valor={seccion.variante} opciones={opciones} onCambio={(v) => onCambio(seccion.tipo, { variante: v })} />
        ) : (
          <p className="text-mini text-tinta-suave">{opciones[0]?.texto}</p>
        )}
        {faltante && <p className="mt-2 text-mini text-[#b3261e]">Falta cargar contenido en la pestaña Contenido.</p>}
      </div>
    </div>
  );
}
