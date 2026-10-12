"use client";

import { useId, useState } from "react";
import { NOMBRE_RED, REDES, urlDeRed, type RedSocial } from "@/core/lib/redes";
import type { RedNegocio } from "@/core/schema/comun";
import type { LandingConfig } from "@/core/schema/landing-config";
import { IconoRed } from "@/ui/primitives/RedesSociales";
import { Bloque, botonKit, claseControl } from "../campos";

type Props = {
  redes: readonly RedNegocio[] | undefined;
  editar: (f: (c: LandingConfig) => void) => void;
};

/** Lo que se ve en cada campo. Puede estar a medio escribir: a la config solo pasan las que son un perfil válido. */
type Fila = { red: RedSocial; texto: string; tocada: boolean };

const AYUDA: Record<RedSocial, string> = {
  instagram: "@tunegocio o instagram.com/tunegocio",
  facebook: "facebook.com/tunegocio",
  tiktok: "@tunegocio o tiktok.com/@tunegocio",
  youtube: "@tucanal o youtube.com/@tucanal",
  x: "@tunegocio o x.com/tunegocio",
  linkedin: "linkedin.com/company/tunegocio",
};

const filasDe = (redes: readonly RedNegocio[]): Fila[] => redes.map((r) => ({ red: r.red, texto: r.url, tocada: false }));

function validas(filas: readonly Fila[]): RedNegocio[] {
  return filas.flatMap((f) => {
    const url = urlDeRed(f.red, f.texto);
    return url ? [{ red: f.red, url }] : [];
  });
}

const iguales = (a: readonly RedNegocio[], b: readonly RedNegocio[]) => JSON.stringify(a) === JSON.stringify(b);

/** Siempre la misma lista vacía: un `[]` nuevo en cada render haría creer que la config cambió y no pararía de re-renderizar. */
const SIN_REDES: readonly RedNegocio[] = [];

export function EditorRedes({ redes = SIN_REDES, editar }: Props) {
  const id = useId();
  const [filas, setFilas] = useState(() => filasDe(redes));

  // Si la config cambió desde afuera (otra plantilla, un código importado), se vuelve a leer.
  const [previas, setPrevias] = useState(redes);
  if (redes !== previas) {
    setPrevias(redes);
    if (!iguales(validas(filas), redes)) setFilas(filasDe(redes));
  }

  const cambiar = (siguientes: Fila[]) => {
    setFilas(siguientes);
    const lista = validas(siguientes);
    if (iguales(lista, redes)) return;
    editar((c) => {
      if (lista.length) c.negocio.redes = lista;
      else delete c.negocio.redes;
    });
  };

  const faltan = REDES.filter((red) => !filas.some((f) => f.red === red));

  return (
    <Bloque titulo="Redes sociales" descripcion="Aparecen como íconos en la página. Pegá el link de tu perfil o escribí tu usuario.">
      {filas.length > 0 && (
        <ul className="space-y-3">
          {filas.map((f, i) => {
            const campo = `${id}-${f.red}`;
            const error = f.tocada && f.texto.trim() && !urlDeRed(f.red, f.texto) ? `No reconocemos ese usuario o link de ${NOMBRE_RED[f.red]}.` : undefined;
            return (
              <li key={f.red} className="flex items-start gap-2">
                <span aria-hidden className="mt-6 grid size-9 shrink-0 place-items-center rounded-full border border-borde bg-superficie">
                  <IconoRed red={f.red} className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <label htmlFor={campo} className="block text-chico font-medium">
                    {NOMBRE_RED[f.red]}
                  </label>
                  <input
                    id={campo}
                    value={f.texto}
                    placeholder={AYUDA[f.red]}
                    maxLength={200}
                    autoComplete="off"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${campo}-error` : undefined}
                    onChange={(e) => cambiar(filas.map((x, j) => (j === i ? { ...x, texto: e.target.value } : x)))}
                    // Al salir del campo se muestra el link como va a quedar (o el error, si no se entendió).
                    onBlur={() =>
                      setFilas(filas.map((x, j) => (j === i ? { ...x, tocada: true, texto: urlDeRed(x.red, x.texto) ?? x.texto } : x)))
                    }
                    className={`${claseControl} mt-1`}
                  />
                  {error && (
                    <p id={`${campo}-error`} className="mt-1 text-mini text-[#b3261e]">
                      {error}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className={`${botonKit.icono} mt-6 shrink-0`}
                  aria-label={`Quitar ${NOMBRE_RED[f.red]}`}
                  onClick={() => cambiar(filas.filter((_, j) => j !== i))}
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {faltan.length > 0 && (
        <div>
          <p className="text-chico font-medium">{filas.length ? "Sumar otra red" : "Sumá tus redes"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {faltan.map((red) => (
              <button key={red} type="button" className={botonKit.secundario} onClick={() => setFilas([...filas, { red, texto: "", tocada: false }])}>
                <IconoRed red={red} className="size-4" />
                {NOMBRE_RED[red]}
              </button>
            ))}
          </div>
        </div>
      )}
    </Bloque>
  );
}
