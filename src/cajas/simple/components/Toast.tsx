"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

// Mensaje grande y verde ("¡Listo! ...") con botón "Deshacer" para la última acción.

interface ToastData {
  id: number;
  text: string;
  undo?: () => void;
}

const ToastContext = createContext<(text: string, undo?: () => void) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

const DURATION_MS = 6000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback((text: string, undo?: () => void) => {
    setToast({ id: Date.now(), text, undo });
  }, []);

  useEffect(() => {
    if (!toast) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), toast.undo ? DURATION_MS : DURATION_MS / 2);
    return () => clearTimeout(timer.current);
  }, [toast]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex justify-center px-3">
        {toast && (
          <div
            key={toast.id}
            className="pointer-events-auto flex w-full max-w-xl items-center gap-3 rounded-2xl bg-acento px-4 py-2 text-white shadow-2xl"
          >
            <p className="min-w-0 flex-1 text-xl font-bold leading-snug">✅ {toast.text}</p>
            {toast.undo && (
              <button
                type="button"
                onClick={() => {
                  setToast(null);
                  toast.undo?.();
                }}
                className="min-h-14 shrink-0 rounded-xl bg-white px-4 text-lg font-bold text-acento-oscuro"
              >
                ↩ Deshacer
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
