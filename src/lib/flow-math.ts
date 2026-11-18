/**
 * Turning Flow's traffic rows into one figure per affiliate per day.
 *
 * Pure, with no database or network in it: this is the step that has already
 * gone wrong silently once (every row dropped, sync reported as a success), so
 * it is kept where a test can hold it still.
 */

export interface TrafficRow {
  slice?: {
    year?: number;
    month?: number;
    day?: number;
    sub3?: string | null;
  };
  traffic?: { raw?: string | number; uniq?: string | number };
  clicks?: string | number;
  hosts?: string | number;
}

export interface TrafficTotal {
  publisherId: string;
  date: Date;
  clicks: number;
  hosts: number;
}

export interface TrafficAggregate {
  totals: TrafficTotal[];
  /** sub3 values that carried traffic but belong to no affiliate. */
  unknown: string[];
}

function toInt(value: string | number | undefined): number {
  if (value === undefined || value === null) return 0;
  const n = typeof value === "number" ? value : Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : 0;
}

const DAY_MS = 86_400_000;

/**
 * @param rows       what Flow returned, one row per day per sub3
 * @param directory  every known sub3 (lower-cased) → affiliate id
 * @param from, to   the window that was asked for, UTC midnights, inclusive
 */
export function aggregateTraffic(
  rows: TrafficRow[],
  directory: Map<string, string>,
  from: Date,
  to: Date,
): TrafficAggregate {
  // Flow can answer a day-slice with the day number alone, no year or month.
  // Every date in the window is known, so the day number is enough to place
  // the row — and skipping it instead, as this once did, loses the whole sync
  // without a word.
  const dayToDate = new Map<number, Date>();
  for (let t = from.getTime(); t <= to.getTime(); t += DAY_MS) {
    const d = new Date(t);
    dayToDate.set(d.getUTCDate(), d);
  }

  // Summed, not written row by row. One affiliate can own several sub3, and
  // Flow reports "TR" and "Tr" as two rows for the same value: written one
  // after the other, each would overwrite the last and the day would show the
  // traffic of whichever row happened to come back final.
  const totals = new Map<string, TrafficTotal>();
  const unknown = new Set<string>();

  for (const row of rows) {
    const sub3 = row.slice?.sub3?.trim().toLowerCase();
    const { year, month, day } = row.slice ?? {};
    if (!sub3 || !day) continue;

    const date =
      year && month
        ? new Date(Date.UTC(year, month - 1, day))
        : dayToDate.get(day);
    if (!date) continue;

    const clicks = toInt(row.clicks ?? row.traffic?.raw);
    const hosts = toInt(row.hosts ?? row.traffic?.uniq);

    const publisherId = directory.get(sub3);
    if (!publisherId) {
      // Only worth flagging if something actually arrived under it.
      if (clicks > 0 || hosts > 0) unknown.add(sub3);
      continue;
    }

    const key = `${publisherId}|${date.toISOString().slice(0, 10)}`;
    const existing = totals.get(key);
    if (existing) {
      existing.clicks += clicks;
      existing.hosts += hosts;
    } else {
      totals.set(key, { publisherId, date, clicks, hosts });
    }
  }

  return { totals: [...totals.values()], unknown: [...unknown].sort() };
}
