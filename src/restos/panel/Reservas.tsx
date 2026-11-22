"use client";

import { MessageCircle, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { abreEse, franjaDeHora, franjasDel, horasReserva, motivoCerrado } from "../lib/horarios";
import { aforoDe, reservadosTurno } from "../lib/logica";
import { useAhora, useResto } from "../lib/store";
import { ESTADOS_RESERVA, type EstadoReserva, type Reserva } from "../lib/tipos";
import { fechaCorta, fechaLarga, hoyISO, linkWhatsApp, primerNombre, sumarDias } from "../lib/util";
import { Cabecera } from "./comun";

function FormReserva({ fecha, reserva, cerrar }: { fecha: string; reserva?: Reserva; cerrar: () => void }) {
  const { st, act } = useResto();
  const [f, setF] = useState(() => reserva ?? { fecha, hora: franjasDel(st.local.horarios, fecha)[0]?.desde ?? "21:00", personas: 2, nombre: "", tel: "", nota: "", estado: "confirmada" as EstadoReserva });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: k === "personas" ? Number(e.target.value) : e.target.value });
  const franja = franjaDeHora(st.local.horarios, f.fecha, f.hora);
  const libres = aforoDe(st) - (franja >= 0 ? reservadosTurno(st, f.fecha, franja, reserva?.id) : 0);
  const horas = franjasDel(st.local.horarios, f.fecha).flatMap((_, i) => horasReserva(st.local, f.fecha, i, new Date(0)));
  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.nombre.trim() || !f.fecha || !f.hora) return;
    const datos = { ...f, personas: Math.max(1, Number(f.personas) || 1), nombre: f.nombre.trim() };
    if (reserva) act.guardarReserva({ ...datos, id: reserva.id });
    else act.nuevaReserva({ ...datos, origen: "teléfono" });
    cerrar();
  };
  return (
    <form className="tarjeta form-nueva" onSubmit={guardar}>
      <h3>{reserva ? "Editar reserva" : "Reserva por teléfono"}</h3>
      <div className="campos">
        <label>
          Día
          <input type="date" value={f.fecha} onChange={set("fecha")} />
        </label>
        <label>
          Hora
          <input type="time" value={f.hora} onChange={set("hora")} list="horas-reserva" />
          <datalist id="horas-reserva">
            {horas.map((h) => (
              <option key={h} value={h} />
            ))}
          </datalist>
        </label>
        <label>
          Personas
          <input type="number" min="1" max="80" value={f.personas} onChange={set("personas")} />
        </label>
        <label>
          Nombre
          <input value={f.nombre} onChange={set("nombre")} required />
        </label>
        <label>
          Teléfono
          <input value={f.tel} onChange={set("tel")} inputMode="tel" />
        </label>
        <label>
          Nota
          <input value={f.nota} onChange={set("nota")} />
        </label>
        <label>
          Estado
          <select value={f.estado} onChange={set("estado")}>
            {Object.entries(ESTADOS_RESERVA).map(([k, n]) => (
              <option key={k} value={k}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
      {!abreEse(st.local.horarios, f.fecha) && <p className="aviso">Ese día el local está cerrado.</p>}
      {Number(f.personas) > libres && (
        <p className="error">
          Ese turno tiene {Math.max(0, libres)} lugares libres: vas a pasar los {aforoDe(st)}.
        </p>
      )}
      <div className="fila-btns">
        <button type="button" className="btn btn-2" onClick={cerrar}>
          Cancelar
        </button>
        <button className="btn btn-1">Guardar</button>
      </div>
    </form>
  );
}

export default function Reservas() {
  const { st, act } = useResto();
  const { local } = st;
  const hoy = hoyISO(new Date(useAhora()));
  const [fechaSel, setFecha] = useState<string | null>(null);
  const fecha = fechaSel ?? hoy;
  const [nueva, setNueva] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const dias = Array.from({ length: Math.max(14, local.reservas.diasAnticipacion + 1) }, (_, i) => sumarDias(hoy, i));
  const delDia = st.reservas.filter((r) => r.fecha === fecha).sort((a, b) => a.hora.localeCompare(b.hora));
  const franjas = franjasDel(local.horarios, fecha);
  const aforo = aforoDe(st);
  // Reservas cargadas en un día que después se cerró: igual se muestran.
  const grupos = franjas.length ? franjas.map((f, i) => ({ nombre: f.nombre, i, lista: delDia.filter((r) => franjaDeHora(local.horarios, fecha, r.hora) === i) })) : delDia.length ? [{ nombre: "Del día", i: -1, lista: delDia }] : [];

  const mensaje = (r: Reserva, tipo: "confirmar" | "recordar") =>
    tipo === "confirmar"
      ? `¡Hola ${primerNombre(r.nombre)}! Te confirmamos la reserva en ${local.nombre} para ${r.personas} el ${fechaLarga(r.fecha)} a las ${r.hora}. La mesa se guarda ${local.reservas.tolerancia} minutos. ¡Te esperamos!`
      : `¡Hola ${primerNombre(r.nombre)}! Te recordamos tu reserva en ${local.nombre} el ${fechaLarga(r.fecha)} a las ${r.hora} para ${r.personas}. Si no podés venir, avisanos así liberamos la mesa. ¡Gracias!`;

  return (
    <div className="vista">
      <Cabecera et={fechaLarga(fecha)} titulo="Reservas">
        <button className="btn btn-1" onClick={() => setNueva(true)}>
          <Plus size={16} /> Reserva por teléfono
        </button>
      </Cabecera>

      <div className="chips dias">
        {dias.map((f) => {
          const pend = st.reservas.filter((r) => r.fecha === f && r.estado === "pendiente").length;
          return (
            <button key={f} className={(f === fecha ? "on" : "") + (abreEse(local.horarios, f) ? "" : " cerrado")} onClick={() => setFecha(f)}>
              {f === hoy ? "Hoy" : fechaCorta(f)}
              {pend > 0 && <em>{pend}</em>}
            </button>
          );
        })}
      </div>

      {nueva && <FormReserva fecha={fecha} cerrar={() => setNueva(false)} />}

      {!grupos.length && <p className="vacio">{abreEse(local.horarios, fecha) ? "Sin reservas." : `Cerrado${motivoCerrado(local.horarios, fecha) ? ": " + motivoCerrado(local.horarios, fecha) : ""}.`}</p>}

      {grupos.map(({ nombre, i, lista }) => {
        const ocup = i >= 0 ? reservadosTurno(st, fecha, i) : 0;
        return (
          <section key={nombre + i} className="turno">
            <div className="turno-cab">
              <h2>{nombre}</h2>
              <div className="barra">
                <i style={{ width: Math.min(100, aforo ? (ocup / aforo) * 100 : 0) + "%" }} />
              </div>
              <span>
                {ocup}/{aforo} reservados
              </span>
            </div>
            {lista.length ? (
              <ul className="reservas">
                {lista.map((r) =>
                  editando === r.id ? (
                    <li key={r.id}>
                      <FormReserva fecha={fecha} reserva={r} cerrar={() => setEditando(null)} />
                    </li>
                  ) : (
                    <li key={r.id} className={"res " + r.estado}>
                      <b className="res-hora">{r.hora}</b>
                      <div className="res-quien">
                        <strong>{r.nombre}</strong>
                        <small>
                          {r.personas} personas · {r.tel || "sin teléfono"} · {r.origen}
                        </small>
                        {r.nota && <small className="res-nota">“{r.nota}”</small>}
                      </div>
                      <span className={"estado e-" + r.estado}>
                        {ESTADOS_RESERVA[r.estado]}
                        {r.mesa ? ` · mesa ${r.mesa}` : ""}
                      </span>
                      <div className="res-acc">
                        {r.estado === "pendiente" && (
                          <>
                            <button className="btn btn-1 chico" onClick={() => act.estadoReserva(r.id, "confirmada")}>
                              Confirmar
                            </button>
                            {r.tel && (
                              <a className="btn btn-2 chico" target="_blank" rel="noreferrer" onClick={() => act.estadoReserva(r.id, "confirmada")} href={linkWhatsApp(r.tel, mensaje(r, "confirmar"))}>
                                <MessageCircle size={14} /> Confirmar por WhatsApp
                              </a>
                            )}
                            <button className="btn btn-3 chico" onClick={() => act.estadoReserva(r.id, "cancelada")}>
                              Rechazar
                            </button>
                          </>
                        )}
                        {r.estado === "confirmada" && (
                          <>
                            {fecha === hoy && local.modulos.salon && (
                              <a className="btn btn-1 chico" href="#/panel/salon">
                                Sentar
                              </a>
                            )}
                            {r.tel && (
                              <a className="btn btn-2 chico" target="_blank" rel="noreferrer" href={linkWhatsApp(r.tel, mensaje(r, "recordar"))}>
                                <MessageCircle size={14} /> Recordar
                              </a>
                            )}
                            <button className="btn btn-3 chico" onClick={() => act.estadoReserva(r.id, "novino")}>
                              No vino
                            </button>
                            <button className="btn btn-3 chico" onClick={() => act.estadoReserva(r.id, "cancelada")}>
                              Cancelar
                            </button>
                          </>
                        )}
                        {["cancelada", "novino"].includes(r.estado) && (
                          <button className="btn btn-3 chico" onClick={() => act.estadoReserva(r.id, "confirmada")}>
                            Reactivar
                          </button>
                        )}
                        <button className="btn btn-3 chico btn-editar" onClick={() => setEditando(r.id)}>
                          <Pencil size={13} /> Editar
                        </button>
                      </div>
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p className="vacio">Sin reservas.</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
