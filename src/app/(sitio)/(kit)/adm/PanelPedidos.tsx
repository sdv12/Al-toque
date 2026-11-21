"use client";

import { useEffect, useState } from "react";
import { juntar, type Conteo, type Semana } from "@/core/lib/estadisticas";
import { afiche } from "../_home/estilos";

/*
 * Pedidos en números: cuántos llegaron por semana, por dónde entró la gente, desde qué página
 * pidió y qué nivel o producto. Sin nombres ni teléfonos (/adm no tiene clave): los pedidos con
 * sus datos siguen llegando por mail.
 */

const NOMBRES: Record<string, string> = {
  Landing: "Página (configurador)",
  Caja: "Caja",
  Agenda: "Turnos",
  Consulta: "Alto",
  Tienda: "Lista de Tienda",
  perfil: "Perfil digital",
  vidriera: "Listo para usar",
  medida: "Personalizado",
  sistema: "Web + Turnos",
  caja: "Caja simple",
  cajaPro: "Caja pro",
  agenda: "Agenda sola",
  tienda: "Tienda (lista)",
  "/": "Portada",
  otro: "Otro",
  otra: "Otra",
};
const nombre = (k: string) => NOMBRES[k] ?? k;
const COLUMNAS = ["Landing", "Consulta", "Agenda", "Caja", "Tienda"] as const;
const FECHA = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", timeZone: "UTC" });
const semana = (iso: string) => `Semana del ${FECHA.format(new Date(`${iso}T12:00:00Z`))}`;

export function PanelPedidos() {
  const [semanas, setSemanas] = useState<Semana[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let vigente = true;
    fetch("/api/estadisticas", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { semanas: Semana[] }) => vigente && setSemanas(d.semanas))
      .catch(() => vigente && setError(true));
    return () => {
      vigente = false;
    };
  }, []);

  return (
    <>
      <div className="pt-10 pb-6">
        <h1 className={`${afiche} text-titulo`}>Pedidos</h1>
        <p className="mt-2 max-w-medida text-subtitulo">
          Cuántos llegan y de dónde, las últimas 12 semanas. Solo números: los datos de cada pedido te llegan por mail.
        </p>
      </div>
      {error ? (
        <p role="alert" className="rounded-base border-2 border-[#b3261e] bg-[#fde7e5] p-4 text-chico text-[#7a1c16]">
          No se pudieron leer los números. Probá recargar en un rato.
        </p>
      ) : !semanas ? (
        <p className="text-chico text-tinta-suave">Cargando…</p>
      ) : (
        <Tablero semanas={semanas} />
      )}
    </>
  );
}

function Tablero({ semanas }: { semanas: Semana[] }) {
  const total = juntar(semanas);
  const ultimas4 = juntar(semanas.slice(0, 4));
  const tarjetas: [string, number][] = [
    ["Esta semana", semanas[0]?.total ?? 0],
    ["Últimas 4 semanas", ultimas4.total],
    ["Por Alto (12 semanas)", total.tipo.Consulta ?? 0],
    ["Anotados para Tienda", total.tipo.Tienda ?? 0],
  ];
  return (
    <div className="space-y-10">
      <ul className="grid gap-3 @2xl:grid-cols-2 @5xl:grid-cols-4">
        {tarjetas.map(([t, n]) => (
          <li key={t} className="rounded-base border-2 border-tinta bg-superficie p-5">
            <p className="text-chico text-tinta-suave">{t}</p>
            <p className={`${afiche} mt-1 text-[2.6rem] leading-none tabular-nums`}>{n}</p>
          </li>
        ))}
      </ul>

      <section aria-labelledby="por-semana">
        <h2 id="por-semana" className="text-subtitulo font-semibold">
          Por semana
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-chico">
            <thead>
              <tr className="border-b-2 border-tinta text-left">
                <th scope="col" className="py-2 font-semibold">
                  Semana
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Total
                </th>
                {COLUMNAS.map((c) => (
                  <th key={c} scope="col" className="py-2 pl-3 text-right font-normal text-tinta-suave">
                    {nombre(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {semanas.map((s) => (
                <tr key={s.semana} className="border-b border-borde">
                  <th scope="row" className="py-2 text-left font-normal">
                    {semana(s.semana)}
                  </th>
                  <td className="py-2 text-right font-semibold tabular-nums">{s.total}</td>
                  {COLUMNAS.map((c) => (
                    <td key={c} className="py-2 pl-3 text-right tabular-nums text-tinta-suave">
                      {s.tipo[c] ?? 0}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-8 @4xl:grid-cols-3">
        <Ranking titulo="Por dónde entraron" conteo={total.entrada} />
        <Ranking titulo="Desde dónde pidieron" conteo={total.pagina} />
        <Ranking titulo="Qué pidieron" conteo={total.nivel} />
      </div>
    </div>
  );
}

function Ranking({ titulo, conteo }: { titulo: string; conteo: Conteo }) {
  const filas = Object.entries(conteo).sort((a, b) => b[1] - a[1]);
  const max = filas[0]?.[1] ?? 0;
  return (
    <section aria-label={titulo}>
      <h2 className="text-subtitulo font-semibold">{titulo}</h2>
      {filas.length === 0 ? (
        <p className="mt-3 text-chico text-tinta-suave">Todavía no hay pedidos.</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {filas.map(([k, n]) => (
            <li key={k} className="text-chico">
              <span className="flex justify-between gap-3">
                <span>{nombre(k)}</span>
                <span className="font-semibold tabular-nums">{n}</span>
              </span>
              <span aria-hidden className="mt-1 block h-2 rounded-full bg-superficie-2">
                <span className="block h-2 rounded-full bg-tinta" style={{ width: `${(n / max) * 100}%` }} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
