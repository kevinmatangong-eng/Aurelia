const TIME_RE = /^(\d{1,2}):(\d{2})$/;

export function parseHm(value: string): { h: number; m: number } | null {
  const match = TIME_RE.exec(value.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return { h, m };
}

export function formatHm(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** True when `now` (ms) falls inside quiet hours in the given IANA timezone. */
export function isInQuietHours(
  nowMs: number,
  timezone: string,
  start: string,
  end: string,
): boolean {
  const startHm = parseHm(start);
  const endHm = parseHm(end);
  if (!startHm || !endHm) return false;
  const minutes = localMinutes(nowMs, timezone);
  const from = startHm.h * 60 + startHm.m;
  const to = endHm.h * 60 + endHm.m;
  if (from === to) return false;
  if (from < to) return minutes >= from && minutes < to;
  return minutes >= from || minutes < to;
}

export function localMinutes(nowMs: number, timezone: string): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(nowMs));
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
    const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
    return hour * 60 + minute;
  } catch {
    const d = new Date(nowMs);
    return d.getHours() * 60 + d.getMinutes();
  }
}

export function formatNow(timezone: string, nowMs = Date.now()): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hourCycle: "h23",
      timeZoneName: "short",
    }).format(new Date(nowMs));
  } catch {
    return new Date(nowMs).toISOString();
  }
}

export function startOfLocalDay(nowMs: number, timezone: string): Date {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date(nowMs));
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    // Interpret local midnight as UTC-equivalent via the timezone offset at that date.
    const guess = new Date(`${year}-${month}-${day}T00:00:00`);
    const asInZone = new Date(
      guess.toLocaleString("en-US", { timeZone: timezone }),
    );
    const diff = guess.getTime() - asInZone.getTime();
    return new Date(guess.getTime() + diff);
  } catch {
    const d = new Date(nowMs);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
