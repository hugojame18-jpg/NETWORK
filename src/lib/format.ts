import type { Prisma } from "@/generated/prisma/client";

type Decimalish = Prisma.Decimal | number | string | null | undefined;

export function toNumber(value: Decimalish): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : Number(value);
}

// The narrow symbol on purpose: fr-FR spells US dollars "$US" by default, and
// that suffix on every figure of a dashboard that only ever deals in dollars is
// noise on each line. "3 975,00 $" says the same thing.
const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "USD",
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: Decimalish): string {
  return currencyFormatter.format(toNumber(value));
}

const wholeCurrencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "USD",
  currencyDisplay: "narrowSymbol",
  maximumFractionDigits: 0,
});

/** A rounded amount, for axes and chips where cents would only add width. */
export function formatCurrencyWhole(value: Decimalish): string {
  return wholeCurrencyFormatter.format(Math.round(toNumber(value)));
}

/**
 * An amount split into the part that is read and the part that is checked.
 *
 * A headline figure is scanned for its size — "3 975" — and the cents matter
 * only when reconciling. Returning them apart lets a component set the cents
 * smaller instead of giving ",00" the same weight as the thousands.
 */
export function moneyParts(value: Decimalish): {
  negative: boolean;
  whole: string;
  cents: string;
} {
  const amount = toNumber(value);
  let whole = "";
  let cents = "";
  for (const part of currencyFormatter.formatToParts(Math.abs(amount))) {
    if (part.type === "integer" || part.type === "group") whole += part.value;
    else if (part.type === "decimal" || part.type === "fraction")
      cents += part.value;
  }
  return { negative: amount < 0, whole, cents };
}

const compactFormatter = new Intl.NumberFormat("fr-FR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** "33,6 k" — for counts on a tile where the exact figure is one hover away. */
export function formatCompact(value: Decimalish): string {
  return compactFormatter.format(toNumber(value));
}

const relativeFormatter = new Intl.RelativeTimeFormat("fr-FR", {
  numeric: "auto",
});

/** "il y a 12 minutes", "hier" — for feeds, where recency is the point. */
export function formatRelative(value: Date | string, now = new Date()): string {
  const then = new Date(value).getTime();
  const seconds = Math.round((then - now.getTime()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return "à l'instant";
  if (abs < 3600) return relativeFormatter.format(Math.round(seconds / 60), "minute");
  if (abs < 86_400) return relativeFormatter.format(Math.round(seconds / 3600), "hour");
  if (abs < 7 * 86_400) return relativeFormatter.format(Math.round(seconds / 86_400), "day");
  return formatDate(value);
}

const numberFormatter = new Intl.NumberFormat("fr-FR");

export function formatNumber(value: Decimalish): string {
  return numberFormatter.format(toNumber(value));
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });
const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});
// Renders a calendar date in UTC so a value stored as `@db.Date` (which Prisma
// reads back as UTC midnight) always displays as the exact day that was saved,
// regardless of the server/viewer timezone. Use this for daily-stat dates.
const calendarDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export function formatDate(value: Date | string): string {
  return dateFormatter.format(new Date(value));
}

/** Format a pure calendar date (a `@db.Date` value or a "YYYY-MM-DD" string) in UTC. */
export function formatCalendarDate(value: Date | string): string {
  const date =
    typeof value === "string" ? new Date(`${value}T00:00:00.000Z`) : value;
  return calendarDateFormatter.format(date);
}

export function formatDateTime(value: Date | string): string {
  return dateTimeFormatter.format(new Date(value));
}

// Months are read off `@db.Date` values too, so they are formatted in UTC for
// the same reason: a month boundary must not shift with the viewer's timezone.
const monthFormatter = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Format a month from its first day, e.g. "novembre 2026". */
export function formatMonth(value: Date | string): string {
  const date =
    typeof value === "string" ? new Date(`${value}-01T00:00:00.000Z`) : value;
  return monthFormatter.format(date);
}

const percentFormatter = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** A percentage already expressed on a 0–100 scale, e.g. "7,41 %". */
export function formatPercent(value: number): string {
  return `${percentFormatter.format(value)} %`;
}
