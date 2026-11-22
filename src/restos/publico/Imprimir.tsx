"use client";

import { Printer } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { resumenHorarios } from "../lib/horarios";
import { textoDias } from "../lib/logica";
import { useResto } from "../lib/store";
import { ETIQUETAS, type Mesa } from "../lib/tipos";
import { plata } from "../lib/util";
import { seccionesVisibles } from "./Carta";
import { Sello } from "./comun";

/** El link que abre la carta desde una mesa (en la demo conserva el tipo de local). */
export function linkMesa(mesa: Mesa, tipo: string) {
  const u = new URL(location.href);
  u.hash = "";
  u.search = "";
  if (u.pathname.endsWith("/resto/demo")) u.searchParams.set("tipo", tipo);
  u.searchParams.set("mesa", mesa.nombre);
  return u.toString();
}

function BarraImprimir({ titulo, children }: { titulo: string; children?: React.ReactNode }) {
  return (
    <div className="imp-barra no-imprimir">
      <a href="#/panel/web">← Volver al panel</a>
      <strong>{titulo}</strong>
      {children}
      <button className="btn btn-1" onClick={() => window.print()}>
        <Printer size={16} /> Imprimir o guardar en PDF
      </button>
    </div>
  );
}

/** La carta lista para imprimir (A4), con el diseño del local. */
export function CartaImprimible() {
  const { st } = useResto();
  const { local } = st;
  const [precios, setPrecios] = useState(true);
  const cats = seccionesVisibles(st).filter((c) => !c.tienda);
  return (
    <div className={"pub hoja-carta pub-" + local.diseno}>
      <BarraImprimir titulo="Carta para imprimir">
        <label className="check-linea">
          <input type="checkbox" checked={precios} onChange={(e) => setPrecios(e.target.checked)} /> Con precios
        </label>
      </BarraImprimir>
      <article className="hoja">
        <header className="hoja-cab">
          <Sello nombre={local.nombre} grande />
          <h1>{local.nombre}</h1>
          <p>{local.bajada}</p>
        </header>
        <div className="hoja-cuerpo">
          {cats.map((c) => (
            <section key={c.id} className="hoja-sec">
              <h2>{c.nombre}</h2>
              {c.nota && <p className="hoja-nota">{c.nota}</p>}
              <ul>
                {st.platos
                  .filter((p) => p.cat === c.id)
                  .map((p) => (
                    <li key={p.id}>
                      <div className="hoja-plato">
                        <b>{p.nombre}</b>
                        <span className="pl-dots" aria-hidden />
                        {precios && <span>{plata(p.precio)}</span>}
                      </div>
                      {(p.desc || p.porcion || p.etiquetas.length || p.dias?.length) && (
                        <small>
                          {[p.desc, p.porcion, ...p.etiquetas.map((e) => ETIQUETAS[e].nombre), p.dias?.length ? textoDias(p.dias) : ""].filter(Boolean).join(" · ")}
                        </small>
                      )}
                      {p.opciones?.length ? <small className="hoja-ops">{p.opciones.map((g) => `${g.nombre}: ${g.valores.map((v) => v.nombre).join(", ")}`).join(" · ")}</small> : null}
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
        <footer className="hoja-pie">
          {local.direccion} · {resumenHorarios(local.horarios).map((g) => `${g.dias}: ${g.texto}`).join(" · ")}
          {local.instagram ? ` · @${local.instagram}` : ""}
        </footer>
      </article>
    </div>
  );
}

function QR({ texto }: { texto: string }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    let vivo = true;
    QRCode.toString(texto, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#ffffff" } }).then((s) => vivo && setSvg(s));
    return () => {
      vivo = false;
    };
  }, [texto]);
  // El SVG lo genera la librería a partir de nuestro propio link (no hay texto de terceros).
  return <div className="qr" role="img" aria-label="Código QR" dangerouslySetInnerHTML={{ __html: svg }} />;
}

/** Tarjetas con el QR de cada mesa, para imprimir, recortar y poner en un portacarta. */
export function QrMesas() {
  const { st } = useResto();
  const { local } = st;
  const [texto, setTexto] = useState("Escaneá para ver la carta, llamar al mozo o pedir la cuenta");
  return (
    <div className={"pub hoja-qr pub-" + local.diseno}>
      <BarraImprimir titulo={`QR de las ${st.mesas.length} mesas`}>
        <input value={texto} onChange={(e) => setTexto(e.target.value)} aria-label="Texto de las tarjetas" className="imp-texto" />
      </BarraImprimir>
      {!st.mesas.length && <p className="vacio no-imprimir">No hay mesas cargadas.</p>}
      <div className="tarjetas-qr">
        {st.mesas.map((m) => (
          <div key={m.id} className="tarjeta-qr">
            <div className="tq-cab">
              <Sello nombre={local.nombre} />
              <span>{local.nombre}</span>
            </div>
            <QR texto={linkMesa(m, local.tipo)} />
            <strong>Mesa {m.nombre}</strong>
            <small>{texto}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
