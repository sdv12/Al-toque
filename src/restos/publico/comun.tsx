"use client";

import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { estadoAhora } from "../lib/horarios";
import { aforoDe, enSalon, ocupacion } from "../lib/logica";
import { esCliente, useModo } from "../lib/modo";
import { useAhora, useResto } from "../lib/store";
import type { Estado } from "../lib/tipos";
import { fechaCorta, hoyISO, sumarDias } from "../lib/util";

const PALABRAS_SUELTAS = new Set(["el", "la", "los", "las", "lo", "de", "del", "y"]);

/** Iniciales del restaurante para el sello (el logo, mientras no haya uno propio). */
export function iniciales(nombre: string) {
  const ps = nombre.split(/\s+/).filter((p) => p && !PALABRAS_SUELTAS.has(p.toLowerCase()));
  const base = ps.length ? ps : nombre.split(/\s+/);
  return base
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

export function Sello({ nombre, grande }: { nombre: string; grande?: boolean }) {
  const { st } = useResto();
  if (st.local.web.logo)
    return (
      // eslint-disable-next-line @next/next/no-img-element -- logo guardado en el navegador (data URL)
      <img className={"sello logo" + (grande ? " grande" : "")} src={st.local.web.logo} alt="" />
    );
  return (
    <span className={"sello" + (grande ? " grande" : "")} aria-hidden>
      {iniciales(nombre)}
    </span>
  );
}

/** Salta a una sección sin tocar el hash (el hash es la ruta: #/panel, #/terminos). */
export function Ir({ a, className, children }: { a: string; className?: string; children: ReactNode }) {
  return (
    <a
      href={"#" + a}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        document.getElementById(a)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    >
      {children}
    </a>
  );
}

export const usaPedidos = (st: Estado) => st.local.modulos.llevar || st.local.modulos.delivery;
export const usaReservas = (st: Estado) => st.local.modulos.reservas && aforoDe(st) > 0;
export const muestraOcupacion = (st: Estado) => st.local.modulos.salon && st.local.modulos.ocupacionWeb && aforoDe(st) > 0;

/** Texto de cuándo abre: "Abre hoy a las 20:30", "Abre mañana 12:30", "Abre el jue 21 nov 19:00". */
export function cuandoAbre(iso: string, desde: string, ahora: number) {
  const hoy = hoyISO(new Date(ahora));
  if (iso === hoy) return `Abre hoy a las ${desde}`;
  if (iso === sumarDias(hoy, 1)) return `Abre mañana a las ${desde}`;
  return `Abre el ${fechaCorta(iso)} a las ${desde}`;
}

/** "Abierto · cierra 00:30" o "Cerrado · abre mañana…". */
export function EstadoLocal({ compacto }: { compacto?: boolean }) {
  const { st } = useResto();
  const ahora = useAhora();
  const e = estadoAhora(st.local.horarios, new Date(ahora));
  const texto = e.abierto ? `Abierto · cierra ${e.cierra}` : e.proximo ? cuandoAbre(e.proximo.iso, e.proximo.desde, ahora) : "Cerrado";
  return (
    <span className={"estado-local " + (e.abierto ? "abierto" : "cerrado") + (compacto ? " compacto" : "")}>
      <i aria-hidden /> {compacto && !e.abierto ? "Cerrado" : texto}
    </span>
  );
}

/** Píldora de la barra: ocupación del salón si está abierto y se muestra; si no, abierto/cerrado. */
export function PildoraTop() {
  const { st } = useResto();
  const cliente = esCliente(useModo());
  const ahora = useAhora();
  const e = estadoAhora(st.local.horarios, new Date(ahora));
  if (!e.abierto || !muestraOcupacion(st) || cliente) return <EstadoLocal compacto />;
  const n = enSalon(st);
  const aforo = aforoDe(st);
  const o = ocupacion(n, aforo);
  const destino = usaReservas(st) ? "reservar" : "carta";
  return (
    <Ir a={destino} className={"ocu-pill " + o.nivel}>
      <i aria-hidden /> {o.texto} · {n}/{aforo}
    </Ir>
  );
}

/** Anotarse en la lista de espera desde el celular, cuando el salón está lleno. */
function AnotarEspera({ cerrar }: { cerrar: () => void }) {
  const { st, act } = useResto();
  const [nombre, setNombre] = useState("");
  const [personas, setPersonas] = useState(2);
  const [tel, setTel] = useState("");
  const [error, setError] = useState("");
  const [listo, setListo] = useState(false);
  const delante = st.espera.filter((e) => e.estado === "esperando" || e.estado === "avisado").length;
  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || tel.replace(/\D/g, "").length < 8) return setError("Dejanos tu nombre y un WhatsApp para avisarte.");
    act.anotarEspera({ nombre: nombre.trim(), personas, tel: tel.trim(), origen: "web" });
    setListo(true);
  };
  return (
    <div className="capa capa-centro" onClick={cerrar}>
      <div className="opciones" role="dialog" aria-modal="true" aria-label="Lista de espera" onClick={(e) => e.stopPropagation()}>
        <div className="bolsa-cab">
          <h3>Lista de espera</h3>
          <button type="button" onClick={cerrar} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        {listo ? (
          <div className="bolsa-ok">
            <span className="sec-et">Ya estás anotado</span>
            <p>Te escribimos por WhatsApp apenas se libere una mesa. {delante ? `Hay ${delante} ${delante === 1 ? "grupo" : "grupos"} antes que ustedes.` : "Son los primeros de la lista."}</p>
            <button className="btn btn-1" onClick={cerrar}>
              Listo
            </button>
          </div>
        ) : (
          <form onSubmit={enviar} className="form-espera" noValidate>
            <p className="nota-chica">{delante ? `Hay ${delante} ${delante === 1 ? "grupo esperando" : "grupos esperando"}.` : "No hay nadie esperando."} Te avisamos por WhatsApp cuando tengamos tu mesa.</p>
            <div className="campos">
              <label>
                Nombre
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" />
              </label>
              <label>
                WhatsApp
                <input value={tel} onChange={(e) => setTel(e.target.value)} inputMode="tel" autoComplete="tel" />
              </label>
            </div>
            <div className="contador">
              <button type="button" onClick={() => setPersonas(Math.max(1, personas - 1))} aria-label="Menos personas">
                −
              </button>
              <output>
                {personas} {personas === 1 ? "persona" : "personas"}
              </output>
              <button type="button" onClick={() => setPersonas(Math.min(20, personas + 1))} aria-label="Más personas">
                +
              </button>
            </div>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button className="btn btn-1 ancho">Anotarme</button>
          </form>
        )}
      </div>
    </div>
  );
}

/** Franja grande de ocupación en vivo (o cuándo abre, si está cerrado). */
export function Ocupacion() {
  const { st } = useResto();
  const [anotar, setAnotar] = useState(false);
  const ahora = useAhora();
  const e = estadoAhora(st.local.horarios, new Date(ahora));
  const n = e.abierto ? enSalon(st) : 0;
  const aforo = aforoDe(st);
  const o = ocupacion(n, aforo);
  return (
    <div className={"ocu " + (e.abierto ? o.nivel : "cerrado")}>
      <div className="ocu-txt">
        <span className="ocu-et">
          <i aria-hidden /> {e.abierto ? "En el salón ahora" : "Ahora cerrado"}
        </span>
        {e.abierto ? (
          <>
            <strong>
              {n} <small>de {aforo} lugares</small>
            </strong>
            <span className="ocu-estado">{o.texto}</span>
            {o.nivel !== "libre" && (
              <button type="button" className="btn btn-2 chico ocu-espera" onClick={() => setAnotar(true)}>
                Anotarme en la lista de espera
              </button>
            )}
          </>
        ) : (
          <strong className="ocu-abre">{e.proximo ? cuandoAbre(e.proximo.iso, e.proximo.desde, ahora) : "Cerrado"}</strong>
        )}
      </div>
      <div className="ocu-sillas" aria-hidden>
        {Array.from({ length: Math.min(aforo, 60) }, (_, k) => (
          <span key={k} className={k < n ? "on" : ""} />
        ))}
      </div>
      {anotar && <AnotarEspera cerrar={() => setAnotar(false)} />}
    </div>
  );
}
