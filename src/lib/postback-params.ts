/**
 * Reading what a network put in a postback.
 *
 * Kept free of database imports on purpose: this is the part where a wrong
 * guess silently turns into wrong money — an amount read as zero, a decline
 * counted as a sale — so it has to be testable on its own.
 */

/**
 * Parameter names seen in the wild for the same things. Networks each pick
 * their own, and a conversion silently worth zero because the amount arrived
 * as `sum` instead of `payout` is exactly the kind of bug nobody notices for a
 * month.
 */
export const AMOUNT_PARAMS = [
  "payout",
  "amount",
  "sum",
  "revenue",
  "value",
  "price",
];
export const TXID_PARAMS = [
  "txid",
  "transaction_id",
  "transactionid",
  "tid",
  "clickid",
  "click_id",
];
export const SUB3_PARAMS = ["sub3", "sub_id3", "subid3", "s3", "aff_sub3"];
export const OFFER_PARAMS = [
  "offer",
  "offer_name",
  "campaign",
  "campaign_name",
];
export const STATUS_PARAMS = ["status", "conversion_status", "state"];

/** First present, non-empty value among `names`. */
export function pickParam(
  params: URLSearchParams,
  names: string[],
): string | null {
  for (const name of names) {
    const value = params.get(name);
    if (value !== null && value.trim() !== "") return value.trim();
  }
  return null;
}

/** Parses an amount that may arrive as "30", "30.00", "30,00" or "$30". */
export function parseAmount(raw: string | null): number | null {
  if (raw === null) return null;
  const cleaned = raw.replace(/[^0-9.,-]/g, "").replace(",", ".");
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? value : null;
}

/**
 * What the network says happened to the conversion.
 *
 * - `approved`: count it.
 * - `declined`: the network took it back — cancel it if it was counted.
 * - `pending`: not money yet; wait for the call that settles it.
 * - `unknown`: a status this code has never seen. Never counted: guessing
 *   "approved" for a word that meant "refused" pays an affiliate for a sale
 *   that did not happen.
 */
export type ConversionState = "approved" | "declined" | "pending" | "unknown";

// Affise (and so Flow) sends numbers: 1 confirmed, 2 pending, 3 declined,
// 5 hold. Most other networks send words.
const APPROVED = new Set([
  "1",
  "approved",
  "approve",
  "confirmed",
  "confirm",
  "success",
  "paid",
  "accepted",
]);
const DECLINED = new Set([
  "3",
  "declined",
  "decline",
  "rejected",
  "reject",
  "refused",
  "cancelled",
  "canceled",
  "chargeback",
  "refunded",
  "refund",
  "trash",
]);
const PENDING = new Set(["2", "5", "pending", "hold", "on_hold", "waiting"]);

/**
 * No status at all means approved: the URL handed out before reversals
 * existed carried none, and the network was told to fire it on approved
 * conversions only.
 */
export function conversionState(raw: string | null): ConversionState {
  if (raw === null) return "approved";
  const value = raw.trim().toLowerCase();
  if (value === "") return "approved";
  // A macro the network did not fill in arrives as its own name in braces.
  // That says nothing about the conversion, so it is read as no status at
  // all — a mistyped macro must degrade to the old behaviour, not quietly
  // stop every conversion from being counted.
  if (value.startsWith("{") && value.endsWith("}")) return "approved";
  if (APPROVED.has(value)) return "approved";
  if (DECLINED.has(value)) return "declined";
  if (PENDING.has(value)) return "pending";
  return "unknown";
}

/**
 * How a sub3 is compared: trimmed and lower-cased, nothing else.
 *
 * Networks echo back whatever case the value was typed in, so "Slime" and
 * "slime" must be one affiliate. Nothing is stripped beyond that — a value
 * carrying a stray backtick is still a distinct value on the network's side,
 * and it is attached as it is rather than quietly rewritten.
 */
export function normalizeSub3(raw: string | null | undefined): string | null {
  if (raw === null || raw === undefined) return null;
  const value = raw.trim().toLowerCase();
  return value === "" ? null : value;
}

/**
 * The link an affiliate actually shares.
 *
 * The advertiser URL the admin delivered, carrying this affiliate's sub3 so
 * the network echoes it back on conversion. Without it every postback arrives
 * anonymous and no conversion can be attributed.
 */
export function withSub3(
  targetUrl: string,
  token: string | null | undefined,
): string {
  if (!token) return targetUrl;
  try {
    const url = new URL(targetUrl);
    // An admin who already wrote a sub3 by hand knows something we don't.
    if (url.searchParams.has("sub3")) return targetUrl;
    url.searchParams.set("sub3", token);
    return url.toString();
  } catch {
    // Not a URL we can parse: hand it back untouched rather than corrupt it.
    return targetUrl;
  }
}

/**
 * The stats day a conversion received at `moment` is booked against.
 *
 * Read from the server's wall clock and pinned to UTC midnight — the same key
 * `PublisherDailyStat` uses everywhere else. Taking the moment as an argument
 * is what lets a conversion be cancelled, or attached after the fact, on the
 * day it actually arrived rather than on the day someone got round to it.
 */
export function bookingDay(moment: Date): Date {
  return new Date(
    Date.UTC(moment.getFullYear(), moment.getMonth(), moment.getDate()),
  );
}
