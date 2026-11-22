"use client";

import { ChevronLeft, ChevronRight, LayoutDashboard, Palette, Store, X } from "lucide-react";
import { useEffect, useState } from "react";
import { DISENOS, disenoDe } from "./lib/disenos";
import { LISTA_TIPOS } from "./lib/locales";
import { useResto } from "./lib/store";
import type { IdTipo } from "./lib/tipos";
import Panel from "./panel/Panel";
import Publico, { Terminos } from "./publico/Publico";
import { CartaImprimible, QrMesas } from "./publico/Imprimir";
import { TIPOGRAFIAS } from "./lib/disenos";

/** El hash es la ruta solo si empieza con "#/" (#/panel/caja, #/terminos); "#carta" es un ancla. */
const leerRuta = () => (location.hash.startsWith("#/") ? location.hash.slice(1) : "/");

/** Barra flotante de la demo: elegir tipo de local y diseño, y pasar de la web al panel. */
function BarraDemo({ tipo, cambiarTipo, enPanel }: { tipo: IdTipo; cambiarTipo: (t: IdTipo) => void; enPanel: boolean }) {
  const { st, act } = useResto();
  const [abierta, setAbierta] = useState(false);
  const i = DISENOS.findIndex((x) => x.id === st.local.diseno);
  const actual = disenoDe(st.local.diseno);
  const mover = (n: number) => act.editarLocal((l) => (l.diseno = DISENOS[(i + n + DISENOS.length) % DISENOS.length]!.id));

  return (
    <div className="sw" role="region" aria-label="Opciones de la demo">
      {abierta && (
        <div className="sw-lista">
          <div className="sw-cab">
            <strong>Probá otro restaurante</strong>
            <button className="sw-x" onClick={() => setAbierta(false)} aria-label="Cerrar">
              <X size={16} />
            </button>
          </div>
          <label className="sw-tipo">
            Tipo de local
            <select value={tipo} onChange={(e) => cambiarTipo(e.target.value as IdTipo)}>
              {LISTA_TIPOS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} · {t.ejemplo}
                </option>
              ))}
            </select>
          </label>
          <p className="sw-sub">Diseño de la web</p>
          {DISENOS.map((x, n) => (
            <button key={x.id} className={"sw-op" + (x.id === st.local.diseno ? " on" : "")} onClick={() => act.editarLocal((l) => (l.diseno = x.id))}>
              <span className={"sw-muestra m-" + x.id} aria-hidden>
                <i />
                <i />
                <i />
              </span>
              <span>
                <b>
                  {n + 1}. {x.nombre}
                </b>
                <small>{x.bajada}</small>
              </span>
            </button>
          ))}
        </div>
      )}
      <div className="sw-barra">
        <a href={enPanel ? "#/" : "#/panel"} className="sw-ir" title={enPanel ? "Ver la web" : "Ver el panel"}>
          {enPanel ? <Store size={16} /> : <LayoutDashboard size={16} />} <span>{enPanel ? "Web" : "Panel"}</span>
        </a>
        <button onClick={() => mover(-1)} aria-label="Diseño anterior">
          <ChevronLeft size={18} />
        </button>
        <button className="sw-nombre" onClick={() => setAbierta(!abierta)} aria-expanded={abierta}>
          <Palette size={15} /> {i + 1}/{DISENOS.length} · {actual.nombre}
        </button>
        <button onClick={() => mover(1)} aria-label="Diseño siguiente">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default function App({ tipo, cambiarTipo, demo, barra = demo }: { tipo: IdTipo; cambiarTipo: (t: IdTipo) => void; demo: boolean; barra?: boolean }) {
  const { st } = useResto();
  const [ruta, setRuta] = useState(leerRuta);

  useEffect(() => {
    const on = () => {
      const nueva = leerRuta();
      setRuta((vieja) => {
        if (nueva !== vieja) window.scrollTo(0, 0);
        return nueva;
      });
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  // El diseño y el color propio se aplican en <html> (las variables de cada diseño cuelgan de ahí).
  const { diseno, acento, nombre } = st.local;
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.d = diseno;
    if (acento) {
      html.style.setProperty("--acc", acento);
      html.style.setProperty("--acc-ink", "#fff");
    } else {
      html.style.removeProperty("--acc");
      html.style.removeProperty("--acc-ink");
    }
  }, [diseno, acento]);

  // Tipografía propia: pisa las del diseño.
  const tipografia = st.local.web.tipografia;
  useEffect(() => {
    const html = document.documentElement;
    const t = TIPOGRAFIAS.find((x) => x.id === tipografia);
    const vars = { "--f-disp": t?.disp, "--f-text": t?.texto, "--f-ui": t?.ui, "--f-plato": t?.disp, "--f-num": t?.ui };
    for (const [k, v] of Object.entries(vars)) {
      if (v) html.style.setProperty(k, v);
      else html.style.removeProperty(k);
    }
  }, [tipografia]);

  const enPanel = ruta.startsWith("/panel");
  // Quien entra por el QR de la mesa ve la web como un cliente, sin la barra de la demo.
  const [enMesa] = useState(() => new URLSearchParams(location.search).has("mesa"));
  useEffect(() => {
    document.title = enPanel ? `Panel · ${nombre}` : `${nombre} · ${st.local.bajada}`;
  }, [enPanel, nombre, st.local.bajada]);

  let vista;
  if (enPanel) vista = <Panel ruta={ruta} />;
  else if (ruta.startsWith("/terminos")) vista = <Terminos />;
  else if (ruta.startsWith("/imprimir/carta")) vista = <CartaImprimible />;
  else if (ruta.startsWith("/imprimir/qr")) vista = <QrMesas />;
  else vista = <Publico demo={demo} />;

  return (
    <>
      {vista}
      {barra && !ruta.startsWith("/imprimir") && !(enMesa && !enPanel) && <BarraDemo tipo={tipo} cambiarTipo={cambiarTipo} enPanel={enPanel} />}
    </>
  );
}
