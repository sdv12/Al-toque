"use client";

import { normalizarWhatsappAR } from "@/core/lib/whatsapp";
import type { LandingConfig } from "@/core/schema/landing-config";
import type { Negocio } from "@/core/schema/comun";
import { Bloque, CampoArea, CampoTexto, Interruptor } from "../campos";

type Props = {
  config: LandingConfig;
  editar: (f: (c: LandingConfig) => void) => void;
  errorDe: (ruta: string) => string | undefined;
};

export function PestanaTextos({ config, editar, errorDe }: Props) {
  const { negocio } = config;
  const set = <K extends keyof Negocio>(clave: K, valor: Negocio[K]) => editar((c) => void (c.negocio[clave] = valor));

  return (
    <>
      <Bloque titulo="Tu negocio">
        <CampoTexto etiqueta="Nombre" valor={negocio.nombre} onCambio={(v) => set("nombre", v)} maxLength={60} error={errorDe("negocio.nombre")} />
        <CampoTexto
          etiqueta="Eslogan"
          ayuda="Una frase corta que diga qué te hace distinto."
          valor={negocio.eslogan}
          onCambio={(v) => set("eslogan", v)}
          maxLength={90}
          error={errorDe("negocio.eslogan")}
        />
        <CampoArea
          etiqueta="Presentación"
          ayuda="Dos o tres oraciones: desde cuándo, qué hacen, cómo se reserva."
          valor={negocio.subtitulo}
          onCambio={(v) => set("subtitulo", v)}
          maxLength={220}
          filas={4}
          error={errorDe("negocio.subtitulo")}
        />
      </Bloque>

      <Bloque titulo="Contacto y ubicación">
        <CampoTexto
          etiqueta="WhatsApp"
          tipo="tel"
          autoComplete="tel"
          ayuda="Escribilo como quieras (0351 15…, +54 9 351…): lo acomodamos al salir del campo."
          valor={negocio.whatsapp}
          onCambio={(v) => set("whatsapp", v)}
          onSalir={() => {
            const normalizado = normalizarWhatsappAR(negocio.whatsapp);
            if (normalizado && normalizado !== negocio.whatsapp) set("whatsapp", normalizado);
          }}
          error={errorDe("negocio.whatsapp")}
        />
        <CampoTexto etiqueta="Dirección" valor={negocio.direccion} onCambio={(v) => set("direccion", v)} maxLength={120} error={errorDe("negocio.direccion")} />
        <CampoTexto
          etiqueta="Horario (como se muestra)"
          ayuda={
            config.plantilla === "barberia" || config.plantilla === "consultorio"
              ? "Los turnos disponibles se configuran en Contenido › Horarios de turnos."
              : "Por ejemplo, en qué horario respondés consultas."
          }
          valor={negocio.horario}
          onCambio={(v) => set("horario", v)}
          maxLength={120}
          error={errorDe("negocio.horario")}
        />
        <CampoTexto
          etiqueta="Instagram"
          ayuda="Solo el usuario. Si pegás el link, lo recortamos."
          valor={negocio.instagram ?? ""}
          onCambio={(v) =>
            editar((c) => {
              const usuario = v.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/[/?].*$/, "");
              if (usuario) c.negocio.instagram = usuario;
              else delete c.negocio.instagram;
            })
          }
          error={errorDe("negocio.instagram")}
        />
        <Interruptor
          etiqueta="WhatsApp siempre visible"
          ayuda="Suma un acceso directo a WhatsApp que acompaña al usuario mientras recorre la página."
          marcado={config.whatsappFlotante}
          onCambio={(v) => editar((c) => void (c.whatsappFlotante = v))}
        />
      </Bloque>
    </>
  );
}
