/**
 * Reading a daily series: what a window adds up to, and how that compares with
 * the window before it.
 *
 * Kept pure and separate from the loaders because the same sums feed both
 * dashboards, and a "+12 %" on a tile is a claim — it has to be the same claim
 * everywhere, and one a test can check.
 */

/** The last `length` values of a series, oldest first. */
export function tail<T>(points: T[], length: number): T[] {
  return length <= 0 ? [] : points.slice(-length);
}

/** Sum of one numeric field over the last `length` points, skipping `skip` at the end. */
export function sumWindow<T>(
  points: T[],
  pick: (point: T) => number,
  length: number,
  skip = 0,
): number {
  const end = points.length - skip;
  const start = Math.max(0, end - length);
  let total = 0;
  for (let i = start; i < end; i += 1) total += pick(points[i]);
  return total;
}

/**
 * Change from `previous` to `current`, in percent.
 *
 * Null when there is nothing to compare against: growth from zero is not
 * "+∞ %" and not "+100 %", it is simply new, and a tile says so by showing no
 * delta at all rather than an invented one.
 */
export function pctChange(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null;
  if (previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export interface WindowComparison {
  current: number;
  previous: number;
  /** Percent change, or null when the previous window was empty. */
  delta: number | null;
}

/** The last `length` points against the `length` points before them. */
export function compareWindows<T>(
  points: T[],
  pick: (point: T) => number,
  length: number,
): WindowComparison {
  const current = sumWindow(points, pick, length);
  const previous = sumWindow(points, pick, length, length);
  return { current, previous, delta: pctChange(current, previous) };
}

/** Conversions per click as a percentage; zero when nothing was clicked. */
export function conversionRate(conversions: number, clicks: number): number {
  return clicks > 0 ? (conversions / clicks) * 100 : 0;
}

/**
 * How far along a balance is toward a threshold, from 0 to 1.
 *
 * Clamped at both ends: a negative balance (an advance not yet earned back)
 * shows an empty bar rather than one drawn backwards, and anything past the
 * threshold is simply full.
 */
export function progressToward(balance: number, threshold: number): number {
  if (threshold <= 0) return 1;
  return Math.min(1, Math.max(0, balance / threshold));
}
