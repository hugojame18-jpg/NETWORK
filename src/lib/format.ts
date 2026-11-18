import type { Prisma } from "@/generated/prisma/client";

type Decimalish = Prisma.Decimal | number | string | null | undefined;

export function toNumber(value: Decimalish): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : Number(value);
}

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: Decimalish): string {
  return currencyFormatter.format(toNumber(value));
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
