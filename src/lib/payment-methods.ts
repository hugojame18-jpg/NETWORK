/**
 * How a payout was sent, in words.
 *
 * Shared by the admin and the publisher side on purpose: an affiliate reading
 * "BANK_WIRE" in their history and the admin reading "Virement bancaire" on
 * the same row is how two people end up describing the same payment
 * differently. Kept free of server-only imports so client components can use
 * it directly.
 */
export const PAYMENT_METHODS = [
  { value: "PAYPAL", label: "PayPal" },
  { value: "BANK_WIRE", label: "Virement bancaire" },
  { value: "CRYPTO", label: "Crypto (USDT…)" },
  { value: "PAYONEER", label: "Payoneer" },
  { value: "OTHER", label: "Autre" },
] as const;

export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number]["value"];

const BY_VALUE = new Map<string, string>(
  PAYMENT_METHODS.map((method) => [method.value, method.label]),
);

/** Falls back to the raw value, so an enum added later still reads sensibly. */
export function paymentMethodLabel(method: string | null | undefined): string {
  if (!method) return "—";
  return BY_VALUE.get(method) ?? method.replace(/_/g, " ");
}
