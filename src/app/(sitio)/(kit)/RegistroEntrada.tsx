"use client";

import { useEffect } from "react";
import { registrarEntrada } from "./pedido";

/** Anota por qué página entró la persona a la visita (para las estadísticas de /adm). */
export function RegistroEntrada() {
  useEffect(registrarEntrada, []);
  return null;
}
