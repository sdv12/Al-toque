/**
 * Redes sociales del negocio. Se guarda el link completo (https) de cada perfil: así cada red
 * usa su formato (tiktok.com/@usuario, linkedin.com/company/…) sin que la landing tenga que saberlo.
 */
export const REDES = ["instagram", "facebook", "tiktok", "youtube", "x", "linkedin"] as const;
export type RedSocial = (typeof REDES)[number];

export const NOMBRE_RED: Record<RedSocial, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  x: "X (Twitter)",
  linkedin: "LinkedIn",
};

const DOMINIOS: Record<RedSocial, readonly string[]> = {
  instagram: ["instagram.com"],
  facebook: ["facebook.com", "fb.com"],
  tiktok: ["tiktok.com"],
  youtube: ["youtube.com"],
  x: ["x.com", "twitter.com"],
  linkedin: ["linkedin.com"],
};

/** Perfil a partir de solo el usuario, para quien escribe "@usuario" en vez de pegar el link. */
const PERFIL: Record<RedSocial, (usuario: string) => string> = {
  instagram: (u) => `https://instagram.com/${u}`,
  facebook: (u) => `https://facebook.com/${u}`,
  tiktok: (u) => `https://www.tiktok.com/@${u}`,
  youtube: (u) => `https://www.youtube.com/@${u}`,
  x: (u) => `https://x.com/${u}`,
  linkedin: (u) => `https://www.linkedin.com/in/${u}`,
};

const USUARIO = /^[A-Za-z0-9._-]{1,60}$/;

function dominioDe(red: RedSocial, host: string): boolean {
  const h = host.toLowerCase().replace(/^(www\.|m\.)/, "");
  return DOMINIOS[red].some((d) => h === d || h.endsWith(`.${d}`));
}

/** ¿Es un link https a un perfil de esa red? (lo que acepta el schema) */
export function esUrlDeRed(red: RedSocial, url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && dominioDe(red, u.hostname) && u.pathname.length > 1;
  } catch {
    return false;
  }
}

/**
 * Lo que escribe la persona → link al perfil, o null si no se puede interpretar.
 * Acepta "@usuario", "usuario" o el link (con o sin https://); del link descarta ?query y #.
 */
export function urlDeRed(red: RedSocial, entrada: string): string | null {
  const texto = entrada.trim();
  if (!texto) return null;

  const pareceLink = /^https?:\/\//i.test(texto) || DOMINIOS[red].some((d) => texto.toLowerCase().includes(d));
  if (pareceLink) {
    try {
      const u = new URL(/^https?:\/\//i.test(texto) ? texto : `https://${texto}`);
      if (!dominioDe(red, u.hostname)) return null;
      const ruta = u.pathname.replace(/\/+$/, "");
      if (!ruta) return null;
      return `https://${u.hostname.toLowerCase()}${ruta}`;
    } catch {
      return null;
    }
  }

  const usuario = texto.replace(/^@/, "");
  return USUARIO.test(usuario) ? PERFIL[red](usuario) : null;
}

/** "@usuario" para mostrar, sacado del link (último tramo de la ruta). */
export function usuarioDeUrl(url: string): string {
  try {
    const tramo = new URL(url).pathname.split("/").filter(Boolean).pop() ?? "";
    return tramo.startsWith("@") ? tramo : `@${tramo}`;
  } catch {
    return url;
  }
}
