/**
 * Date helpers for booking slots. Slots are stored in UTC and always shown in
 * Romanian time, whatever the visitor's own time zone, because that is where
 * the experience happens. Safe to import from client and server code.
 */
export const SLOT_TIME_ZONE = "Europe/Bucharest";

/** A bookable slot as the booking box receives it. */
export interface SlotDTO {
  id: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  remaining: number;
  price: number;
}

const dayKeyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: SLOT_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "2026-11-15": the calendar day a moment falls on in Romania. */
export const dayKey = (d: Date | string) => dayKeyFormat.format(new Date(d));

/** "2026-11-15" for a plain calendar cell (no time zone involved). */
export const cellKey = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const timeFormat = new Intl.DateTimeFormat("en-GB", { timeZone: SLOT_TIME_ZONE, hour: "2-digit", minute: "2-digit" });
const dayFormat = new Intl.DateTimeFormat("en-GB", { timeZone: SLOT_TIME_ZONE, weekday: "short", day: "numeric", month: "short" });
const longDayFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: SLOT_TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** "09:00" */
export const formatTime = (d: Date | string) => timeFormat.format(new Date(d));
/** "Sat, 15 Nov" */
export const formatDay = (d: Date | string) => dayFormat.format(new Date(d));
/** "Saturday, 15 November 2026" */
export const formatLongDay = (d: Date | string) => longDayFormat.format(new Date(d));
/** "09:00 – 13:00", or "Sat 15 Nov 09:00 – Sun 16 Nov 17:00" when it runs over several days. */
export const formatSlotRange = (start: Date | string, end: Date | string) =>
  dayKey(start) === dayKey(end)
    ? `${formatTime(start)} – ${formatTime(end)}`
    : `${formatDay(start)} ${formatTime(start)} – ${formatDay(end)} ${formatTime(end)}`;

/** "Sat, 15 Nov" from a "2026-11-15" key, read as a plain date. */
export const formatDayKey = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
};

/** Minutes Romania is ahead of UTC at a given moment (120 in winter, 180 in summer). */
function zoneOffsetMinutes(at: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: SLOT_TIME_ZONE,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
  return Math.round((asUtc - at.getTime()) / 60000);
}

/** The UTC moment for a wall-clock time in Romania, e.g. romaniaTime(2026, 10, 15, 9) for 15 Nov 09:00. */
export function romaniaTime(year: number, monthIndex: number, day: number, hour: number, minute = 0) {
  const guess = new Date(Date.UTC(year, monthIndex, day, hour, minute));
  return new Date(guess.getTime() - zoneOffsetMinutes(guess) * 60000);
}
