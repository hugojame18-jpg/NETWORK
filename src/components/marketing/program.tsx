"use client";

import { motion } from "framer-motion";
import { Copy } from "lucide-react";
import {
  PUBLIC_TIERS,
  REFERRAL_PERCENT,
  dollars,
} from "@/lib/public-terms";
import { SectionHeading } from "./section-heading";

/**
 * What an affiliate earns beyond their conversions: the tier bonus and the
 * referral share.
 *
 * The tiers are read from the same table the ledger pays from, so the ladder
 * drawn here is the one applied to a balance. The bonus is described the way
 * it is computed — on what is earned from a tier onward, not retroactively on
 * everything before it.
 */
const HEIGHTS = [
  "lg:min-h-[17rem]",
  "lg:min-h-[19.5rem]",
  "lg:min-h-[22rem]",
  "lg:min-h-[24.5rem]",
];

export function Program() {
  return (
    <section id="program" className="relative border-t border-white/8 py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Programme"
          title="Plus tu envoies, plus chaque conversion rapporte"
          description="Quatre paliers, calculés sur tes gains cumulés. Un palier atteint est acquis : tu ne redescends jamais."
        />

        <ol className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          {PUBLIC_TIERS.map((tier, index) => {
            const top = index === PUBLIC_TIERS.length - 1;
            return (
              <motion.li
                key={tier.key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.09 }}
                className={`${HEIGHTS[index] ?? ""} relative flex flex-col overflow-hidden rounded-3xl border p-7 ${
                  top
                    ? "border-signal/50 bg-[radial-gradient(130%_120%_at_50%_0%,oklch(0.42_0.2_277),oklch(0.2_0.05_274)_70%)]"
                    : "border-white/10 bg-white/[0.025]"
                }`}
              >
                <p className="text-xs font-semibold tracking-[0.14em] text-foreground/60 uppercase">
                  Palier {index + 1}
                </p>
                <p className="font-display mt-2 text-2xl font-bold tracking-tight">
                  {tier.label}
                </p>
                <p className="display mt-auto pt-10 text-6xl">
                  {tier.bonusPercent > 0 ? `+${tier.bonusPercent} %` : "Départ"}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {tier.minEarnings > 0
                    ? `De bonus sur tes gains, à partir de ${dollars(tier.minEarnings)} cumulés.`
                    : "Dès ton inscription. Chaque conversion te fait avancer vers le palier suivant."}
                </p>
              </motion.li>
            );
          })}
        </ol>

        {/* Referral: the other way to earn more. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 grid grid-cols-1 items-center gap-8 rounded-3xl border border-white/10 bg-white/[0.025] p-7 sm:p-10 lg:grid-cols-[auto_1fr_1fr] lg:gap-10"
        >
          <p className="display text-7xl text-signal sm:text-8xl">
            {REFERRAL_PERCENT}&nbsp;%
          </p>
          <div className="min-w-0">
            <p className="font-display text-2xl font-bold tracking-tight">
              Parraine d&apos;autres affiliés
            </p>
            <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">
              Chaque affilié qui s&apos;inscrit avec ton lien te rapporte{" "}
              {REFERRAL_PERCENT}&nbsp;% du chiffre d&apos;affaires qu&apos;il
              génère, aussi longtemps qu&apos;il tourne. C&apos;est versé avec
              ton solde.
            </p>
          </div>
          <div className="min-w-0 rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
              Ton lien de parrainage
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 font-mono text-xs">
                revnetwork.live/sign-up?ref=TONCODE
              </code>
              <span className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-black">
                <Copy className="h-3.5 w-3.5" />
                Copier
              </span>
            </div>
            <p className="mt-2.5 text-xs text-muted-foreground">
              Ton code t&apos;attend dans l&apos;onglet Récompenses, dès
              l&apos;inscription.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
