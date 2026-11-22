"use client";

import { MessageCircle, Plus } from "lucide-react";
import { useState } from "react";
import { useAhora, useResto } from "../lib/store";
import { linkWhatsApp, minutosDesde, primerNombre } from "../lib/util";
import { usePersona } from "./Panel";

/** Lista de espera del salón: anotar, avisar por WhatsApp que hay mesa, sentar o marcar que se fueron. */
export default function Espera() {
  const { st, act } = useResto();
  const persona = usePersona();
  const ahora = useAhora();
  const [nuevo, setNuevo] = useState(false);
  const [f, setF] = useState({ nombre: "", personas: 2, tel: "" });
  const [sentando, setSentando] = useState<string | null>(null);
  const lista = st.espera.filter((e) => e.estado === "esperando" || e.estado === "avisado").sort((a, b) => a.llegada - b.llegada);
  const libres = st.mesas.filter((m) => !m.ocupada && !m.unidaA);

  return (
    <section className="espera">
      <div className="espera-cab">
        <h3>Lista de espera</h3>
        <button className="link" onClick={() => setNuevo(!nuevo)}>
          <Plus size={14} /> Anotar
        </button>
      </div>
      {nuevo && (
        <form
          className="espera-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!f.nombre.trim()) return;
            act.anotarEspera({ nombre: f.nombre.trim(), personas: f.personas, tel: f.tel.trim(), origen: "local" });
            setF({ nombre: "", personas: 2, tel: "" });
            setNuevo(false);
          }}
        >
          <input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} placeholder="Nombre" aria-label="Nombre" autoFocus />
          <input type="number" min="1" value={f.personas} onChange={(e) => setF({ ...f, personas: Math.max(1, Number(e.target.value) || 1) })} aria-label="Personas" />
          <input value={f.tel} onChange={(e) => setF({ ...f, tel: e.target.value })} placeholder="WhatsApp" aria-label="WhatsApp" inputMode="tel" />
          <button className="btn btn-1 chico">Anotar</button>
        </form>
      )}
      {lista.length ? (
        <ol className="espera-lista">
          {lista.map((e, i) => (
            <li key={e.id} className={e.estado}>
              <div>
                <b>
                  {i + 1}. {e.nombre}
                </b>
                <small>
                  {e.personas} p. · hace {minutosDesde(e.llegada, ahora)} min{e.origen === "web" ? " · se anotó por la web" : ""}
                  {e.estado === "avisado" ? " · avisado" : ""}
                </small>
              </div>
              {sentando === e.id ? (
                <select
                  autoFocus
                  value=""
                  aria-label={`Mesa para ${e.nombre}`}
                  onChange={(ev) => {
                    if (ev.target.value) act.sentarEspera(e.id, ev.target.value, persona.rol === "mozo" ? persona.id : undefined);
                    setSentando(null);
                  }}
                  onBlur={() => setSentando(null)}
                >
                  <option value="">¿Qué mesa?</option>
                  {libres.map((m) => (
                    <option key={m.id} value={m.id}>
                      Mesa {m.nombre} ({m.cap})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="espera-acc">
                  {e.tel && (
                    <a className="icono" title="Avisar que hay mesa" aria-label={`Avisar a ${e.nombre}`} target="_blank" rel="noreferrer" onClick={() => act.estadoEspera(e.id, "avisado")} href={linkWhatsApp(e.tel, `¡Hola ${primerNombre(e.nombre)}! Ya tenemos tu mesa en ${st.local.nombre}. Te la guardamos 10 minutos.`)}>
                      <MessageCircle size={16} />
                    </a>
                  )}
                  <button className="btn btn-1 chico" disabled={!libres.length} onClick={() => setSentando(e.id)}>
                    Sentar
                  </button>
                  <button className="btn btn-3 chico" onClick={() => act.estadoEspera(e.id, "sefue")}>
                    Se fue
                  </button>
                </div>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className="vacio">Nadie esperando.</p>
      )}
    </section>
  );
}
