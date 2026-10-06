import Image from "next/image";
import type { Imagen } from "@/core/schema/comun";
import { Placeholder } from "@/ui/primitives/Placeholder";

type Props = { imagen: Imagen | undefined; aspecto?: string; sizes: string; className?: string };

export function Foto({ imagen, aspecto = "4 / 3", sizes, className = "" }: Props) {
  if (!imagen?.src) return <Placeholder descripcion={imagen?.alt || "Foto"} aspecto={aspecto} className={className} />;
  return (
    <div className={`relative overflow-hidden rounded-base bg-superficie-2 ${className}`} style={{ aspectRatio: aspecto }}>
      <Image
        src={imagen.src}
        alt={imagen.alt}
        fill
        sizes={sizes}
        // Fotos de otros dominios: directo desde su origen (el optimizador no es un proxy abierto).
        unoptimized={!imagen.src.startsWith("/")}
        className="object-cover"
      />
    </div>
  );
}
