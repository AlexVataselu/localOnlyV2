/**
 * Locals Only's guides are animal characters: the lynx, the wolf, the fox…
 * A host's portrait is their own photo when they have one; otherwise they get
 * a mascot, picked consistently from their id so it never changes between visits.
 */

export const MASCOTS = [
  { src: "/lynx.png", name: "The Lynx" },
  { src: "/wolf.png", name: "The Wolf" },
  { src: "/fox.png", name: "The Fox" },
  { src: "/bear.png", name: "The Bear" },
  { src: "/dog.png", name: "The Dog" },
] as const;

export type Mascot = (typeof MASCOTS)[number];

function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
}

/** The host's animal: the mascot they were given, or one derived from their id. */
export function mascotFor(host: { id: string; image: string | null }): Mascot {
  return MASCOTS.find((m) => m.src === host.image) ?? MASCOTS[hash(host.id) % MASCOTS.length];
}

/** Portrait to show for a host: their own photo, else their mascot. */
export function portraitFor(host: { id: string; image: string | null }): string {
  return host.image ?? mascotFor(host).src;
}
