"use client";

import { useState } from "react";
import { diasReservables, franjasDel, horasReserva } from "../lib/horarios";
import { aforoDe, cupoTurno } from "../lib/logica";
import { esCliente, useModo } from "../lib/modo";
import { mensajeReserva } from "../lib/publicado";
import { useAhora, useResto } from "../lib/store";
import { useTitulo } from "./Secciones";
import { fechaCorta, fechaLarga, hoyISO, linkWhatsApp, primerNombre } from "../lib/util";

export default function Reservar() {
  const { st, act } = useResto();
  const { local } = st;
  const ahora = new Date(useAhora());
  const dias = diasReservables(local, ahora);
  const [fechaSel, setFecha] = useState<string | null>(null);
  const [franjaSel, setFranja] = useState<number | null>(null);
  const [horaSel, setHora] = useState<string | null>(null);
  const [personas, setPersonas] = useState(2);
  const [nombre, setNombre] = useState("");
  const [tel, setTel] = useState("");
  const [nota, setNota] = useState("");
  const [hecha, setHecha] = useState<{ fecha: string; hora: string; personas: number; nombre: string } | null>(null);
  const [error, setError] = useState("");
  const cliente = esCliente(useModo());
  const [link, setLink] = useState<string | null>(null);

  // Lo elegido vale mientras siga disponible; si no, el primero que haya.
  const fecha = fechaSel && dias.includes(fechaSel) ? fechaSel : (dias.find((f) => franjasDel(local.horarios, f).some((_, i) => horasReserva(local, f, i, ahora).length)) ?? dias[0] ?? "");
  const franjas = fecha ? franjasDel(local.horarios, fecha) : [];
  const conHoras = franjas.map((_, i) => horasReserva(local, fecha, i, ahora));
  const primeraConHoras = conHoras.findIndex((h) => h.length);
  const franja = franjaSel !== null && franjaSel < franjas.length ? franjaSel : Math.max(0, primeraConHoras);
  const horas = conHoras[franja] ?? [];
  const hora = horaSel && horas.includes(horaSel) ? horaSel : (horas[Math.min(1, horas.length - 1)] ?? "");
  const cupo = fecha ? cupoTurno(st, fecha, franja) : 0;
  const max = local.reservas.maxPersonas;
  const titulo = useTitulo("reservar", local.diseno === "pizarra" ? "Guardamos tu mesa" : local.diseno === "nocturno" ? "Asegurate la mesa" : "Reservá tu mesa");

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim() || tel.replace(/\D/g, "").length < 8) return setError("Dejanos tu nombre y un teléfono con WhatsApp para confirmarte.");
    if (!hora) return setError("Elegí un horario disponible.");
    if (personas > cupo) return setError(cupo ? `Para ese turno quedan ${cupo} lugares. Probá con otro día u horario.` : "Ese turno está completo. Probá con otro día.");
    const datos = { fecha, hora, personas, nombre: nombre.trim(), tel: tel.trim(), nota: nota.trim() };
    if (cliente) {
      // Sin nube todavía: la reserva le llega al restaurante por WhatsApp, con el mensaje armado.
      const url = linkWhatsApp(local.whatsapp, mensajeReserva(st, datos));
      setLink(url);
      window.open(url, "_blank", "noopener");
    } else act.nuevaReserva(datos);
    setHecha({ fecha, hora, personas, nombre: nombre.trim() });
  };

  const grupo = local.whatsapp
    ? linkWhatsApp(local.whatsapp, `¡Hola! Quiero reservar para un grupo de más de ${max} personas en ${local.nombre}.`)
    : null;

  return (
    <section id="reservar" className="reservar">
      <div className="sec-cab">
        <span className="sec-et">Reservas</span>
        <h2>{titulo}</h2>
        <p>
          Te confirmamos por WhatsApp. La mesa se guarda {local.reservas.tolerancia} minutos. Grupos de más de {max},{" "}
          {grupo ? (
            <a href={grupo} target="_blank" rel="noreferrer">
              escribinos
            </a>
          ) : (
            "escribinos"
          )}
          .
        </p>
      </div>

      {hecha ? (
        <div className="res-ok" role="status">
          <span className="sec-et">Reserva recibida</span>
          <h3>¡Gracias, {primerNombre(hecha.nombre)}!</h3>
          <p>
            Pediste mesa para <b>{hecha.personas}</b> el <b>{fechaLarga(hecha.fecha)}</b> a las <b>{hecha.hora}</b>.{" "}
            {cliente ? (
              <>
                Te abrimos WhatsApp con la reserva armada: mandá el mensaje y te la confirmamos por ahí.{" "}
                {link && (
                  <a href={link} target="_blank" rel="noreferrer">
                    ¿No se abrió? Tocá acá.
                  </a>
                )}
              </>
            ) : (
              "En un rato te escribimos por WhatsApp para confirmarla."
            )}
          </p>
          <button
            className="btn btn-2"
            onClick={() => {
              setHecha(null);
              setNombre("");
              setTel("");
              setNota("");
            }}
          >
            Hacer otra reserva
          </button>
        </div>
      ) : !dias.length ? (
        <p className="vacio">Por ahora no tomamos reservas por la web.</p>
      ) : (
        <form className="res-form" onSubmit={enviar} noValidate>
          <fieldset>
            <legend>Día</legend>
            <div className="chips dias">
              {dias.map((f) => (
                <button type="button" key={f} className={f === fecha ? "on" : ""} aria-pressed={f === fecha} onClick={() => setFecha(f)}>
                  {f === hoyISO(ahora) ? "Hoy" : fechaCorta(f)}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Turno y hora</legend>
            {franjas.length > 1 && (
              <div className="chips">
                {franjas.map((f, i) => (
                  <button type="button" key={f.nombre + i} className={i === franja ? "on" : ""} aria-pressed={i === franja} onClick={() => setFranja(i)} disabled={!conHoras[i]?.length}>
                    {f.nombre}
                  </button>
                ))}
              </div>
            )}
            <div className="chips horas">
              {horas.length ? (
                horas.map((h) => (
                  <button type="button" key={h} className={h === hora ? "on" : ""} aria-pressed={h === hora} onClick={() => setHora(h)}>
                    {h}
                  </button>
                ))
              ) : (
                <span className="res-nota">Ya no quedan horarios en este turno.</span>
              )}
            </div>
            <p className={"cupo" + (cupo < 8 ? " bajo" : "")}>{cupo ? `Quedan ${cupo} de ${aforoDe(st)} lugares para este turno` : "Turno completo"}</p>
          </fieldset>
          <fieldset>
            <legend>¿Cuántos son?</legend>
            <div className="contador">
              <button type="button" onClick={() => setPersonas(Math.max(1, personas - 1))} aria-label="Menos personas">
                −
              </button>
              <output>
                {personas} {personas === 1 ? "persona" : "personas"}
              </output>
              <button type="button" onClick={() => setPersonas(Math.min(max, personas + 1))} aria-label="Más personas">
                +
              </button>
            </div>
          </fieldset>
          <div className="campos">
            <label>
              Nombre y apellido
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" />
            </label>
            <label>
              WhatsApp
              <input value={tel} onChange={(e) => setTel(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="351 …" />
            </label>
            <label className="ancho">
              ¿Algo que debamos saber? <small>(opcional)</small>
              <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Cumpleaños, celíacos, silla para bebé…" />
            </label>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="btn btn-1 res-enviar" type="submit">
            Pedir la reserva
          </button>
        </form>
      )}
    </section>
  );
}
