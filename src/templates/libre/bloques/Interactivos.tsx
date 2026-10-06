"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { useAdapter } from "@/core/adapters/context";
import { useBooking } from "@/core/hooks/useBooking";
import { estimar, noches, problemasEstadia, rangoLibre } from "@/core/lib/estadia";
import { etiquetaDia, horaDe, hoyISO, sumarDias } from "@/core/lib/fechas";
import { fechaHoraLegible, formatearPesos, formatearPrecio, linkWhatsApp, mensajeConsulta, mensajeContacto } from "@/core/lib/mensajes";
import { CUALQUIERA, type PasoReserva } from "@/core/lib/reserva";
import { IconoWhatsApp } from "@/ui/primitives/IconoWhatsApp";
import { bloque, boton, campo, campoArea, margen, titulo } from "../estilos";
import type { PropsBloque } from "../tipos";

/* Bloques con interacción. Los marcados "con sistema" en la beta confirman por WhatsApp. */

function Cabecera({ id, texto, bajada }: { id: string; texto: string; bajada?: string }) {
  return (
    <>
      <h2 id={id} className={titulo}>
        {texto}
      </h2>
      {bajada && <p className="mt-3 text-tinta-suave">{bajada}</p>}
    </>
  );
}

/** Contacto y formulario de consultas: el mensaje se arma y se abre WhatsApp. */
function FormularioWhatsApp({ config, anclaId, conTema, titulo: t, bajada }: PropsBloque & { conTema: boolean; titulo: string; bajada: string }) {
  const id = useId();
  const [nombre, setNombre] = useState("");
  const [tema, setTema] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviado, setEnviado] = useState<string | null>(null);
  const temas = (config.contenido.servicios ?? []).map((s) => s.nombre);

  function enviar(e: FormEvent) {
    e.preventDefault();
    const link = linkWhatsApp(config.negocio.whatsapp, mensajeContacto({ negocio: config.negocio, nombre, tema, mensaje }));
    window.open(link, "_blank", "noopener,noreferrer");
    setEnviado(link);
  }

  return (
    <section id={anclaId} aria-labelledby={`${anclaId}-t`} className={`${margen} ${bloque}`}>
      <div className="mx-auto max-w-2xl">
        <Cabecera id={`${anclaId}-t`} texto={t} bajada={bajada} />
        <form onSubmit={enviar} className="mt-8 space-y-4">
          <div>
            <label htmlFor={`${id}-n`} className="font-semibold">
              Tu nombre
            </label>
            <input id={`${id}-n`} required minLength={2} autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} className={campo} />
          </div>
          {conTema && temas.length > 0 && (
            <div>
              <label htmlFor={`${id}-t`} className="font-semibold">
                ¿Sobre qué?
              </label>
              <select id={`${id}-t`} value={tema} onChange={(e) => setTema(e.target.value)} className={campo}>
                <option value="">Elegí una opción</option>
                {temas.map((x) => (
                  <option key={x}>{x}</option>
                ))}
                <option>Otra cosa</option>
              </select>
            </div>
          )}
          <div>
            <label htmlFor={`${id}-m`} className="font-semibold">
              Tu mensaje
            </label>
            <textarea id={`${id}-m`} required minLength={5} rows={4} value={mensaje} onChange={(e) => setMensaje(e.target.value)} className={campoArea} />
          </div>
          <button type="submit" className={boton.primario}>
            <IconoWhatsApp className="size-5" /> Enviar por WhatsApp
          </button>
          <p role="status" className="min-h-5 text-chico text-tinta-suave">
            {enviado && (
              <>
                Se abrió WhatsApp con tu mensaje.{" "}
                <a href={enviado} target="_blank" rel="noopener noreferrer" className="underline">
                  ¿No se abrió?
                </a>
              </>
            )}
          </p>
        </form>
      </div>
    </section>
  );
}

export function Contacto(props: PropsBloque) {
  return <FormularioWhatsApp {...props} conTema titulo="Escribinos" bajada="Completá esto y se abre WhatsApp con tu mensaje listo." />;
}

export function Formulario(props: PropsBloque) {
  return <FormularioWhatsApp {...props} conTema titulo="Consultas" bajada="Dejanos tu consulta y te respondemos a la brevedad." />;
}

const ORDEN: readonly PasoReserva[] = ["servicio", "profesional", "dia", "horario", "datos"];

/** Agenda de turnos compacta: todo en un formulario, con la lógica de useBooking. */
export function Turnos({ config, anclaId }: PropsBloque) {
  const b = useBooking({ config, orden: ORDEN });
  const id = useId();
  const libres = b.horarios.slots.filter((s) => s.disponible);

  return (
    <section id={anclaId} aria-labelledby={`${anclaId}-t`} className={`${margen} ${bloque}`}>
      <div className="mx-auto max-w-2xl rounded-base border border-borde bg-superficie p-6 @3xl:p-10">
        <Cabecera id={`${anclaId}-t`} texto="Pedí tu turno" bajada="Elegí servicio, día y horario. Te confirmamos por WhatsApp." />
        {b.resultado && b.estado.slot && b.servicio ? (
          <div className="mt-8" role="status">
            <p className="text-subtitulo font-bold">Falta confirmarlo</p>
            <p className="mt-2">
              {b.servicio.nombre}, {fechaHoraLegible(b.estado.slot.inicio)}.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={b.resultado.linkWhatsApp} target="_blank" rel="noopener noreferrer" className={boton.primario}>
                <IconoWhatsApp className="size-5" /> Confirmar por WhatsApp
              </a>
              <button type="button" onClick={b.reiniciar} className={boton.secundario}>
                Pedir otro
              </button>
            </div>
          </div>
        ) : (
          <form
            className="mt-8 grid gap-4 @xl:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              void b.confirmar();
            }}
          >
            <div className="@xl:col-span-2">
              <label htmlFor={`${id}-s`} className="font-semibold">
                Servicio
              </label>
              <select id={`${id}-s`} required value={b.estado.servicioId ?? ""} onChange={(e) => b.elegirServicio(e.target.value)} className={campo}>
                <option value="" disabled>
                  Elegí un servicio
                </option>
                {b.servicios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} · {formatearPrecio(s)}
                  </option>
                ))}
              </select>
            </div>
            {b.estado.orden.includes("profesional") && (
              <div className="@xl:col-span-2">
                <label htmlFor={`${id}-p`} className="font-semibold">
                  Con quién
                </label>
                <select id={`${id}-p`} value={b.estado.profesionalId ?? ""} onChange={(e) => b.elegirProfesional(e.target.value)} className={campo}>
                  <option value={CUALQUIERA}>Sin preferencia</option>
                  {b.profesionales.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label htmlFor={`${id}-d`} className="font-semibold">
                Día
              </label>
              <select
                id={`${id}-d`}
                required
                disabled={!b.estado.servicioId}
                value={b.estado.fecha ?? ""}
                onChange={(e) => {
                  if (b.estado.orden.includes("profesional") && !b.estado.profesionalId) b.elegirProfesional(CUALQUIERA);
                  b.elegirFecha(e.target.value);
                }}
                className={campo}
              >
                <option value="" disabled>
                  {b.estado.servicioId ? "Elegí un día" : "Primero el servicio"}
                </option>
                {b.dias.slice(0, 21).map((f) => (
                  <option key={f} value={f}>
                    {etiquetaDia(f).larga}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`${id}-h`} className="font-semibold">
                Horario
              </label>
              <select
                id={`${id}-h`}
                required
                disabled={!b.estado.fecha || b.horarios.estado !== "listo"}
                value={b.estado.slot?.inicio ?? ""}
                onChange={(e) => {
                  const slot = libres.find((s) => s.inicio === e.target.value);
                  if (slot) b.elegirSlot(slot);
                }}
                className={campo}
              >
                <option value="" disabled>
                  {b.horarios.estado === "cargando" ? "Buscando…" : libres.length || !b.estado.fecha ? "Elegí un horario" : "Sin horarios ese día"}
                </option>
                {libres.map((s) => (
                  <option key={s.inicio} value={s.inicio}>
                    {horaDe(s.inicio)}
                  </option>
                ))}
              </select>
            </div>
            <div className="@xl:col-span-2">
              <label htmlFor={`${id}-n`} className="font-semibold">
                Tu nombre
              </label>
              <input id={`${id}-n`} required minLength={2} autoComplete="name" value={b.estado.nombre} onChange={(e) => b.setNombre(e.target.value)} className={campo} />
            </div>
            {b.error && (
              <p role="alert" className="@xl:col-span-2">
                {b.error}
              </p>
            )}
            <div className="@xl:col-span-2">
              <button type="submit" disabled={!b.completa || b.enviando} className={boton.primario}>
                Pedir este turno
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

/** Fechas de entrada y salida con estimado (campos de fecha nativos: accesibles en celu y teclado). */
export function Disponibilidad({ config, anclaId }: PropsBloque) {
  const adapter = useAdapter();
  const id = useId();
  const propiedades = config.contenido.propiedades ?? [];
  const [propiedadId, setPropiedadId] = useState(propiedades[0]?.id ?? "");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [huespedes, setHuespedes] = useState(2);
  const [nombre, setNombre] = useState("");
  const [bloqueados, setBloqueados] = useState<Set<string>>(new Set());
  const [hoy] = useState(() => hoyISO());
  const p = propiedades.find((x) => x.id === propiedadId) ?? propiedades[0];

  useEffect(() => {
    if (!p) return;
    let vigente = true;
    adapter
      .getDiasBloqueados({ propiedadId: p.id, desde: hoy, hasta: sumarDias(hoy, 365) })
      .then((d) => vigente && setBloqueados(new Set(d)))
      .catch(() => undefined);
    return () => {
      vigente = false;
    };
  }, [adapter, p, hoy]);

  if (!p) return null;
  const rango = { desde: desde || null, hasta: hasta || null };
  const libre = desde && hasta && hasta > desde ? rangoLibre(desde, hasta, bloqueados) : true;
  const problemas = problemasEstadia(p, rango, huespedes);
  const estimado = estimar(p, rango);
  const n = noches(rango);
  const lista = problemas.length === 0 && libre && hasta > desde;
  const mensaje =
    lista &&
    mensajeConsulta({ negocio: config.negocio, propiedad: p, desde, hasta, noches: n, huespedes, estimado, cliente: { nombre } });

  return (
    <section id={anclaId} aria-labelledby={`${anclaId}-t`} className={`${margen} ${bloque}`}>
      <div className="mx-auto max-w-2xl rounded-base border border-borde bg-superficie p-6 @3xl:p-10">
        <Cabecera id={`${anclaId}-t`} texto="Consultá fechas" bajada="Elegí entrada, salida y cuántos son. Te respondemos por WhatsApp." />
        <form
          className="mt-8 grid gap-4 @xl:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!mensaje) return;
            void adapter.crearConsulta({ propiedadId: p.id, desde, hasta, huespedes, cliente: { nombre: nombre || "Sin nombre" } });
            window.open(linkWhatsApp(config.negocio.whatsapp, mensaje), "_blank", "noopener,noreferrer");
          }}
        >
          {propiedades.length > 1 && (
            <div className="@xl:col-span-2">
              <label htmlFor={`${id}-c`} className="font-semibold">
                Alojamiento
              </label>
              <select id={`${id}-c`} value={p.id} onChange={(e) => setPropiedadId(e.target.value)} className={campo}>
                {propiedades.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor={`${id}-e`} className="font-semibold">
              Entrada
            </label>
            <input id={`${id}-e`} type="date" required min={hoy} value={desde} onChange={(e) => setDesde(e.target.value)} className={campo} />
          </div>
          <div>
            <label htmlFor={`${id}-s`} className="font-semibold">
              Salida
            </label>
            <input id={`${id}-s`} type="date" required min={desde ? sumarDias(desde, 1) : hoy} value={hasta} onChange={(e) => setHasta(e.target.value)} className={campo} />
          </div>
          <div>
            <label htmlFor={`${id}-h`} className="font-semibold">
              Huéspedes
            </label>
            <input id={`${id}-h`} type="number" min={1} max={p.maxHuespedes ?? p.capacidad} value={huespedes} onChange={(e) => setHuespedes(Math.max(1, Number(e.target.value) || 1))} className={campo} />
          </div>
          <div>
            <label htmlFor={`${id}-n`} className="font-semibold">
              Tu nombre <span className="font-normal text-tinta-suave">(opcional)</span>
            </label>
            <input id={`${id}-n`} autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} className={campo} />
          </div>
          <div aria-live="polite" className="text-chico @xl:col-span-2">
            {!libre && <p>Hay noches tomadas en esas fechas. Probá con otras.</p>}
            {problemas.map((x) =>
              x.tipo === "min-noches" ? <p key={x.tipo}>Mínimo {x.minimo} noches.</p> : x.tipo === "capacidad" ? <p key={x.tipo}>Hasta {x.maximo} huéspedes.</p> : null,
            )}
            {estimado && libre && (
              <p className="text-cuerpo">
                {n} {n === 1 ? "noche" : "noches"} · estimado <strong>{formatearPesos(estimado.total)}</strong> (seña {formatearPesos(estimado.sena)})
              </p>
            )}
          </div>
          <div className="@xl:col-span-2">
            <button type="submit" disabled={!lista} className={boton.primario}>
              <IconoWhatsApp className="size-5" /> Consultar por WhatsApp
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

/** Seña online: en la beta, el link de pago se manda por WhatsApp. */
export function Pagos({ config, anclaId }: PropsBloque) {
  return (
    <section id={anclaId} aria-labelledby={`${anclaId}-t`} className={`${margen} ${bloque}`}>
      <div className="mx-auto max-w-2xl rounded-base border border-borde bg-superficie p-6 text-center @3xl:p-10">
        <Cabecera id={`${anclaId}-t`} texto="Reservá con seña" bajada="Pagás la seña con Mercado Pago y tu lugar queda asegurado." />
        <a
          href={linkWhatsApp(config.negocio.whatsapp, `Hola ${config.negocio.nombre}! Quiero reservar y pagar la seña.`)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${boton.primario} mt-8`}
        >
          <IconoWhatsApp className="size-5" /> Pedir el link de pago
        </a>
      </div>
    </section>
  );
}
