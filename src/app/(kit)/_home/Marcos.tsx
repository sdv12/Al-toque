import Image from "next/image";

type Props = { src: string; alt: string; sizes: string; className?: string; prioridad?: boolean };

/** Captura dentro de un teléfono. Radios en % para que escale con su ancho. */
export function Telefono({ src, alt, sizes, className = "", prioridad }: Props) {
  return (
    <div className={`rounded-[14%/6.6%] bg-tinta p-[3%] shadow-[0_0_0_1px_rgb(255_255_255/0.14),0_30px_60px_-25px_rgb(23_21_15/0.55)] ${className}`}>
      <div className="relative aspect-[390/844] overflow-hidden rounded-[11%/5.2%] bg-superficie">
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover object-top" {...(prioridad ? { loading: "eager" as const } : {})} />
      </div>
    </div>
  );
}

/** Captura dentro de una ventana de navegador, con la dirección real de la demo. */
type PropsNavegador = Props & {
  url: string;
  /** Si hay video, se muestra con sus controles y la captura `src` como portada. */
  video?: string;
  /** Proporción del contenido (sin la barra), en formato CSS: "1440 / 900", "16 / 9". */
  aspecto?: string;
};

export function Navegador({ src, alt, sizes, url, video, aspecto = "1440 / 900", className = "" }: PropsNavegador) {
  return (
    <div className={`overflow-hidden rounded-[10px] border-2 border-tinta bg-superficie shadow-[0_30px_60px_-30px_rgb(23_21_15/0.5)] ${className}`}>
      <div className="flex items-center gap-3 border-b-2 border-tinta bg-superficie px-3 py-2">
        <span aria-hidden className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2.5 rounded-full border-[1.5px] border-tinta" />
          ))}
        </span>
        <span className="min-w-0 flex-1 truncate rounded-full bg-fondo px-3 py-0.5 text-center text-mini text-tinta-suave">{url}</span>
      </div>
      <div className="relative" style={{ aspectRatio: aspecto }}>
        {video ? (
          <video src={video} poster={src} controls muted playsInline preload="metadata" aria-label={alt} className="absolute inset-0 size-full bg-tinta object-cover object-top" />
        ) : (
          <Image src={src} alt={alt} fill sizes={sizes} className="object-cover object-top" />
        )}
      </div>
    </div>
  );
}
