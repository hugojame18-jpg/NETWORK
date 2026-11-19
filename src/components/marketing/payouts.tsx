"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { MascotFull } from "@/components/brand/mascot";
import { MIN_PAYOUT_USD, PAYOUT_METHODS, dollars } from "@/lib/public-terms";
import { SectionHeading } from "./section-heading";

/**
 * How the money leaves.
 *
 * The question every affiliate asks second, after "what do I promote". It is
 * answered with what the product does and no more: a threshold, a request
 * made from the dashboard, the methods the profile accepts, and a history
 * that keeps every payment. No payout delay is promised, because none is
 * enforced by the code.
 */
const FACTS = [
  `Ton solde se met à jour à chaque conversion validée.`,
  `Dès ${dollars(MIN_PAYOUT_USD)}, tu demandes ton paiement depuis ton dashboard.`,
  "Chaque versement est inscrit dans ton historique, avec sa date et son moyen.",
];

const TRAIL = [
  { label: "Solde atteint", detail: dollars(MIN_PAYOUT_USD) },
  { label: "Demande envoyée", detail: "Depuis ton dashboard" },
  { label: "Paiement reçu", detail: "Inscrit dans ton historique" },
];

export function Payouts() {
  return (
    <section id="payouts" className="relative border-t border-white/8 py-28 sm:py-36">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Paiements"
            title={`Payé à la demande, dès ${dollars(MIN_PAYOUT_USD)}`}
            description="Tu n'attends pas une date fixée par quelqu'un d'autre : quand ton solde atteint le minimum, c'est toi qui déclenches."
          />

          <ul className="mt-9 space-y-4">
            {FACTS.map((fact) => (
              <li key={fact} className="flex items-start gap-3.5 text-[15px] leading-relaxed text-foreground/85">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-signal/18 text-signal">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {fact}
              </li>
            ))}
          </ul>

          <MascotFull pose="coin" className="mt-10 hidden h-48 w-auto lg:block" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-5"
        >
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-7">
            <p className="text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
              Moyens de paiement
            </p>
            <ul className="mt-5 grid grid-cols-2 gap-3">
              {PAYOUT_METHODS.map((method) => (
                <li
                  key={method}
                  className="font-display flex h-16 items-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-base font-bold tracking-tight"
                >
                  {method}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Tu choisis le tien dans ton profil, et tu peux en changer.
            </p>
          </div>

          <ol className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.025] p-7 sm:grid-cols-3">
            {TRAIL.map((step, index) => (
              <li key={step.label} className="relative">
                <span className="font-display flex h-8 w-8 items-center justify-center rounded-full border border-signal/50 text-xs font-bold text-signal">
                  {index + 1}
                </span>
                <p className="mt-3 text-sm font-semibold">{step.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {step.detail}
                </p>
              </li>
            ))}
          </ol>
        </motion.div>
      </div>
    </section>
  );
}
