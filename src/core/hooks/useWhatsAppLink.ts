"use client";

import { useMemo } from "react";
import { linkWhatsApp } from "../lib/mensajes";

/** Link wa.me con texto prearmado; se recalcula solo si cambian número o texto. */
export function useWhatsAppLink(numero: string, texto?: string): string {
  return useMemo(() => linkWhatsApp(numero, texto), [numero, texto]);
}
