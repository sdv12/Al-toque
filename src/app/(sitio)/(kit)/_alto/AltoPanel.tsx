"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { codificarConfig } from "@/core/lib/codigo";
import { formatearPesos } from "@/core/lib/mensajes";
import { enviarPedido, type ResultadoPedido } from "../pedido";
import {
  DIFICULTADES,
  FUNCIONES,
  PRIORIDADES,
  RUBROS,
  ZONAS,
  coloresPara,
  funcionesSugeridas,
  recomendar,
  resumenRespuestas,
  type ColorAlto,
  type Dificultad,
  type Funcion,
  type Prioridad,
  type Recomendacion,
  type Respuestas,
  type RubroAlto,
  type Zona,
} from "./alto";

/*
 * Alto: chat de preguntas rápidas que termina en una recomendación con precios y botones para
 * probar cada cosa (configurador, agenda, caja) o pedirla por WhatsApp. Sin IA: reglas en alto.ts.
 */

type Paso = "nombre" | "rubro" | "dificultades" | "prioridad" | "zona" | "color" | "funciones" | "resultado" | "inicio";
type Mensaje = { de: "alto" | "yo"; texto: string } | { de: "alto"; resultado: Recomendacion };

const CLAVE_BORRADOR = "landing-kit:borrador";
const MULTIPLES: Paso[] = ["dificultades", "funciones"];

const chip =
  "inline-flex min-h-10 items-center gap-2 rounded-full border-2 border-tinta bg-superficie px-3.5 text-chico font-semibold transition-colors hover:bg-acento-relleno/40 aria-pressed:bg-acento-relleno aria-pressed:text-sobre-acento disabled:opacity-40";

const plataMes = (unico: number, mensual: number) => `${formatearPesos(unico)} + ${formatearPesos(mensual)}/mes`;

/** El panel del chat. Se carga recién cuando alguien toca la burbuja (ver Alto.tsx). */
export default function AltoPanel({ whatsapp, visible, onCerrar }: { whatsapp: string | undefined; visible: boolean; onCerrar: () => void }) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [paso, setPaso] = useState<Paso>("inicio");
  const [escribiendo, setEscribiendo] = useState(false);
  const [texto, setTexto] = useState("");
  const [r, setR] = useState<Partial<Respuestas>>({});
  const [marcadas, setMarcadas] = useState<string[]>([]);
  const [pedido, setPedido] = useState<ResultadoPedido | "enviando" | null>(null);
  const [codigo, setCodigo] = useState<string>("");
  const titulo = useId();
  const panel = useRef<HTMLDivElement>(null);
  const fin = useRef<HTMLDivElement>(null);
  const tiempos = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const lista = tiempos.current;
    // La charla arranca al montarse (después de este render: los setState van en el temporizador).
    lista.push(setTimeout(() => empezar(), 0));
    return () => lista.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Cada vez que se muestra, el foco va al panel.
  useEffect(() => {
    if (visible) panel.current?.focus();
  }, [visible]);
  useEffect(() => {
    fin.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [mensajes, escribiendo, paso]);

  const recomendacion = mensajes.reduce<Recomendacion | null>((x, m) => ("resultado" in m ? m.resultado : x), null);
  // Código LK1 de la página recomendada (para el pedido): comprimir es asíncrono, se prepara antes del clic.
  useEffect(() => {
    if (!recomendacion?.borrador) return;
    let vigente = true;
    void codificarConfig(recomendacion.borrador).then((c) => vigente && setCodigo(c));
    return () => {
      vigente = false;
    };
  }, [recomendacion]);

  /** Alto "escribe" cada mensaje con una pausa corta (sin pausa si la persona pidió menos movimiento). */
  function decir(textos: (string | Recomendacion)[], siguiente: Paso) {
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPaso("inicio");
    let espera = 0;
    textos.forEach((t, i) => {
      espera += quieto ? 0 : typeof t === "string" ? Math.min(1100, 350 + t.length * 9) : 600;
      setEscribiendo(true);
      tiempos.current.push(
        setTimeout(() => {
          setMensajes((m) => [...m, typeof t === "string" ? { de: "alto", texto: t } : { de: "alto", resultado: t }]);
          if (i === textos.length - 1) {
            setEscribiendo(false);
            setPaso(siguiente);
          }
        }, espera),
      );
    });
  }

  const yo = (t: string) => setMensajes((m) => [...m, { de: "yo", texto: t }]);

  function empezar() {
    tiempos.current.forEach(clearTimeout);
    setMensajes([]);
    setR({});
    setMarcadas([]);
    setPedido(null);
    setCodigo("");
    decir(["¡Hola! Soy Alto 👋", "Te hago unas preguntas cortas y te digo qué te conviene armar para tu negocio.", "¿Cómo se llama tu negocio?"], "nombre");
  }

  const cerrar = onCerrar;

  function responderNombre(nombre: string) {
    const n = nombre.trim();
    yo(n || "Todavía no tiene nombre");
    setR((x) => ({ ...x, nombre: n }));
    setTexto("");
    decir([n ? `¡Buenísimo, ${n}!` : "No pasa nada, lo vemos después.", "¿De qué rubro es?"], "rubro");
  }

  function elegirRubro(rubro: RubroAlto) {
    yo(rubro.nombre);
    setR((x) => ({ ...x, rubro }));
    decir(["¿Qué es lo que más te complica hoy? Podés marcar varias."], "dificultades");
  }

  function listoDificultades() {
    const d = marcadas as Dificultad[];
    yo(d.length ? d.map((x) => DIFICULTADES[x]).join(" · ") : "Nada de esto, por ahora");
    setR((x) => ({ ...x, dificultades: d }));
    setMarcadas([]);
    decir([d.length ? "Entendido, eso tiene solución." : "Mejor así 🙌", "¿Qué querés resolver primero?"], "prioridad");
  }

  function elegirPrioridad(p: Prioridad) {
    yo(PRIORIDADES[p]);
    setR((x) => ({ ...x, prioridad: p }));
    decir(["¿Qué zona querés cubrir?"], "zona");
  }

  function elegirZona(z: Zona) {
    yo(ZONAS[z]);
    setR((x) => ({ ...x, zona: z }));
    decir(["¿Qué colores van con tu negocio?"], "color");
  }

  function elegirColor(c: ColorAlto | null) {
    yo(c ? c.nombre : "Que lo elijan ustedes después");
    const sig = { ...r, color: c } as Omit<Respuestas, "funciones">;
    setR(sig);
    setMarcadas(funcionesSugeridas(sig));
    decir(["Última: ¿qué te gustaría que tenga?", "Te marqué lo que te puede servir por lo que me contaste. Sumá o sacá lo que quieras."], "funciones");
  }

  function listoFunciones() {
    const f = marcadas as Funcion[];
    yo(f.length ? f.map((x) => FUNCIONES[x]).join(" · ") : "No sé, decime vos");
    const todas = { ...r, funciones: f } as Respuestas;
    setR(todas);
    setMarcadas([]);
    const rec = recomendar(todas);
    decir([`Listo. Esto es lo que te recomiendo${todas.nombre ? ` para ${todas.nombre}` : ""}:`, rec], "resultado");
  }

  function alternar(id: string) {
    setMarcadas((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));
  }

  /** "Armar mi página": deja la página recomendada como borrador del configurador (guardando el anterior). */
  function prepararConfigurador(rec: Recomendacion) {
    if (!rec.borrador) return;
    try {
      const anterior = localStorage.getItem(CLAVE_BORRADOR);
      if (anterior) localStorage.setItem(`${CLAVE_BORRADOR}-anterior`, anterior);
      localStorage.setItem(CLAVE_BORRADOR, JSON.stringify(rec.borrador));
    } catch {}
  }

  async function hablar(rec: Recomendacion) {
    const todas = r as Respuestas;
    setPedido("enviando");
    const resultado = await enviarPedido(
      {
        tipo: "Consulta",
        negocio: todas.nombre || "Sin nombre todavía",
        detalle: rec.productos.map((p) => p.titulo).join(" + "),
        estimado: plataMes(rec.total.unico, rec.total.mensual),
        slug: "",
        saludo: `¡Hola! Charlé con Alto${todas.nombre ? ` para ${todas.nombre}` : ""} y me interesa.`,
        resumen: [`Le recomendó: ${rec.productos.map((p) => p.titulo).join(", ")}`, `Estimado: ${plataMes(rec.total.unico, rec.total.mensual)}`, ...resumenRespuestas(todas)],
        configuracion: { respuestas: { ...todas, rubro: todas.rubro.id }, recomendacion: rec.productos.map((p) => p.id), pagina: rec.borrador },
        codigo: codigo || "—",
      },
      whatsapp,
    );
    setPedido(resultado);
  }

  function enviarTexto(e: FormEvent) {
    e.preventDefault();
    if (paso === "nombre") responderNombre(texto);
  }

  const rubro = r.rubro;

  return (
    <>
      <div
          hidden={!visible}
          ref={panel}
          tabIndex={-1}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titulo}
          onKeyDown={(e) => e.key === "Escape" && cerrar()}
          className="fixed inset-0 z-50 flex flex-col bg-fondo outline-none sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[min(42rem,calc(100dvh-3rem))] sm:w-[25rem] sm:overflow-hidden sm:rounded-base sm:border-2 sm:border-tinta sm:shadow-[0_30px_70px_-25px_rgb(23_21_15/0.6)]"
        >
          <header className="flex items-center gap-3 bg-tinta px-4 py-3 text-fondo">
            <Avatar />
            <div className="min-w-0 flex-1 leading-tight">
              <p id={titulo} className="font-semibold">
                Alto
              </p>
              <p className="text-mini opacity-75">{escribiendo ? "escribiendo…" : "responde al instante"}</p>
            </div>
            <button type="button" onClick={empezar} className="rounded-control px-2 py-1.5 text-mini font-semibold opacity-80 hover:bg-fondo/10 hover:opacity-100">
              Empezar de nuevo
            </button>
            <button type="button" onClick={cerrar} aria-label="Cerrar a Alto" className="grid size-10 place-items-center rounded-full hover:bg-fondo/10">
              <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M5 5l10 10M15 5 5 15" />
              </svg>
            </button>
          </header>

          <div role="log" aria-live="polite" className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 py-4">
            {mensajes.map((m, i) =>
              "resultado" in m ? (
                <Resultado key={i} rec={m.resultado} onConfigurador={() => prepararConfigurador(m.resultado)} />
              ) : (
                <p
                  key={i}
                  className={`max-w-[85%] w-fit rounded-[1.1rem] px-3.5 py-2 text-chico leading-snug ${
                    m.de === "yo" ? "ml-auto rounded-br-[0.3rem] bg-tinta text-fondo" : "rounded-bl-[0.3rem] border border-borde bg-superficie"
                  }`}
                >
                  {m.texto}
                </p>
              ),
            )}
            {escribiendo && (
              <span className="flex w-fit gap-1 rounded-[1.1rem] rounded-bl-[0.3rem] border border-borde bg-superficie px-4 py-3" aria-label="Alto está escribiendo">
                {[0, 1, 2].map((p) => (
                  <span key={p} className="size-1.5 animate-bounce rounded-full bg-tinta-suave motion-reduce:animate-none" style={{ animationDelay: `${p * 140}ms` }} />
                ))}
              </span>
            )}
            <div ref={fin} />
          </div>

          <div className="border-t-2 border-tinta/10 bg-superficie-2 px-4 py-3">
            {paso === "nombre" && (
              <form onSubmit={enviarTexto} className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <label className="sr-only" htmlFor={`${titulo}-nombre`}>
                    Nombre del negocio
                  </label>
                  <input
                    id={`${titulo}-nombre`}
                    autoFocus
                    value={texto}
                    maxLength={60}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Escribí el nombre…"
                    className="min-h-11 min-w-0 flex-1 rounded-full border-2 border-tinta bg-fondo px-4 text-cuerpo"
                  />
                  <button type="submit" disabled={!texto.trim()} className="rounded-full bg-tinta px-4 font-semibold text-fondo disabled:opacity-40">
                    Enviar
                  </button>
                </div>
                <button type="button" className={`${chip} self-start`} onClick={() => responderNombre("")}>
                  Todavía no tiene nombre
                </button>
              </form>
            )}
            {paso === "rubro" && (
              <Opciones>
                {RUBROS.map((x) => (
                  <button key={x.id} type="button" className={chip} onClick={() => elegirRubro(x)}>
                    {x.nombre}
                  </button>
                ))}
              </Opciones>
            )}
            {MULTIPLES.includes(paso) && (
              <>
                <Opciones etiqueta={paso === "dificultades" ? "Lo que más te complica" : "Lo que te gustaría que tenga"}>
                  {Object.entries(paso === "dificultades" ? DIFICULTADES : FUNCIONES).map(([id, t]) => (
                    <button key={id} type="button" aria-pressed={marcadas.includes(id)} className={chip} onClick={() => alternar(id)}>
                      {marcadas.includes(id) && <span aria-hidden>✓</span>}
                      {t}
                    </button>
                  ))}
                </Opciones>
                <button
                  type="button"
                  onClick={paso === "dificultades" ? listoDificultades : listoFunciones}
                  className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-tinta font-semibold text-fondo"
                >
                  {marcadas.length ? `Listo (${marcadas.length})` : paso === "dificultades" ? "Nada de esto" : "No sé, decime vos"}
                </button>
              </>
            )}
            {paso === "prioridad" && (
              <Opciones>
                {(Object.keys(PRIORIDADES) as Prioridad[]).map((p) => (
                  <button key={p} type="button" className={chip} onClick={() => elegirPrioridad(p)}>
                    {PRIORIDADES[p]}
                  </button>
                ))}
              </Opciones>
            )}
            {paso === "zona" && (
              <Opciones>
                {(Object.keys(ZONAS) as Zona[]).map((z) => (
                  <button key={z} type="button" className={chip} onClick={() => elegirZona(z)}>
                    {ZONAS[z]}
                  </button>
                ))}
              </Opciones>
            )}
            {paso === "color" && rubro && (
              <Opciones>
                {coloresPara(rubro).map((c) => (
                  <button key={c.hex} type="button" className={chip} onClick={() => elegirColor(c)}>
                    <span aria-hidden className="size-5 rounded-full border-2 border-tinta" style={{ background: c.hex }} />
                    {c.nombre}
                  </button>
                ))}
                <button type="button" className={chip} onClick={() => elegirColor(null)}>
                  Que lo elijan ustedes después
                </button>
              </Opciones>
            )}
            {paso === "resultado" && recomendacion && (
              <div className="flex flex-col gap-2">
                {pedido && pedido !== "enviando" ? (
                  <p role="status" className="rounded-[0.8rem] bg-acento-relleno px-3 py-2 text-chico font-semibold text-sobre-acento">
                    {pedido.numero ? `¡Listo! Tu consulta es la ${pedido.numero}.` : "¡Listo! Recibimos tu consulta."}{" "}
                    {pedido.porWhatsapp ? "Se abrió WhatsApp: mandá el mensaje y te escribimos." : pedido.link ? "" : "Te escribimos a la brevedad."}
                    {pedido.link && !pedido.porWhatsapp && (
                      <a href={pedido.link} target="_blank" rel="noopener noreferrer" className="ml-1 underline">
                        Abrir WhatsApp
                      </a>
                    )}
                  </p>
                ) : (
                  <button
                    type="button"
                    disabled={pedido === "enviando"}
                    onClick={() => hablar(recomendacion)}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-tinta font-semibold text-fondo disabled:opacity-50"
                  >
                    {pedido === "enviando" ? "Enviando…" : "Hablarlo por WhatsApp"}
                  </button>
                )}
                <button type="button" onClick={empezar} className="text-chico font-semibold underline underline-offset-4">
                  Empezar de nuevo
                </button>
              </div>
            )}
          </div>
        </div>
    </>
  );
}

export function Avatar() {
  return (
    <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-acento-relleno font-display text-[1.35rem] font-extrabold text-sobre-acento uppercase [font-stretch:68%]">
      A
    </span>
  );
}

function Opciones({ children, etiqueta }: { children: ReactNode; etiqueta?: string }) {
  return (
    <div role="group" aria-label={etiqueta ?? "Respuestas"} className="flex max-h-[38dvh] flex-wrap gap-2 overflow-y-auto sm:max-h-56">
      {children}
    </div>
  );
}

function Resultado({ rec, onConfigurador }: { rec: Recomendacion; onConfigurador: () => void }) {
  return (
    <div className="rounded-[1.1rem] border-2 border-tinta bg-superficie p-3.5">
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
