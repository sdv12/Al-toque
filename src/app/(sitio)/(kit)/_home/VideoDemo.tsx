"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Props = {
  video: string;
  /** Captura que se ve mientras carga y la que queda si el video no se puede reproducir. */
  poster: string;
  alt: string;
  sizes: string;
};

/**
 * Video de demo: arranca solo (sin sonido, en loop) cuando entra en pantalla y se pausa al salir,
 * así no compite con la carga de la home. Con "reducir movimiento" no arranca solo: queda la
 * portada y los controles. Si el video falla (no carga, formato no soportado), queda la imagen.
 */
export function VideoDemo({ video, poster, alt, sizes }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || fallo) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada?.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.5 },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, [fallo]);

  if (fallo) return <Image src={poster} alt={alt} fill sizes={sizes} className="object-cover object-top" />;

  return (
    <video
      ref={ref}
      src={video}
      poster={poster}
      aria-label={alt}
      muted
      loop
      playsInline
      controls
      preload="none"
      onError={() => setFallo(true)}
      className="absolute inset-0 size-full bg-tinta object-cover object-top"
    />
  );
}
