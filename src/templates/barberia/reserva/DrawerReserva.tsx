"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { useBooking, type Booking } from "@/core/hooks/useBooking";
import { etiquetaDia, horaDe } from "@/core/lib/fechas";
import { formatearDuracion, formatearPrecio, fechaHoraLegible } from "@/core/lib/mensajes";
import { CUALQUIERA, type PasoReserva, type Preseleccion } from "@/core/lib/reserva";
import type { ConfigDe } from "@/core/schema/landing-config";
import { boton } from "../estilos";
import { IconoCerrar, IconoWhatsApp } from "../iconos";

const ORDEN: readonly PasoReserva[] = ["profesional", "servicio", "dia", "horario", "datos"];

const TITULOS: Record<PasoReserva, string> = {
  profesional: "¿Con quién?",
  servicio: "¿Qué te hacés?",
  dia: "¿Qué día?",
  horario: "¿A qué hora?",
  datos: "¿A nombre de quién?",
};

type Props = {
  config: ConfigDe<"barberia">;
  abierto: boolean;
  onAbiertoChange: (abierto: boolean) => void;
  preseleccion: Preseleccion;
  contenedor: HTMLElement | null;
};

export function DrawerReserva({ config, abierto, onAbiertoChange, preseleccion, contenedor }: Props) {
  return (
    <Dialog.Root open={abierto} onOpenChange={onAbiertoChange}>
      <Dialog.Portal container={contenedor}>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-fondo/80 data-[state=closed]:animate-[barberia-velo_200ms_ease-in_reverse] data-[state=open]:animate-[barberia-velo_200ms_ease-out]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="@container fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-borde bg-superficie text-tinta shadow-[-24px_0_48px_-24px_rgb(0_0_0/0.6)] focus:outline-none data-[state=closed]:animate-[barberia-panel-sale_220ms_ease-in] data-[state=open]:animate-[barberia-panel-entra_280ms_cubic-bezier(.2,.8,.2,1)]"
        >
          <FlujoReserva config={config} preseleccion={preseleccion} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function FlujoReserva({ config, preseleccion }: { config: ConfigDe<"barberia">; preseleccion: Preseleccion }) {
  const b = useBooking({ config, orden: ORDEN, preseleccion });
  const tituloPaso = useRef<HTMLHeadingElement>(null);
  const primerRender = useRef(true);

  // Al cambiar de paso, el foco va al título del paso (lectores de pantalla y teclado).
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    tituloPaso.current?.focus();
  }, [b.paso, b.resultado]);

  return (
    <>
      <header className="flex items-start justify-between gap-4 border-b border-borde px-6 pb-5 pt-6">
        <div>
          <Dialog.Title className="font-display text-subtitulo italic">Reservá tu turno</Dialog.Title>
          {!b.resultado && (
            <p className="mt-1 text-mini text-tinta-suave">
              Paso {b.indice + 1} de {b.total}
            </p>
          )}
        </div>
        <Dialog.Close className="-mr-2 grid size-11 place-items-center rounded-control text-tinta-suave hover:text-tinta" aria-label="Cerrar">
          <IconoCerrar className="size-6" />
        </Dialog.Close>
      </header>

      {b.resultado ? (
        <Confirmado b={b} refTitulo={tituloPaso} />
      ) : (
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            if (b.esUltimo) void b.confirmar();
            else b.avanzar();
          }}
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            <Resumen b={b} />
            <h3 ref={tituloPaso} tabIndex={-1} className="font-display text-titulo focus:outline-none">
              {TITULOS[b.paso]}
            </h3>
            <div className="mt-5">
              <Paso b={b} />
            </div>
            {b.error && (
              <p role="alert" className="mt-4 border-l-2 border-acento pl-3 text-chico">
                {b.error}
              </p>
            )}
          </div>
          <footer className="flex items-center justify-between gap-3 border-t border-borde px-6 py-4">
            {b.indice > 0 ? (
              <button type="button" onClick={b.retroceder} className={boton.secundario}>
                Volver
              </button>
            ) : (
              <span />
            )}
            <button type="submit" disabled={!b.puedeAvanzar || b.enviando} className={boton.primario}>
              {b.esUltimo ? (b.enviando ? "Un momento…" : "Pedir este turno") : "Continuar"}
            </button>
          </footer>
        </form>
      )}
    </>
  );
}

/** Lo elegido hasta ahora, con acceso directo para cambiarlo. */
function Resumen({ b }: { b: Booking }) {
  const items: { paso: PasoReserva; texto: string }[] = [];
  const { estado } = b;
  if (estado.profesionalId && b.paso !== "profesional")
    items.push({ paso: "profesional", texto: b.profesional?.nombre ?? "Sin preferencia" });
  if (b.servicio && b.paso !== "servicio") items.push({ paso: "servicio", texto: b.servicio.nombre });
  if (estado.fecha && b.paso !== "dia") items.push({ paso: "dia", texto: etiquetaDia(estado.fecha).larga });
  if (estado.slot && b.paso !== "horario") items.push({ paso: "horario", texto: `${horaDe(estado.slot.inicio)} h` });
  if (!items.length) return null;

  return (
    <ul className="mb-6 flex flex-wrap gap-x-4 gap-y-1 text-mini text-tinta-suave">
      {items.map((i) => (
        <li key={i.paso}>
          <button type="button" onClick={() => b.irA(i.paso)} className="underline decoration-borde underline-offset-4 hover:text-tinta">
            {i.texto}
            <span className="sr-only"> (cambiar)</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Paso({ b }: { b: Booking }) {
  switch (b.paso) {
    case "profesional":
      return (
        <Grupo leyenda="Barbero">
          <Opcion name="profesional" value={CUALQUIERA} checked={b.estado.profesionalId === CUALQUIERA} onElegir={b.elegirProfesional}>
            <span className="font-display text-subtitulo">Sin preferencia</span>
            <span className="block text-chico text-tinta-suave">Con quien tenga lugar antes</span>
          </Opcion>
          {b.profesionales.map((p) => (
            <Opcion key={p.id} name="profesional" value={p.id} checked={b.estado.profesionalId === p.id} onElegir={b.elegirProfesional}>
              <span className="font-display text-subtitulo">{p.nombre}</span>
              <span className="block text-chico text-tinta-suave">{p.especialidad}</span>
            </Opcion>
          ))}
        </Grupo>
      );

    case "servicio":
      return (
        <Grupo leyenda="Servicio">
          {b.servicios.map((s) => (
            <Opcion key={s.id} name="servicio" value={s.id} checked={b.estado.servicioId === s.id} onElegir={b.elegirServicio}>
              <span className="flex items-baseline justify-between gap-3">
                <span className="font-display text-subtitulo">{s.nombre}</span>
                <span className="shrink-0 tabular-nums">{formatearPrecio(s)}</span>
              </span>
              <span className="block text-chico text-tinta-suave">{formatearDuracion(s.duracionMin)}</span>
            </Opcion>
          ))}
        </Grupo>
      );

    case "dia":
      return b.dias.length === 0 ? (
        <p className="text-tinta-suave">No hay días disponibles en las próximas semanas. Escribinos por WhatsApp.</p>
      ) : (
        <Grupo leyenda="Día" className="grid grid-cols-4 gap-2 @xs:grid-cols-5">
          {b.dias.slice(0, 15).map((fecha) => {
            const e = etiquetaDia(fecha);
            return (
              <Opcion key={fecha} name="dia" value={fecha} checked={b.estado.fecha === fecha} onElegir={b.elegirFecha} compacta aria-label={e.larga}>
                <span className="block text-mini text-tinta-suave">{e.semanaCorta}</span>
                <span className="block font-display text-subtitulo leading-none">{e.numero}</span>
                <span className="block text-mini text-tinta-suave">{e.mesCorto}</span>
              </Opcion>
            );
          })}
        </Grupo>
      );

    case "horario": {
      if (b.horarios.estado === "cargando") return <p aria-live="polite" className="text-tinta-suave">Buscando horarios…</p>;
      if (b.horarios.estado === "error") return <p role="alert">No pudimos cargar los horarios. Probá de nuevo.</p>;
      const libres = b.horarios.slots.filter((s) => s.disponible);
      if (!libres.length)
        return (
          <p className="text-tinta-suave">
            Ese día ya no quedan horarios.{" "}
            <button type="button" onClick={() => b.irA("dia")} className="underline underline-offset-4">
              Elegí otro día
            </button>
            .
          </p>
        );
      const manana = libres.filter((s) => horaDe(s.inicio) < "12:00");
      const tarde = libres.filter((s) => horaDe(s.inicio) >= "12:00");
      return (
        <div className="space-y-6">
          {[
            ["Mañana", manana],
            ["Tarde", tarde],
          ].map(([titulo, lista]) =>
            (lista as typeof libres).length ? (
              <Grupo key={titulo as string} leyenda={titulo as string} leyendaVisible className="grid grid-cols-4 gap-2">
                {(lista as typeof libres).map((s) => (
                  <Opcion
                    key={s.inicio}
                    name="horario"
                    value={s.inicio}
                    checked={b.estado.slot?.inicio === s.inicio}
                    onElegir={() => b.elegirSlot(s)}
                    compacta
                  >
                    <span className="tabular-nums">{horaDe(s.inicio)}</span>
                  </Opcion>
                ))}
              </Grupo>
            ) : null,
          )}
        </div>
      );
    }

    case "datos":
      return (
        <div className="space-y-5">
          {b.estado.slot && b.servicio && (
            <p className="border-l-2 border-acento pl-4 text-chico">
              {b.servicio.nombre} · {formatearPrecio(b.servicio)}
              <br />
              <span className="text-tinta-suave">{fechaHoraLegible(b.estado.slot.inicio)}</span>
            </p>
          )}
          <label className="block">
            <span className="text-chico">Tu nombre</span>
            <input
              value={b.estado.nombre}
              onChange={(e) => b.setNombre(e.target.value)}
              autoComplete="name"
              required
              minLength={2}
              className="mt-2 block w-full rounded-control border border-borde bg-fondo px-4 py-3 text-tinta"
            />
          </label>
          <label className="block">
            <span className="text-chico">
              Algo que quieras avisar <span className="text-tinta-suave">(opcional)</span>
            </span>
            <textarea
              value={b.estado.nota}
              onChange={(e) => b.setNota(e.target.value)}
              rows={3}
              className="mt-2 block w-full rounded-control border border-borde bg-fondo px-4 py-3 text-tinta"
            />
          </label>
        </div>
      );
  }
}

function Grupo({
  leyenda,
  leyendaVisible,
  className = "space-y-2",
  children,
}: {
  leyenda: string;
  leyendaVisible?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <fieldset>
      <legend className={leyendaVisible ? "mb-2 text-mini text-tinta-suave" : "sr-only"}>{leyenda}</legend>
      <div className={className}>{children}</div>
    </fieldset>
  );
}

/** Radio nativo (teclado con flechas gratis) con presentación de la plantilla. */
function Opcion({
  name,
  value,
  checked,
  onElegir,
  compacta,
  children,
  ...resto
}: {
  name: string;
  value: string;
  checked: boolean;
  onElegir: (valor: string) => void;
  compacta?: boolean;
  "aria-label"?: string;
  children: ReactNode;
}) {
  return (
    <label className="block cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onElegir(value)}
        aria-label={resto["aria-label"]}
        className="peer sr-only"
      />
      <span
        className={`block rounded-base border border-borde transition-colors peer-checked:border-acento peer-checked:bg-fondo peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foco hover:border-tinta-suave ${
          compacta ? "px-1 py-2 text-center" : "px-4 py-3"
        } ${checked ? "shadow-[inset_3px_0_0_var(--lk-acento)]" : ""}`}
      >
        {children}
      </span>
    </label>
  );
}

function Confirmado({ b, refTitulo }: { b: Booking; refTitulo: RefObject<HTMLHeadingElement | null> }) {
  if (!b.resultado || !b.estado.slot || !b.servicio) return null;
  return (
    <div className="flex flex-1 flex-col px-6 py-8">
      <h3 ref={refTitulo} tabIndex={-1} className="font-display text-titulo italic focus:outline-none">
        Casi listo, {b.estado.nombre.trim().split(" ")[0]}.
      </h3>
      <p className="mt-4">
        Elegiste <strong>{b.servicio.nombre}</strong> el {fechaHoraLegible(b.estado.slot.inicio)}.
      </p>
      <p className="mt-3 text-chico text-tinta-suave">
        Falta un paso: mandanos el mensaje por WhatsApp y te confirmamos el turno. Si después no podés venir, avisanos por ahí mismo.
      </p>
      <div className="mt-auto flex flex-col gap-3 pt-8">
        <a href={b.resultado.linkWhatsApp} target="_blank" rel="noopener noreferrer" className={boton.primario}>
          <IconoWhatsApp className="size-5" />
          Confirmar por WhatsApp
        </a>
        <Dialog.Close className={boton.secundario + " justify-center"}>Cerrar</Dialog.Close>
      </div>
    </div>
  );
}
