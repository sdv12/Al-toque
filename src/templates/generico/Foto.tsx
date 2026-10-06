import Image from "next/image";
import type { Imagen } from "@/core/schema/comun";
import { Placeholder } from "@/ui/primitives/Placeholder";

type Props = { imagen: Imagen | undefined; aspecto?: string; sizes: string; className?: string; destacada?: boolean };

export function Foto({ imagen, aspecto = "4 / 3", sizes, className = "", destacada }: Props) {
  if (!imagen?.src) return <Placeholder descripcion={imagen?.alt || "Foto del trabajo"} aspecto={aspecto} className={className} />;
  return (
    <div className={`relative overflow-hidden rounded-base bg-superficie-2 ${className}`} style={{ aspectRatio: aspecto }}>
      <Image
        src={imagen.src}
        // Fotos de otros dominios: directo desde su origen (el optimizador no es un proxy abierto).
        unoptimized={!imagen.src.startsWith("/")}
        alt={imagen.alt}
        fill
        sizes={sizes}
        className="object-cover"
        {...(destacada ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
      />
    </div>
  );
}
