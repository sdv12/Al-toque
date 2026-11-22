"use client";

import { AtSign, BellRing, Camera, MapPin, MessageCircle, Receipt, Star } from "lucide-react";
import { useState } from "react";
import { resumenHorarios } from "../lib/horarios";
import { aforoDe } from "../lib/logica";
import { useAhora, useResto } from "../lib/store";
import { SECCIONES_WEB, type IdSeccionWeb, type Mesa } from "../lib/tipos";
import { fechaLarga, hoyISO, linkWhatsApp, plata } from "../lib/util";
import { Ir, usaReservas } from "./comun";

/** El título de una sección: el que puso el restaurante o el de siempre. */
export function useTitulo(id: IdSeccionWeb, porDefecto: string) {
  const { st } = useResto();
  return st.local.web.secciones.find((s) => s.id === id)?.titulo.trim() || SECCIONES_WEB[id].titulo || porDefecto;
}

/** Eventos que todavía no pasaron, ordenados. */
export function eventosQueVienen(eventos: { fecha: string; hora: string }[], ahora: number) {
  const hoy = hoyISO(new Date(ahora));
  return eventos.filter((e) => e.fecha >= hoy).sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
}

export function Eventos() {
  const { st } = useResto();
  const ahora = useAhora();
  const titulo = useTitulo("eventos", "Lo que se viene");
  const lista = eventosQueVienen(st.local.web.eventos, ahora) as typeof st.local.web.eventos;
  if (!lista.length) return null;
  return (
    <section id="eventos" className="eventos">
      <div className="sec-cab">
        <span className="sec-et">Agenda</span>
        <h2>{titulo}</h2>
      </div>
      <ul className="eventos-lista">
        {lista.map((e) => {
          const [, m, d] = e.fecha.split("-");
          return (
            <li key={e.id} className="evento">
              <div className="evento-fecha" aria-hidden>
                <b>{Number(d)}</b>
                <span>{["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][Number(m) - 1]}</span>
              </div>
              <div className="evento-txt">
                <h3>{e.titulo}</h3>
                <p className="evento-cuando">
                  {fechaLarga(e.fecha)} · {e.hora} · {e.precio ? plata(e.precio) : "Sin cargo"}
                </p>
                {e.texto && <p>{e.texto}</p>}
              </div>
              {usaReservas(st) ? (
                <Ir a="reservar" className="btn btn-2 chico">
                  Reservar
                </Ir>
              ) : st.local.whatsapp ? (
                <a className="btn btn-2 chico" href={linkWhatsApp(st.local.whatsapp, `¡Hola! Quiero ir a «${e.titulo}» el ${fechaLarga(e.fecha)}.`)} target="_blank" rel="noreferrer">
                  Consultar
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function Galeria({ demo }: { demo: boolean }) {
  const { st } = useResto();
  const titulo = useTitulo("galeria", "Así es la casa");
  // Los lugares sin foto solo se muestran en la demo (como ejemplo de dónde va cada una).
  const fotos = st.local.web.galeria.filter((f) => f.src || demo);
  const [grande, setGrande] = useState<string | null>(null);
  if (!fotos.length) return null;
  const abierta = fotos.find((f) => f.id === grande);
  return (
    <section id="galeria" className="galeria">
      <div className="sec-cab">
        <span className="sec-et">Fotos</span>
        <h2>{titulo}</h2>
      </div>
      <ul className="galeria-grilla">
        {fotos.map((f, i) => (
          <li key={f.id} className={i === 0 ? "g-grande" : ""}>
            {f.src ? (
              <button type="button" onClick={() => setGrande(f.id)} aria-label={`Ver ${f.texto || "la foto"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- fotos guardadas en el navegador (data URL) */}
                <img src={f.src} alt={f.texto} loading="lazy" />
              </button>
            ) : (
              <div className="foto-vacia">
                <Camera size={22} aria-hidden />
                <small>Foto de ejemplo</small>
              </div>
            )}
            {f.texto && <span className="galeria-pie">{f.texto}</span>}
          </li>
        ))}
      </ul>
      {abierta && (
        <div className="capa capa-centro" onClick={() => setGrande(null)} role="dialog" aria-modal="true" aria-label={abierta.texto || "Foto"}>
          <figure className="foto-grande">
            {/* eslint-disable-next-line @next/next/no-img-element -- fotos guardadas en el navegador (data URL) */}
            <img src={abierta.src} alt={abierta.texto} />
            {abierta.texto && <figcaption>{abierta.texto}</figcaption>}
          </figure>
        </div>
      )}
    </section>
  );
}

export function Historia() {
  const { st } = useResto();
  const { local } = st;
  const titulo = useTitulo("historia", local.nombre);
  const parrafos = (local.web.historiaLarga || local.textos.historia).split(/\n\s*\n/).filter(Boolean);
  return (
    <section id="historia" className={"historia" + (local.web.historiaFoto ? " con-foto" : "")}>
      <div className="historia-txt">
        <span className="sec-et">Nuestra historia</span>
        <h2>{titulo}</h2>
        {parrafos.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {aforoDe(st) > 0 && <p className="info-chico">{aforoDe(st)} lugares en el salón.</p>}
      </div>
      {local.web.historiaFoto && (
        // eslint-disable-next-line @next/next/no-img-element -- foto guardada en el navegador (data URL)
        <img className="historia-foto" src={local.web.historiaFoto} alt={`${local.nombre} por dentro`} loading="lazy" />
      )}
    </section>
  );
}

export function Resenas() {
  const { st } = useResto();
  const titulo = useTitulo("resenas", "Lo que dicen");
  const lista = st.local.web.resenas;
  if (!lista.length) return null;
  const promedio = lista.reduce((s, r) => s + r.estrellas, 0) / lista.length;
  return (
    <section id="resenas" className="resenas">
      <div className="sec-cab">
        <span className="sec-et">Reseñas</span>
        <h2>{titulo}</h2>
        <p>
          {promedio.toFixed(1).replace(".", ",")} de 5 · {lista.length} {lista.length === 1 ? "reseña" : "reseñas"}
        </p>
      </div>
      <ul className="resenas-lista">
        {lista.map((r) => (
          <li key={r.id}>
            <span className="estrellas" aria-label={`${r.estrellas} de 5 estrellas`}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={16} className={i < r.estrellas ? "on" : ""} aria-hidden />
              ))}
            </span>
            <blockquote>“{r.texto}”</blockquote>
            <p className="resena-quien">
              {r.nombre}
              {r.fuente ? ` · en ${r.fuente}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Donde() {
  const { st } = useResto();
  const { local } = st;
  const titulo = useTitulo("donde", "Dónde y cuándo");
  const [verMapa, setVerMapa] = useState(false);
  const lugar = `${local.direccion}, ${local.ciudad}`;
  const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lugar)}`;
  return (
    <section id="donde" className="donde">
      <div className="sec-cab">
        <span className="sec-et">Vení</span>
        <h2>{titulo}</h2>
      </div>
      <div className="donde-grilla">
        <div>
          <h3>Horarios</h3>
          <dl className="horarios">
            {resumenHorarios(local.horarios).map((g) => (
              <div key={g.dias} className={g.texto === "Cerrado" ? "cerrado" : ""}>
                <dt>{g.dias}</dt>
                <dd>{g.texto}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h3>Cómo llegar</h3>
          <p>
            <a href={mapa} target="_blank" rel="noreferrer" className="info-link">
              <MapPin size={16} /> {local.direccion}
            </a>
          </p>
          {local.whatsapp && (
            <p>
              <a href={linkWhatsApp(local.whatsapp, `¡Hola ${local.nombre}! `)} target="_blank" rel="noreferrer" className="info-link">
                <MessageCircle size={16} /> WhatsApp
              </a>
            </p>
          )}
          {local.instagram && (
            <p>
              <a href={`https://instagram.com/${local.instagram}`} target="_blank" rel="noreferrer" className="info-link">
                <AtSign size={16} /> {local.instagram}
              </a>
            </p>
          )}
          {local.modulos.delivery && (
            <p className="info-chico">
              {local.delivery.zonas.length
                ? `Envíos a ${local.delivery.zonas.map((z) => `${z.nombre} (${plata(z.costo)})`).join(", ")}.`
                : `Envíos a ${local.delivery.zona}. Costo ${plata(local.delivery.costo)}${local.delivery.minimo ? `, pedido mínimo ${plata(local.delivery.minimo)}` : ""}.`}
            </p>
          )}
        </div>
        {local.web.mapa && (
          <div className="mapa">
            {verMapa ? (
              <iframe title={`Mapa de ${local.nombre}`} src={`https://www.google.com/maps?q=${encodeURIComponent(lugar)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            ) : (
              <button type="button" className="mapa-boton" onClick={() => setVerMapa(true)}>
                <MapPin size={22} aria-hidden />
                <span>Ver el mapa</span>
                <small>Se carga desde Google Maps</small>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/** Barra para quien escaneó el QR de su mesa: llamar al mozo o pedir la cuenta. */
export function BarraMesa({ mesa }: { mesa: Mesa }) {
  const { st, act } = useResto();
  const llamados = st.llamados.filter((l) => l.mesaId === mesa.id);
  const ya = (tipo: "mozo" | "cuenta") => llamados.some((l) => l.tipo === tipo);
  return (
    <div className="barra-mesa" role="region" aria-label={`Mesa ${mesa.nombre}`}>
      <span className="barra-mesa-nombre">Mesa {mesa.nombre}</span>
      <button type="button" className={"btn chico " + (ya("mozo") ? "btn-2" : "btn-1")} disabled={ya("mozo")} onClick={() => act.llamar(mesa.id, "mozo")}>
        <BellRing size={15} /> {ya("mozo") ? "Ya va el mozo" : "Llamar al mozo"}
      </button>
      <button type="button" className={"btn chico " + (ya("cuenta") ? "btn-2" : "btn-1")} disabled={ya("cuenta")} onClick={() => act.llamar(mesa.id, "cuenta")}>
        <Receipt size={15} /> {ya("cuenta") ? "Ya te la llevan" : "Pedir la cuenta"}
      </button>
    </div>
  );
}
