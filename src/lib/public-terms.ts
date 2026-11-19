import { REFERRAL_RATE, TIERS } from "@/lib/loyalty";
import { PAYMENT_METHODS } from "@/lib/payment-methods";

/**
 * The terms the public pages are allowed to quote.
 *
 * Every figure on the landing is read from here, and everything here is read
 * from the code that enforces it — so the page cannot promise a referral
 * rate, a tier or a payment method the product does not apply. The one thing
 * deliberately absent is the commission split: what the network keeps is not
 * public, and nothing derived from it belongs in this file.
 */

/** Same as the default of `Publisher.minPayout` in the Prisma schema. */
export const MIN_PAYOUT_USD = 250;

export const REFERRAL_PERCENT = Math.round(REFERRAL_RATE * 100);

/** The tiers as an affiliate meets them: a name, a threshold, a bonus. */
export const PUBLIC_TIERS = TIERS.map((tier) => ({
  key: tier.key,
  label: tier.label,
  minEarnings: tier.minRevenue,
  bonusPercent: Math.round(tier.bonusRate * 100),
}));

export const TOP_TIER_BONUS_PERCENT = Math.max(
  ...PUBLIC_TIERS.map((tier) => tier.bonusPercent),
);

/** "Autre" is an admin-side catch-all, not something to advertise. */
export const PAYOUT_METHODS = PAYMENT_METHODS.filter(
  (method) => method.value !== "OTHER",
).map((method) => method.label);

const NBSP = String.fromCharCode(160);

/** 1 000 → "1 000 $". Whole dollars only; the landing quotes thresholds. */
export function dollars(amount: number): string {
  // A no-break space, so "20 000 $" never leaves its symbol on the next line.
  return `${new Intl.NumberFormat("fr-FR").format(amount)}${NBSP}$`;
}
