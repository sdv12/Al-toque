const DAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function hhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** "Hoy 14:32", "Ayer 09:10", "lun 27/10 14:32". */
export function formatWhen(ts: number, now = Date.now()): string {
  const d = new Date(ts);
  const days = Math.round((startOfDay(now) - startOfDay(ts)) / 86_400_000);
  if (days === 0) return `Hoy ${hhmm(d)}`;
  if (days === 1) return `Ayer ${hhmm(d)}`;
  return `${DAYS[d.getDay()]} ${formatDate(ts)} ${hhmm(d)}`;
}

/** "27/10". */
export function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

/** "mié 28/10". */
export function formatDay(ts: number): string {
  return `${DAYS[new Date(ts).getDay()]} ${formatDate(ts)}`;
}
