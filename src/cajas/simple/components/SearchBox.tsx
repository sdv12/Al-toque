"use client";

export { matches, normalize } from "@/cajas/simple/lib/text";

export default function SearchBox({
  value,
  onChange,
  placeholder = "Buscar producto",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex gap-2">
      <label className="flex min-h-16 min-w-0 flex-1 items-center gap-2 rounded-2xl border-2 border-borde bg-white px-3">
        <span aria-hidden="true" className="text-2xl">🔍</span>
        <span className="sr-only">{placeholder}</span>
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          enterKeyHint="search"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-xl outline-none placeholder:text-gris [&::-webkit-search-cancel-button]:hidden"
        />
      </label>
      {value && (
        <button type="button" onClick={() => onChange("")} className="min-h-16 shrink-0 rounded-2xl border-2 border-borde px-4 text-lg font-bold">
          ✕ Borrar
        </button>
      )}
    </div>
  );
}
