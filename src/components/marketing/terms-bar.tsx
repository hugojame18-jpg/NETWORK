import {
  MIN_PAYOUT_USD,
  PAYOUT_METHODS,
  REFERRAL_PERCENT,
  TOP_TIER_BONUS_PERCENT,
  dollars,
} from "@/lib/public-terms";

/**
 * The network's terms, as four figures.
 *
 * Where other networks put numbers nobody can check — "10 000 affiliates",
 * "$5M paid" — this strip carries the conditions a visitor is actually
 * signing up to, each one read from the code that applies it.
 */
const TERMS = [
  {
    value: dollars(MIN_PAYOUT_USD),
    label: "Minimum de retrait",
    detail: "Tu demandes ton paiement dès que ton solde l'atteint.",
  },
  {
    value: `${REFERRAL_PERCENT} %`,
    label: "Parrainage",
    detail: "Du chiffre de chaque affilié que tu amènes.",
  },
  {
    value: `+${TOP_TIER_BONUS_PERCENT} %`,
    label: "Bonus de palier",
    detail: "Sur tes gains, au palier le plus haut.",
  },
  {
    value: String(PAYOUT_METHODS.length),
    label: "Moyens de paiement",
    detail: "PayPal, virement, crypto ou Payoneer.",
  },
];

export function TermsBar() {
  return (
    <section aria-label="Les conditions du réseau" className="px-6">
      <dl className="mx-auto grid max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] sm:grid-cols-2 lg:grid-cols-4">
        {TERMS.map((term) => (
          <div
            key={term.label}
            className="border-b border-white/8 px-7 py-7 last:border-b-0 sm:[&:nth-child(odd)]:border-r sm:[&:nth-last-child(-n+2)]:border-b-0 lg:border-r lg:border-b-0 lg:last:border-r-0"
          >
            <dt className="text-xs font-semibold tracking-[0.14em] text-foreground/60 uppercase">
              {term.label}
            </dt>
            <dd className="mt-3">
              <span className="display block text-5xl">{term.value}</span>
              <span className="mt-3 block text-sm leading-relaxed text-muted-foreground">
                {term.detail}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
