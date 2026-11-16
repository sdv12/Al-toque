"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { codificarConfig } from "@/core/lib/codigo";
import { formatearPesos } from "@/core/lib/mensajes";
import { enviarPedido, type ResultadoPedido } from "../pedido";
import { recomendar, resumenRespuestas, type Recomendacion, type Respuestas } from "./alto";
import { preguntasPara, respuestaEnTexto, validarWhatsapp, type Opcion, type Parcial, type Pregunta } from "./preguntas";
import { Robot } from "./Robot";

/*
 * El chat de Alto. Recorre el guion de preguntas.ts: cada respuesta se guarda con una copia de
 * cómo estaba todo antes, así "Volver" deshace la última. Al final arma la recomendación (alto.ts)
 * y el pedido, que llega con todo lo que contó.
 */

const CLAVE_BORRADOR = "landing-kit:borrador";
const BIENVENIDA = "¡Bienvenido/a! Soy Alto, el asistente virtual. ¿Te ayudo a armar tu página?";

const chip =
  "inline-flex min-h-10 items-center gap-2 rounded-full border-2 border-tinta bg-superficie px-3.5 text-chico font-semibold transition-colors hover:bg-acento-relleno/40 aria-pressed:bg-acento-relleno aria-pressed:text-sobre-acento disabled:opacity-40";
const botonLleno = "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-tinta px-4 font-semibold text-fondo disabled:opacity-50";
const plataMes = (unico: number, mensual: number) => `${formatearPesos(unico)} + ${formatearPesos(mensual)}/mes`;

type Paso = { id: string; antes: Parcial };

export default function AltoPanel({ whatsapp, visible, onCerrar }: { whatsapp: string | undefined; visible: boolean; onCerrar: () => void }) {
  const [empezo, setEmpezo] = useState(false);
  const [mirando, setMirando] = useState(false);
  const [r, setR] = useState<Parcial>({});
  const [hechos, setHechos] = useState<Paso[]>([]);
  /** Pregunta cuyo texto ya se "escribió" (mientras no, se ven los puntitos). */
  const [vista, setVista] = useState<string | null>(null);
  const [marcadas, setMarcadas] = useState<string[]>([]);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [escribiendoOtro, setEscribiendoOtro] = useState<Opcion | null>(null);
  const [pedido, setPedido] = useState<ResultadoPedido | "enviando" | null>(null);
  const [codigo, setCodigo] = useState("");
  const titulo = useId();
  const panel = useRef<HTMLDivElement>(null);
  const fin = useRef<HTMLDivElement>(null);

  const aplicables = preguntasPara(r);
  const actual: Pregunta | undefined = empezo ? aplicables.find((p) => !hechos.some((h) => h.id === p.id)) : undefined;
  const terminado = empezo && !actual;
  const escribiendo = !!actual && vista !== actual.id;
  const completas = useMemo(() => (terminado ? ({ color: null, dificultades: [], funciones: [], ...r } as Respuestas) : null), [terminado, r]);
  const rec = useMemo(() => (completas ? recomendar(completas) : null), [completas]);

  // La pregunta nueva aparece después de un "escribiendo…" corto (sin espera con menos movimiento).
  useEffect(() => {
    if (!actual || vista === actual.id) return;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(
      () => {
        setVista(actual.id);
        setMarcadas(actual.tipo === "varias" && actual.sugeridas ? actual.sugeridas(r) : []);
        setTexto("");
        setError(null);
      },
      quieto ? 0 : 450 + actual.texto(r).join(" ").length * 6,
    );
    return () => clearTimeout(t);
  }, [actual, vista, r]);

  useEffect(() => {
    fin.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [hechos.length, vista, terminado, pedido, empezo, mirando]);

  useEffect(() => {
    if (visible) panel.current?.focus();
  }, [visible]);

  // Código LK1 de la página recomendada (para el mail del pedido): comprimir es asíncrono.
  useEffect(() => {
    if (!rec?.borrador) return;
    let vigente = true;
    void codificarConfig(rec.borrador).then((c) => vigente && setCodigo(c));
    return () => {
      vigente = false;
    };
  }, [rec]);

  function responder(p: Pregunta, cambios: Parcial) {
    setHechos((h) => [...h, { id: p.id, antes: r }]);
    setR((x) => ({ ...x, ...cambios }));
    setEscribiendoOtro(null);
  }

  function volver() {
    const ultimo = hechos[hechos.length - 1];
    if (!ultimo) return;
    setHechos((h) => h.slice(0, -1));
    setR(ultimo.antes);
    setVista(null);
    setPedido(null);
  }

  function reiniciar() {
    setR({});
    setHechos([]);
    setVista(null);
    setPedido(null);
    setCodigo("");
    setEmpezo(true);
  }

  function enviarTexto(e: FormEvent) {
    e.preventDefault();
    if (!actual) return;
    if (escribiendoOtro && actual.tipo === "una") {
      if (texto.trim()) responder(actual, actual.guardar(escribiendoOtro.valor, r, texto));
      return;
    }
    if (actual.tipo === "texto" && texto.trim()) responder(actual, actual.guardar(texto, r));
    if (actual.tipo === "whatsapp") {
      const v = validarWhatsapp(texto);
      if (!v.ok) return setError(v.error);
      responder(actual, actual.guardar(v.numero));
    }
  }

  function saltear(p: Pregunta) {
    if (p.tipo === "texto") responder(p, p.guardar(null, r));
    else if (p.tipo === "whatsapp") responder(p, p.guardar(null));
    else if (p.tipo === "una") responder(p, p.guardar(null, r));
  }

  /** "Armar mi página": deja la página recomendada como borrador del configurador (guardando el anterior). */
  function prepararConfigurador() {
    if (!rec?.borrador) return;
    try {
      const anterior = localStorage.getItem(CLAVE_BORRADOR);
      if (anterior) localStorage.setItem(`${CLAVE_BORRADOR}-anterior`, anterior);
      localStorage.setItem(CLAVE_BORRADOR, JSON.stringify(rec.borrador));
    } catch {}
  }

  /** porWhatsapp: abre WhatsApp con el resumen; si no, solo queda el pedido por mail (con su WhatsApp para escribirle). */
  async function enviar(porWhatsapp: boolean) {
    if (!completas || !rec) return;
    setPedido("enviando");
    const quien = completas.contacto ? `Soy ${completas.contacto}. ` : "";
    setPedido(
      await enviarPedido(
        {
          tipo: "Consulta",
          negocio: completas.nombre || completas.contacto || "Sin nombre todavía",
          detalle: rec.productos.map((p) => p.titulo).join(" + "),
          estimado: plataMes(rec.total.unico, rec.total.mensual),
          slug: "",
          saludo: `¡Hola! ${quien}Charlé con Alto${completas.nombre ? ` para ${completas.nombre}` : ""} y me interesa.`,
          resumen: [`Le recomendó: ${rec.productos.map((p) => p.titulo).join(", ")}`, `Estimado: ${plataMes(rec.total.unico, rec.total.mensual)}`, ...resumenRespuestas(completas)],
          configuracion: { respuestas: { ...completas, rubro: completas.rubro.id }, recomendacion: rec.productos.map((p) => p.id), pagina: rec.borrador },
          codigo: codigo || "—",
        },
        porWhatsapp ? whatsapp : undefined,
      ),
    );
  }

  const indice = hechos.length;
  const total = aplicables.length;

  return (
    <div
      hidden={!visible}
      ref={panel}
      tabIndex={-1}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titulo}
      onKeyDown={(e) => e.key === "Escape" && onCerrar()}
      className="fixed inset-0 z-50 flex animate-alto-aparece flex-col bg-fondo outline-none motion-reduce:animate-none sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[min(44rem,calc(100dvh-3rem))] sm:w-[26rem] sm:overflow-hidden sm:rounded-base sm:border-2 sm:border-tinta sm:shadow-[0_30px_70px_-25px_rgb(23_21_15/0.6)]"
    >
      <header className="bg-tinta px-4 pt-3 pb-2.5 text-fondo">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full bg-fondo">
            <Robot className="size-10" />
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p id={titulo} className="font-semibold">
              Alto <span className="ml-1 rounded-full bg-acento-relleno px-1.5 py-0.5 text-mini font-bold text-sobre-acento">asistente virtual</span>
            </p>
            <p className="mt-0.5 text-mini opacity-75">{escribiendo ? "escribiendo…" : "en línea · responde al instante"}</p>
          </div>
          <button type="button" onClick={onCerrar} aria-label="Cerrar a Alto" className="grid size-10 place-items-center rounded-full hover:bg-fondo/10">
            <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M5 5l10 10M15 5 5 15" />
            </svg>
          </button>
        </div>
        {empezo && (
          <div className="mt-2.5 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-fondo/15" role="progressbar" aria-label="Avance" aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.min(indice, total)}>
              <div className="h-full rounded-full bg-acento-relleno transition-[width] duration-300" style={{ width: `${(Math.min(indice, total) / total) * 100}%` }} />
            </div>
            <span className="text-mini tabular-nums opacity-75">{terminado ? "¡Listo!" : `Pregunta ${indice + 1} de ${total}`}</span>
          </div>
        )}
      </header>

      <div role="log" aria-live="polite" className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 py-4">
        <Globo de="alto">{BIENVENIDA}</Globo>
        {mirando && !empezo && (
          <>
            <Globo de="yo">Solo estoy mirando</Globo>
            <Globo de="alto">¡Dale! Cuando quieras, tocá «Empecemos» y en un par de minutos te digo qué te conviene.</Globo>
          </>
        )}
        {empezo && <Globo de="yo">¡Dale, empecemos!</Globo>}
        {hechos.map((h) => {
          const p = aplicables.find((x) => x.id === h.id);
          if (!p) return null;
          return (
            <div key={h.id} className="space-y-2.5">
              {p.texto(h.antes).map((t) => (
                <Globo key={t} de="alto">
                  {t}
                </Globo>
              ))}
              <Globo de="yo">{respuestaEnTexto(p, r)}</Globo>
            </div>
          );
        })}
        {actual &&
          (escribiendo ? (
            <span className="flex w-fit gap-1 rounded-[1.1rem] rounded-bl-[0.3rem] border border-borde bg-superficie px-4 py-3" aria-label="Alto está escribiendo">
              {[0, 1, 2].map((p) => (
                <span key={p} className="size-1.5 animate-bounce rounded-full bg-tinta-suave motion-reduce:animate-none" style={{ animationDelay: `${p * 140}ms` }} />
              ))}
            </span>
          ) : (
            actual.texto(r).map((t) => (
              <Globo key={t} de="alto">
                {t}
              </Globo>
            ))
          ))}
        {terminado && rec && completas && (
          <>
            <Globo de="alto">{`Listo${completas.contacto ? `, ${completas.contacto.split(" ")[0]}` : ""}. Esto es lo que te recomiendo${completas.nombre ? ` para ${completas.nombre}` : ""}:`}</Globo>
            <Resultado rec={rec} onConfigurador={prepararConfigurador} />
            <details className="rounded-[1.1rem] border border-borde bg-superficie px-3.5 py-2.5 text-mini">
              <summary className="cursor-pointer font-semibold">Lo que me contaste</summary>
              <ul className="mt-2 space-y-1 text-tinta-suave">
                {resumenRespuestas(completas).map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </details>
          </>
        )}
        {pedido && pedido !== "enviando" && (
          <Globo de="alto">
            {pedido.numero ? `¡Recibido! Tu consulta es la ${pedido.numero}. ` : "¡Recibido! "}
            {pedido.porWhatsapp
              ? "Se abrió WhatsApp con el resumen: mandalo y seguimos por ahí."
              : completas?.whatsapp
                ? `Te escribimos al +${completas.whatsapp} a la brevedad.`
                : "Te contestamos a la brevedad."}
          </Globo>
        )}
        <div ref={fin} />
      </div>

      <div className="border-t-2 border-tinta/10 bg-superficie-2 px-4 py-3">
        {!empezo ? (
          <div className="flex flex-wrap gap-2">
            <button type="button" className={`${chip} bg-acento-relleno text-sobre-acento`} onClick={() => setEmpezo(true)}>
              ¡Dale, empecemos!
            </button>
            {!mirando && (
              <button type="button" className={chip} onClick={() => setMirando(true)}>
                Solo estoy mirando
              </button>
            )}
          </div>
        ) : actual && !escribiendo ? (
          <Respuesta
            p={actual}
            r={r}
            titulo={titulo}
            texto={texto}
            setTexto={setTexto}
            error={error}
            marcadas={marcadas}
            escribiendoOtro={escribiendoOtro}
            onOtro={setEscribiendoOtro}
            onAlternar={(v) => setMarcadas((m) => (m.includes(v) ? m.filter((x) => x !== v) : [...m, v]))}
            onUna={(v) => actual.tipo === "una" && responder(actual, actual.guardar(v, r))}
            onListo={() => actual.tipo === "varias" && responder(actual, actual.guardar(marcadas))}
            onSaltear={() => saltear(actual)}
            onEnviarTexto={enviarTexto}
          />
        ) : terminado ? (
          <div className="flex flex-col gap-2">
            {(!pedido || pedido === "enviando") && (
              <>
                <button type="button" disabled={pedido === "enviando"} onClick={() => enviar(true)} className={botonLleno}>
                  {pedido === "enviando" ? "Enviando…" : "Mandarlo por WhatsApp"}
                </button>
                {completas?.whatsapp && (
                  <button type="button" disabled={pedido === "enviando"} onClick={() => enviar(false)} className={`${chip} justify-center`}>
                    Que me escriban ustedes
                  </button>
                )}
              </>
            )}
            {pedido && pedido !== "enviando" && pedido.link && !pedido.porWhatsapp && whatsapp && (
              <a href={pedido.link} target="_blank" rel="noopener noreferrer" className={botonLleno}>
                Abrir WhatsApp
              </a>
            )}
          </div>
        ) : null}
        {empezo && (
          <div className="mt-2.5 flex justify-between text-mini font-semibold">
            <button type="button" onClick={volver} disabled={!hechos.length} className="underline underline-offset-4 disabled:invisible">
              ← Volver
            </button>
            <button type="button" onClick={reiniciar} className="underline underline-offset-4">
              Empezar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Lo que se puede contestar a la pregunta actual (texto, WhatsApp, una opción o varias). */
function Respuesta(props: {
  p: Pregunta;
  r: Parcial;
  titulo: string;
  texto: string;
  setTexto: (t: string) => void;
  error: string | null;
  marcadas: string[];
  escribiendoOtro: Opcion | null;
  onOtro: (o: Opcion | null) => void;
  onAlternar: (v: string) => void;
  onUna: (v: string) => void;
  onListo: () => void;
  onSaltear: () => void;
  onEnviarTexto: (e: FormEvent) => void;
}) {
  const { p, r, titulo, texto, setTexto, error, marcadas, escribiendoOtro } = props;
  const campo = (etiqueta: string, placeholder: string, max: number, tel = false) => (
    <form onSubmit={props.onEnviarTexto} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <label className="sr-only" htmlFor={`${titulo}-campo`}>
          {etiqueta}
        </label>
        <input
          id={`${titulo}-campo`}
          autoFocus
          value={texto}
          maxLength={max}
          type={tel ? "tel" : "text"}
          inputMode={tel ? "tel" : undefined}
          autoComplete={tel ? "tel" : undefined}
          aria-invalid={!!error}
          aria-describedby={error ? `${titulo}-error` : undefined}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={placeholder}
          className="min-h-11 min-w-0 flex-1 rounded-full border-2 border-tinta bg-fondo px-4 text-cuerpo aria-invalid:border-[#b3261e]"
        />
        <button type="submit" disabled={!texto.trim()} className="rounded-full bg-tinta px-4 font-semibold text-fondo disabled:opacity-40">
          Enviar
        </button>
      </div>
      {error && (
        <p id={`${titulo}-error`} className="text-mini font-semibold text-[#b3261e]">
          {error}
        </p>
      )}
    </form>
  );
  const saltear = p.saltear && (
    <button type="button" className={`${chip} self-start`} onClick={props.onSaltear}>
      {p.saltear}
    </button>
  );

  if (p.tipo === "texto")
    return (
      <div className="flex flex-col gap-2">
        {campo(p.texto(r).at(-1) ?? "Respuesta", p.placeholder, p.max)}
        {saltear}
      </div>
    );
  if (p.tipo === "whatsapp")
    return (
      <div className="flex flex-col gap-2">
        {campo("Tu WhatsApp", p.placeholder, 25, true)}
        {saltear}
      </div>
    );
  if (p.tipo === "una" && escribiendoOtro)
    return (
      <div className="flex flex-col gap-2">
        {campo(escribiendoOtro.escribir ?? "Contanos", escribiendoOtro.escribir ?? "", 60)}
        <button type="button" className={`${chip} self-start`} onClick={() => props.onOtro(null)}>
          ← Ver las opciones
        </button>
      </div>
    );
  if (p.tipo === "una")
    return (
      <Opciones etiqueta={p.texto(r).at(-1)}>
        {p.opciones(r).map((o) => (
          <button key={o.valor} type="button" className={chip} onClick={() => (o.escribir ? props.onOtro(o) : props.onUna(o.valor))}>
            {o.color && <span aria-hidden className="size-5 rounded-full border-2 border-tinta" style={{ background: o.color }} />}
            {o.etiqueta}
          </button>
        ))}
        {saltear}
      </Opciones>
    );
  return (
    <>
      <Opciones etiqueta={p.texto(r).at(-1)}>
        {p.opciones(r).map((o) => (
          <button key={o.valor} type="button" aria-pressed={marcadas.includes(o.valor)} className={chip} onClick={() => props.onAlternar(o.valor)}>
            {marcadas.includes(o.valor) && <span aria-hidden>✓</span>}
            {o.etiqueta}
          </button>
        ))}
      </Opciones>
      <button type="button" onClick={props.onListo} className={`${botonLleno} mt-3`}>
        {marcadas.length ? `Listo (${marcadas.length})` : p.ninguna}
      </button>
    </>
  );
}

function Globo({ de, children }: { de: "alto" | "yo"; children: ReactNode }) {
  return (
    <p
      className={`w-fit max-w-[85%] animate-alto-aparece rounded-[1.1rem] px-3.5 py-2 text-chico leading-snug motion-reduce:animate-none ${
        de === "yo" ? "ml-auto rounded-br-[0.3rem] bg-tinta text-fondo" : "rounded-bl-[0.3rem] border border-borde bg-superficie"
      }`}
    >
      {children}
    </p>
  );
}

function Opciones({ children, etiqueta }: { children: ReactNode; etiqueta?: string }) {
  return (
    <div role="group" aria-label={etiqueta ?? "Respuestas"} className="flex max-h-[34dvh] flex-wrap gap-2 overflow-y-auto sm:max-h-52">
      {children}
    </div>
  );
}

function Resultado({ rec, onConfigurador }: { rec: Recomendacion; onConfigurador: () => void }) {
  return (
    <div className="animate-alto-aparece rounded-[1.1rem] border-2 border-tinta bg-superficie p-3.5 motion-reduce:animate-none">
      <ul className="space-y-3.5">
        {rec.productos.map((p) => (
          <li key={p.id} className="border-b border-borde pb-3.5 last:border-0 last:pb-0">
            <p className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="font-semibold">{p.titulo}</span>
              <span className="text-mini tabular-nums">{p.precio.unico || p.precio.mensual ? plataMes(p.precio.unico, p.precio.mensual) : "Incluido"}</span>
            </p>
            <ul className="mt-1.5 space-y-1 text-mini text-tinta-suave">
              {p.porque.map((x) => (
                <li key={x} className="flex gap-2">
                  <span aria-hidden className="mt-[0.55em] h-1 w-2 shrink-0 bg-acento-relleno" />
                  {x}
                </li>
              ))}
            </ul>
            <Link
              href={p.accion.href}
              onClick={p.id === "landing" ? onConfigurador : undefined}
              className="mt-2.5 inline-flex min-h-10 items-center rounded-full border-2 border-tinta px-4 text-chico font-semibold hover:bg-acento-relleno"
            >
              {p.accion.texto} →
            </Link>
          </li>
        ))}
      </ul>
      {rec.aparte.map((x) => (
        <p key={x} className="mt-3 text-mini text-tinta-suave">
          {x}
        </p>
      ))}
      <p className="mt-3 flex items-baseline justify-between gap-3 border-t-2 border-tinta pt-3">
        <span className="font-semibold">Total estimado</span>
        <span className="font-semibold tabular-nums">{plataMes(rec.total.unico, rec.total.mensual)}</span>
      </p>
      <p className="mt-1 text-mini text-tinta-suave">Precios de referencia; el final lo confirmamos al charlar.</p>
    </div>
  );
}
