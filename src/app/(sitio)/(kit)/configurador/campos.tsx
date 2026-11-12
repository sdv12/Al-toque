"use client";

import { useId, useState, type ReactNode } from "react";

/** Controles de formulario del configurador (estética de herramienta, tokens del kit). */

export const claseControl =
  "block w-full rounded-control border border-borde bg-superficie px-3 py-2 text-cuerpo text-tinta placeholder:text-tinta-suave/70 aria-invalid:border-[#b3261e]";

export const botonKit = {
  primario:
    "inline-flex items-center justify-center gap-2 rounded-control bg-acento-relleno px-4 py-2 text-chico font-medium text-sobre-acento hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40",
  secundario:
    "inline-flex items-center justify-center gap-2 rounded-control border border-borde bg-superficie px-4 py-2 text-chico font-medium text-tinta hover:border-tinta-suave disabled:cursor-not-allowed disabled:opacity-40",
  icono:
    "grid size-9 place-items-center rounded-control border border-borde bg-superficie text-tinta hover:border-tinta-suave disabled:cursor-not-allowed disabled:opacity-30",
};

type BaseCampo = { etiqueta: string; ayuda?: ReactNode; error?: string };

function Envoltorio({ id, etiqueta, ayuda, error, children }: BaseCampo & { id: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-chico font-medium">
        {etiqueta}
      </label>
      <div className="mt-1">{children}</div>
      {ayuda && (
        <p id={`${id}-ayuda`} className="mt-1 text-mini text-tinta-suave">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-mini text-[#b3261e]">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, ayuda?: ReactNode, error?: string) {
  return [ayuda ? `${id}-ayuda` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
}

export function CampoTexto({
  valor,
  onCambio,
  onSalir,
  tipo = "text",
  placeholder,
  maxLength,
  autoComplete,
  ...base
}: BaseCampo & {
  valor: string;
  onCambio: (v: string) => void;
  onSalir?: () => void;
  tipo?: "text" | "url" | "tel";
  placeholder?: string;
  maxLength?: number;
  autoComplete?: string;
}) {
  const id = useId();
  return (
    <Envoltorio id={id} {...base}>
      <input
        id={id}
        type={tipo}
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        onBlur={onSalir}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete={autoComplete ?? "off"}
        aria-invalid={base.error ? true : undefined}
        aria-describedby={describedBy(id, base.ayuda, base.error)}
        className={claseControl}
      />
    </Envoltorio>
  );
}

export function CampoArea({
  valor,
  onCambio,
  filas = 3,
  maxLength,
  ...base
}: BaseCampo & { valor: string; onCambio: (v: string) => void; filas?: number; maxLength?: number }) {
  const id = useId();
  return (
    <Envoltorio id={id} {...base}>
      <textarea
        id={id}
        value={valor}
        rows={filas}
        maxLength={maxLength}
        onChange={(e) => onCambio(e.target.value)}
        aria-invalid={base.error ? true : undefined}
        aria-describedby={describedBy(id, base.ayuda, base.error)}
        className={claseControl}
      />
    </Envoltorio>
  );
}

const aLineas = (texto: string) =>
  texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

/**
 * Lista de textos, una por línea. Guarda el texto tal cual se escribe (para poder apretar Enter
 * y seguir) y publica la lista limpia. Si la lista cambia desde afuera, se resincroniza.
 */
export function CampoLineas({
  valor,
  onCambio,
  filas = 4,
  ...base
}: BaseCampo & { valor: readonly string[]; onCambio: (v: string[]) => void; filas?: number }) {
  const externo = valor.join("\n");
  const [texto, setTexto] = useState(externo);
  const [previo, setPrevio] = useState(externo);
  if (externo !== previo) {
    setPrevio(externo);
    if (aLineas(texto).join("\n") !== externo) setTexto(externo);
  }
  return (
    <CampoArea
      {...base}
      filas={filas}
      valor={texto}
      onCambio={(v) => {
        setTexto(v);
        onCambio(aLineas(v));
      }}
    />
  );
}

/** Número entero; vacío = null (útil para "precio a consultar"). */
export function CampoNumero({
  valor,
  onCambio,
  min = 0,
  max,
  paso = 1,
  prefijo,
  decimales = false,
  ...base
}: BaseCampo & {
  valor: number | null;
  onCambio: (v: number | null) => void;
  min?: number;
  max?: number;
  paso?: number;
  prefijo?: string;
  decimales?: boolean;
}) {
  const id = useId();
  return (
    <Envoltorio id={id} {...base}>
      <div className="flex items-center gap-2">
        {prefijo && <span className="text-tinta-suave">{prefijo}</span>}
        <input
          id={id}
          type="number"
          inputMode={decimales ? "decimal" : "numeric"}
          value={valor ?? ""}
          min={min}
          max={max}
          step={paso}
          onChange={(e) => {
            if (e.target.value === "") return onCambio(null);
            const n = Math.max(min, Number(e.target.value));
            onCambio(decimales ? n : Math.round(n));
          }}
          aria-invalid={base.error ? true : undefined}
          aria-describedby={describedBy(id, base.ayuda, base.error)}
          className={`${claseControl} tabular-nums`}
        />
      </div>
    </Envoltorio>
  );
}

export function Interruptor({ etiqueta, marcado, onCambio, ayuda }: { etiqueta: string; marcado: boolean; onCambio: (v: boolean) => void; ayuda?: string }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={marcado}
        onChange={(e) => onCambio(e.target.checked)}
        aria-describedby={ayuda ? `${id}-ayuda` : undefined}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className="relative mt-0.5 h-5 w-9 shrink-0 cursor-pointer rounded-full border border-borde bg-superficie-2 transition-colors peer-checked:border-acento peer-checked:bg-acento-relleno peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foco after:absolute after:left-0.5 after:top-0.5 after:size-3.5 after:rounded-full after:bg-tinta-suave after:transition-transform peer-checked:after:translate-x-4 peer-checked:after:bg-sobre-acento"
      >
        <span className="sr-only">{etiqueta}</span>
      </label>
      <div>
        <label htmlFor={id} aria-hidden className="cursor-pointer text-chico font-medium">
          {etiqueta}
        </label>
        {ayuda && (
          <p id={`${id}-ayuda`} className="text-mini text-tinta-suave">
            {ayuda}
          </p>
        )}
      </div>
    </div>
  );
}

export function Selector<T extends string>({
  etiqueta,
  valor,
  opciones,
  onCambio,
  oculto,
}: {
  etiqueta: string;
  valor: T;
  opciones: readonly { valor: T; texto: string }[];
  onCambio: (v: T) => void;
  /** Etiqueta solo para lectores de pantalla. */
  oculto?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={oculto ? "sr-only" : "block text-chico font-medium"}>
        {etiqueta}
      </label>
      <select id={id} value={valor} onChange={(e) => onCambio(e.target.value as T)} className={`${claseControl} ${oculto ? "" : "mt-1"} py-1.5`}>
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Bloque({ titulo, descripcion, children }: { titulo: string; descripcion?: ReactNode; children: ReactNode }) {
  return (
    <section className="border-b border-borde px-5 py-6 last:border-b-0">
      <h2 className="text-subtitulo font-semibold">{titulo}</h2>
      {descripcion && <p className="mt-1 text-chico text-tinta-suave">{descripcion}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
