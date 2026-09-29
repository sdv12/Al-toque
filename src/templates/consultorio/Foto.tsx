import Image from "next/image";
import type { Imagen } from "@/core/schema/comun";
import { Placeholder } from "@/ui/primitives/Placeholder";

type Props = { imagen: Imagen | undefined; aspecto?: string; sizes: string; className?: string };

export function Foto({ imagen, aspecto = "1 / 1", sizes, className = "" }: Props) {
  if (!imagen?.src) return <Placeholder descripcion={imagen?.alt || "Foto"} aspecto={aspecto} className={className} />;
  return (
    <div className={`relative overflow-hidden rounded-base bg-superficie-2 ${className}`} style={{ aspectRatio: aspecto }}>
      <Image src={imagen.src} alt={imagen.alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}
