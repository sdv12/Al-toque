"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";

/* ───────────── Formatos ───────────── */

const fmtPesos = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
export const plata = (n: number) => fmtPesos.format(n);
export const hora = (ms: number) => new Date(ms).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
export const fecha = (ms: number) => new Date(ms).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
export const fechaHora = (ms: number) => `${fecha(ms)} ${hora(ms)}`;
export const diaCorto = (ms: number) => new Date(ms).toLocaleDateString("es-AR", { weekday: "short", day: "numeric" });

/* ───────────── Estilos ───────────── */

export const boton = {
  primario:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40",
  secundario:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40",
  peligro:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-40",
  fantasma: "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-teal-800 hover:bg-teal-50",
};

export const control =
  "block w-full min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-500 aria-invalid:border-red-600";

export const tarjeta = "rounded-xl border border-slate-200 bg-white";

/* ───────────── Íconos (trazo, 20×20) ───────────── */

const TRAZOS = {
  tablero: "M3 3h6v8H3zM11 3h6v5h-6zM11 10h6v7h-6zM3 13h6v4H3z",
  caja: "M3 8h14v9H3zM6 4h8v4H6zM7 11h2M11 11h2M7 14h6",
  stock: "M10 2 3 6v8l7 4 7-4V6zM3 6l7 4 7-4M10 10v8",
  clientes: "M7 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 17c0-3 2.5-5 5-5s5 2 5 5M13 4.5a3 3 0 0 1 0 5.5M15 12c2 .5 3.5 2.3 3.5 5",
  comprobantes: "M5 2h10v16l-2.5-1.5L10 18l-2.5-1.5L5 18zM8 6h4M8 9h4M8 12h2",
  equipo: "M10 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3.5 18c.5-3.5 3-5.5 6.5-5.5s6 2 6.5 5.5",
  auditoria: "M10 2 3 5v5c0 4 3 7 7 8 4-1 7-4 7-8V5zM7 10l2 2 4-4",
  mas: "M10 4v12M4 10h12",
  menos: "M4 10h12",
  cerrar: "M5 5l10 10M15 5 5 15",
  buscar: "M9 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM13.5 13.5 17 17",
  escaner: "M3 6V3h3M14 3h3v3M17 14v3h-3M6 17H3v-3M6 7v6M9 7v6M12 7v6M14 7v6",
  qr: "M3 3h5v5H3zM12 3h5v5h-5zM3 12h5v5H3zM12 12h2v2h-2zM15 15h2v2h-2zM12 16h1M16 12h1",
  imprimir: "M5 7V2h10v5M5 14H3V8h14v6h-2M5 11h10v7H5z",
  alerta: "M10 3 2 17h16zM10 8v4M10 14.5v.5",
  salir: "M8 3H3v14h5M13 6l4 4-4 4M17 10H7",
  flecha: "M7 4l6 6-6 6",
  menu: "M3 5h14M3 10h14M3 15h14",
  editar: "M13 3l4 4-9 9H4v-4zM11 5l4 4",
  whatsapp: "M4 16l1-3.5A6.5 6.5 0 1 1 7.5 15zM8 7.5c0 2.5 2 4.5 4.5 4.5",
} as const;

export type NombreIcono = keyof typeof TRAZOS;

export function Icono({ nombre, className = "size-5" }: { nombre: NombreIcono; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={`shrink-0 ${className}`}>
      <path d={TRAZOS[nombre]} />
    </svg>
  );
}

/* ───────────── Modal ───────────── */

/** Ventana con <dialog> nativo: atrapa el foco, cierra con Esc y devuelve el foco al cerrar. */
export function Modal({
  titulo,
  onCerrar,
  children,
  ancho = "max-w-lg",
  pie,
}: {
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
  ancho?: string;
  pie?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      onCancel={(e) => {
        e.preventDefault();
        onCerrar();
      }}
      className={`m-auto max-h-[92dvh] w-[calc(100%-1.5rem)] ${ancho} overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/50`}
    >
      <div className="flex max-h-[92dvh] flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-3.5">
          <h2 id={id} className="text-base font-semibold">
            {titulo}
          </h2>
          <button type="button" onClick={onCerrar} className="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100" aria-label="Cerrar">
            <Icono nombre="cerrar" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {pie && <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-3">{pie}</div>}
      </div>
    </dialog>
  );
}

/* ───────────── Campos ───────────── */

export function Campo({ etiqueta, ayuda, error, children }: { etiqueta: string; ayuda?: ReactNode; error?: string; children: (id: string, describedBy?: string) => ReactNode }) {
  const id = useId();
  const desc = [ayuda ? `${id}-a` : "", error ? `${id}-e` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-800">
        {etiqueta}
      </label>
      {children(id, desc)}
      {ayuda && (
        <p id={`${id}-a`} className="mt-1 text-xs text-slate-600">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={`${id}-e`} className="mt-1 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

/** Número entero de pesos a partir de lo tipeado ("12.500" → 12500). NaN si está vacío. */
export function aNumero(texto: string): number {
  const limpio = texto.replace(/\./g, "").replace(",", ".").trim();
  return limpio === "" ? NaN : Math.round(Number(limpio));
}

/* ───────────── Indicadores ───────────── */

export function Kpi({ titulo, valor, detalle, tono = "neutro" }: { titulo: string; valor: string; detalle?: ReactNode; tono?: "neutro" | "alerta" }) {
  return (
    <div className={`${tarjeta} p-4`}>
      <p className="text-sm text-slate-600">{titulo}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${tono === "alerta" ? "text-red-700" : "text-slate-900"}`}>{valor}</p>
      {detalle && <p className="mt-0.5 text-xs text-slate-600">{detalle}</p>}
    </div>
  );
}

export function Etiqueta({ children, tono = "gris" }: { children: ReactNode; tono?: "gris" | "verde" | "rojo" | "ambar" | "azul" }) {
  const tonos = {
    gris: "bg-slate-100 text-slate-700",
    verde: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    rojo: "bg-red-50 text-red-800 ring-red-200",
    ambar: "bg-amber-50 text-amber-900 ring-amber-200",
    azul: "bg-sky-50 text-sky-900 ring-sky-200",
  };
  return <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-transparent ring-inset ${tonos[tono]}`}>{children}</span>;
}

export function Vacio({ children }: { children: ReactNode }) {
  return <p className="px-4 py-10 text-center text-sm text-slate-600">{children}</p>;
}

/** Encabezado de pantalla: título, bajada y acciones a la derecha. */
export function Cabecera({ titulo, bajada, children }: { titulo: string; bajada?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{titulo}</h1>
        {bajada && <p className="mt-0.5 text-sm text-slate-600">{bajada}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

/* ───────────── Avisos ───────────── */

type Aviso = { id: number; texto: string; tipo: "ok" | "error" };
const AvisosCtx = createContext<(texto: string, tipo?: Aviso["tipo"]) => void>(() => {});

export function useAviso() {
  return useContext(AvisosCtx);
}

export function Avisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const avisar = useCallback((texto: string, tipo: Aviso["tipo"] = "ok") => {
    const id = Date.now() + Math.random();
    setAvisos((a) => [...a.slice(-2), { id, texto, tipo }]);
    setTimeout(() => setAvisos((a) => a.filter((x) => x.id !== id)), tipo === "error" ? 6000 : 3500);
  }, []);
  return (
    <AvisosCtx.Provider value={avisar}>
      {children}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
        {avisos.map((a) => (
          <p
            key={a.id}
            className={`pointer-events-auto max-w-md rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg ${a.tipo === "error" ? "bg-red-700 text-white" : "bg-slate-900 text-white"}`}
          >
            {a.texto}
          </p>
        ))}
      </div>
    </AvisosCtx.Provider>
  );
}

/* ───────────── QR de demostración ───────────── */

/**
 * Dibujo con forma de QR (esquinas de posición + módulos que salen del texto). En la demo no
 * se puede escanear: en la versión real lo arma Mercado Pago / ARCA.
 */
export function QrDemo({ texto, className = "size-48" }: { texto: string; className?: string }) {
  const N = 25;
  let h = 2166136261;
  for (const ch of texto) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const azar = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 4294967296;
  };
  const esEsquina = (x: number, y: number) => (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
  const modulos: string[] = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!esEsquina(x, y) && azar() < 0.47) modulos.push(`M${x} ${y}h1v1h-1z`);
  const esquina = (x: number, y: number) => `M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`;
  return (
    <svg viewBox={`-2 -2 ${N + 4} ${N + 4}`} className={className} role="img" aria-label="Código QR de demostración">
      <rect x="-2" y="-2" width={N + 4} height={N + 4} fill="#fff" />
      <path d={`${esquina(0, 0)}${esquina(N - 7, 0)}${esquina(0, N - 7)}${modulos.join("")}`} fill="#0f172a" fillRule="evenodd" />
    </svg>
  );
}
