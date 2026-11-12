"use client";

import { useId, useState } from "react";
import { hacer } from "../lib/estado";
import { ajustarStock, guardarProducto, normalizar, puede, stockDe, usuarioActual } from "../lib/logica";
import type { EstadoPro, Producto } from "../lib/tipos";
import { Cabecera, Campo, Etiqueta, Icono, Modal, Vacio, aNumero, boton, control, plata, tarjeta, useAviso } from "./comunes";

type Abierto = { tipo: "editar"; p: Producto | null } | { tipo: "ajustar"; p: Producto };

export default function Stock({ e }: { e: EstadoPro }) {
  const yo = usuarioActual(e)!;
  const sucursalId = e.actual!.sucursalId;
  const otra = e.sucursales.find((s) => s.id !== sucursalId);
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState("");
  const [soloBajo, setSoloBajo] = useState(false);
  const [abierto, setAbierto] = useState<Abierto | null>(null);
  const categorias = [...new Set(e.productos.map((p) => p.categoria))].sort();
  const q = normalizar(texto);
  const lista = e.productos
    .filter((p) => (!categoria || p.categoria === categoria) && (!q || normalizar(`${p.nombre} ${p.marca}`).includes(q) || p.codigo.startsWith(texto.trim())))
    .filter((p) => !soloBajo || (p.activo && stockDe(e, sucursalId, p.id) <= p.minimo))
    .sort((a, b) => a.categoria.localeCompare(b.categoria) || a.nombre.localeCompare(b.nombre));
  const bajos = e.productos.filter((p) => p.activo && stockDe(e, sucursalId, p.id) <= p.minimo).length;
  const valorizado = e.productos.reduce((t, p) => t + stockDe(e, sucursalId, p.id) * p.costo, 0);
  const edita = puede(yo, "stock");

  return (
    <>
      <Cabecera titulo="Stock" bajada={`${e.productos.filter((p) => p.activo).length} productos · mercadería en ${e.sucursales.find((s) => s.id === sucursalId)?.nombre} a costo: ${plata(valorizado)}`}>
        {edita && (
          <button type="button" className={boton.primario} onClick={() => setAbierto({ tipo: "editar", p: null })}>
            <Icono nombre="mas" className="size-4" /> Nuevo producto
          </button>
        )}
      </Cabecera>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="relative min-w-60 flex-1">
          <span className="sr-only">Buscar producto</span>
          <Icono nombre="buscar" className="absolute top-2.5 left-3 size-5 text-slate-500" />
          <input className={`${control} pl-10`} placeholder="Nombre, marca o código" value={texto} onChange={(ev) => setTexto(ev.target.value)} />
        </label>
        <label className="w-48">
          <span className="sr-only">Categoría</span>
          <select className={control} value={categoria} onChange={(ev) => setCategoria(ev.target.value)}>
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm">
          <input type="checkbox" checked={soloBajo} onChange={(ev) => setSoloBajo(ev.target.checked)} className="size-4 accent-teal-700" />
          Solo stock bajo <Etiqueta tono={bajos ? "rojo" : "gris"}>{bajos}</Etiqueta>
        </label>
      </div>

      <div className={`${tarjeta} overflow-x-auto`}>
        {lista.length === 0 ? (
          <Vacio>No hay productos con ese filtro.</Vacio>
        ) : (
          <table className="w-full min-w-[52rem] text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-600">
              <tr>
                <th className="px-4 py-2.5 font-medium">Producto</th>
                <th className="px-4 py-2.5 font-medium">Categoría</th>
                <th className="px-4 py-2.5 text-right font-medium">Precio</th>
                <th className="px-4 py-2.5 text-right font-medium">Margen</th>
                <th className="px-4 py-2.5 text-right font-medium">Acá</th>
                {otra && <th className="px-4 py-2.5 text-right font-medium">{otra.nombre}</th>}
                {edita && <th className="px-4 py-2.5 font-medium"><span className="sr-only">Acciones</span></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lista.map((p) => {
                const aca = stockDe(e, sucursalId, p.id);
                const bajo = aca <= p.minimo;
                return (
                  <tr key={p.id} className={p.activo ? "" : "text-slate-500"}>
                    <td className="px-4 py-2">
                      <span className="block font-medium">
                        {p.nombre} {!p.activo && <Etiqueta>Pausado</Etiqueta>}
                      </span>
                      <span className="text-xs text-slate-600">
                        {p.marca} · <span className="font-mono">{p.codigo}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2">{p.categoria}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{plata(p.precio)}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-slate-700">{Math.round(((p.precio - p.costo) / p.precio) * 100)} %</td>
                    <td className="px-4 py-2 text-right">
                      {bajo && p.activo ? (
                        <Etiqueta tono="rojo">
                          <Icono nombre="alerta" className="size-3.5" />
                          {aca} <span className="sr-only">(stock bajo, mínimo {p.minimo})</span>
                        </Etiqueta>
                      ) : (
                        <span className="tabular-nums">{aca}</span>
                      )}
                    </td>
                    {otra && <td className="px-4 py-2 text-right tabular-nums text-slate-700">{stockDe(e, otra.id, p.id)}</td>}
                    {edita && (
                      <td className="px-2 py-2 text-right whitespace-nowrap">
                        <button type="button" className={boton.fantasma} onClick={() => setAbierto({ tipo: "ajustar", p })}>
                          Ajustar<span className="sr-only"> stock de {p.nombre}</span>
                        </button>
                        <button type="button" className={boton.fantasma} onClick={() => setAbierto({ tipo: "editar", p })}>
                          Editar<span className="sr-only"> {p.nombre}</span>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {abierto?.tipo === "editar" && <EditarProducto p={abierto.p} categorias={categorias} onCerrar={() => setAbierto(null)} />}
      {abierto?.tipo === "ajustar" && <AjustarStock e={e} p={abierto.p} onCerrar={() => setAbierto(null)} />}
    </>
  );
}

function EditarProducto({ p, categorias, onCerrar }: { p: Producto | null; categorias: string[]; onCerrar: () => void }) {
  const aviso = useAviso();
  const lista = useId();
  const [f, setF] = useState({
    nombre: p?.nombre ?? "",
    codigo: p?.codigo ?? "",
    categoria: p?.categoria ?? "",
    marca: p?.marca ?? "",
    precio: p ? String(p.precio) : "",
    costo: p ? String(p.costo) : "",
    minimo: p ? String(p.minimo) : "5",
    activo: p?.activo ?? true,
  });
  const [error, setError] = useState<string>();
  const set = (k: keyof typeof f) => (ev: { target: { value: string } }) => setF({ ...f, [k]: ev.target.value });
  const enviar = () => {
    const producto: Producto = {
      id: p?.id ?? "",
      nombre: f.nombre,
      codigo: f.codigo.trim(),
      categoria: f.categoria.trim() || "Varios",
      marca: f.marca.trim(),
      precio: aNumero(f.precio),
      costo: aNumero(f.costo) || 0,
      minimo: aNumero(f.minimo) || 0,
      activo: f.activo,
    };
    const r = hacer((x, c) => guardarProducto(x, { ...producto, id: producto.id || c.nuevoId() }, c));
    if (!r.ok) return setError(r.error);
    aviso(p ? "Producto actualizado" : "Producto agregado (stock 0: cargalo con «Ajustar»)");
    onCerrar();
  };
  const precio = aNumero(f.precio);
  const costo = aNumero(f.costo);
  return (
    <Modal
      titulo={p ? `Editar ${p.nombre}` : "Nuevo producto"}
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className={boton.secundario} onClick={onCerrar}>
            Cancelar
          </button>
          <button type="button" className={boton.primario} onClick={enviar}>
            Guardar
          </button>
        </>
      }
    >
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(ev) => {
          ev.preventDefault();
          enviar();
        }}
      >
        <div className="sm:col-span-2">
          <Campo etiqueta="Nombre">{(id) => <input id={id} autoFocus className={control} value={f.nombre} onChange={set("nombre")} />}</Campo>
        </div>
        <Campo etiqueta="Código de barras" ayuda="Pasá el lector sobre el producto y se completa solo.">
          {(id, d) => <input id={id} aria-describedby={d} inputMode="numeric" className={`${control} font-mono`} value={f.codigo} onChange={set("codigo")} />}
        </Campo>
        <Campo etiqueta="Marca">{(id) => <input id={id} className={control} value={f.marca} onChange={set("marca")} />}</Campo>
        <Campo etiqueta="Categoría">
          {(id) => (
            <>
              <input id={id} list={lista} className={control} value={f.categoria} onChange={set("categoria")} />
              <datalist id={lista}>
                {categorias.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </>
          )}
        </Campo>
        <Campo etiqueta="Stock mínimo" ayuda="Debajo de esto avisa.">
          {(id, d) => <input id={id} aria-describedby={d} inputMode="numeric" className={control} value={f.minimo} onChange={set("minimo")} />}
        </Campo>
        <Campo etiqueta="Costo">{(id) => <input id={id} inputMode="numeric" className={control} value={f.costo} onChange={set("costo")} />}</Campo>
        <Campo etiqueta="Precio de venta" ayuda={precio > 0 && costo >= 0 ? `Margen ${Math.round(((precio - costo) / precio) * 100)} %` : undefined}>
          {(id, d) => <input id={id} aria-describedby={d} inputMode="numeric" className={control} value={f.precio} onChange={set("precio")} />}
        </Campo>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" checked={f.activo} onChange={(ev) => setF({ ...f, activo: ev.target.checked })} className="size-4 accent-teal-700" />
          A la venta (si lo pausás no aparece al vender)
        </label>
        {error && <p className="text-sm font-medium text-red-700 sm:col-span-2">{error}</p>}
        {p && aNumero(f.precio) !== p.precio && <p className="text-xs text-slate-600 sm:col-span-2">El cambio de precio queda registrado en la auditoría.</p>}
      </form>
    </Modal>
  );
}

function AjustarStock({ e, p, onCerrar }: { e: EstadoPro; p: Producto; onCerrar: () => void }) {
  const aviso = useAviso();
  const antes = stockDe(e, e.actual!.sucursalId, p.id);
  const [cantidad, setCantidad] = useState(String(antes));
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string>();
  const enviar = () => {
    const r = hacer((x, c) => ajustarStock(x, p.id, aNumero(cantidad), motivo, c));
    if (!r.ok) return setError(r.error);
    aviso("Stock ajustado");
    onCerrar();
  };
  return (
    <Modal
      titulo={`Ajustar stock · ${p.nombre}`}
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className={boton.secundario} onClick={onCerrar}>
            Cancelar
          </button>
          <button type="button" className={boton.primario} onClick={enviar}>
            Guardar
          </button>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(ev) => {
          ev.preventDefault();
          enviar();
        }}
      >
        <p className="text-sm text-slate-700">
          Hoy figuran <strong>{antes}</strong> en esta sucursal. Poné lo que hay de verdad (después de contar, o sumando lo que llegó).
        </p>
        <Campo etiqueta="Cantidad real">{(id) => <input id={id} inputMode="numeric" autoFocus className={control} value={cantidad} onChange={(ev) => setCantidad(ev.target.value)} />}</Campo>
        <Campo etiqueta="Motivo" error={error} ayuda="Ej.: llegó pedido, conteo, rotura. Si baja, queda marcado en la auditoría.">
          {(id, d) => <input id={id} aria-describedby={d} aria-invalid={!!error} className={control} value={motivo} onChange={(ev) => setMotivo(ev.target.value)} />}
        </Campo>
      </form>
    </Modal>
  );
}
