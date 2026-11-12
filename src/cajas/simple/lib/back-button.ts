"use client";

import { useEffect, useRef } from "react";

// Que el botón "Atrás" del celular cierre la ventana abierta en vez de salir de la app.
// Mientras haya alguna ventana abierta hay UNA entrada extra en el historial; "Atrás"
// la consume y cierra solo la ventana de arriba (si quedan otras, se vuelve a agregar).
// Al cerrar con un botón, la entrada se saca un instante después: así, si se abre otra
// ventana enseguida (ej. de "Editar" a "¿Seguro?"), se reutiliza y no hay carreras.

interface Entry {
  close: () => void;
  closedByBack: boolean;
}

const stack: Entry[] = [];
let hasEntry = false;
let ignorePops = 0;
let pendingBack: ReturnType<typeof setTimeout> | null = null;
let listening = false;

function pushEntry() {
  history.pushState({ overlay: true }, "");
  hasEntry = true;
}

function onPop() {
  if (ignorePops > 0) {
    ignorePops--;
    return;
  }
  if (!hasEntry) return;
  hasEntry = false;
  const top = stack.pop();
  if (top) {
    top.closedByBack = true;
    top.close();
  }
  if (stack.length > 0) pushEntry();
}

export function useCloseOnBack(close: () => void) {
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });

  useEffect(() => {
    if (!listening) {
      window.addEventListener("popstate", onPop);
      listening = true;
    }
    const entry: Entry = { close: () => closeRef.current(), closedByBack: false };
    stack.push(entry);
    if (pendingBack) {
      clearTimeout(pendingBack);
      pendingBack = null;
    } else if (!hasEntry) {
      pushEntry();
    }
    return () => {
      const i = stack.indexOf(entry);
      if (i >= 0) stack.splice(i, 1);
      if (entry.closedByBack || stack.length > 0 || !hasEntry) return;
      pendingBack = setTimeout(() => {
        pendingBack = null;
        if (stack.length > 0 || !hasEntry) return;
        hasEntry = false;
        ignorePops++;
        history.back();
      }, 0);
    };
  }, []);
}
