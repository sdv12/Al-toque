import Image from "next/image";
import type { Imagen } from "@/core/schema/comun";
import { Placeholder } from "@/ui/primitives/Placeholder";

type Props = {
  imagen: Imagen | undefined;
  /** Relación de aspecto CSS; "auto" para que llene el alto de su celda. */
  aspecto?: string;
  sizes: string;
  className?: string;
  /** Solo para la foto principal de la portada. */
  destacada?: boolean;
};

export function Foto({ imagen, aspecto = "4 / 5", sizes, className = "", destacada }: Props) {
  if (!imagen?.src) {
    return <Placeholder descripcion={imagen?.alt || "Foto del local"} aspecto={aspecto} className={className} />;
  }
  return (
    <div className={`relative overflow-hidden rounded-base bg-superficie ${className}`} style={{ aspectRatio: aspecto }}>
      <Image
        src={imagen.src}
        alt={imagen.alt}
        fill
        sizes={sizes}
        className="object-cover grayscale-[20%] sepia-[12%]"
        {...(destacada ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
      />
    </div>
  );
}
