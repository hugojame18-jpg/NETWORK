"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "./section-heading";

/**
 * The offer wall.
 *
 * An affiliate network is judged on what it has to promote, so the offers get
 * a section of their own, laid out the way an offer list reads inside a
 * network. What it does not carry is a payout column: the amount depends on
 * the offer and is shown to each affiliate in their dashboard, in dollars.
 *
 * The country codes are the ones conversions arrive under ("BE · CC Submit").
 */
const OFFERS = [
  { code: "FR", country: "France" },
  { code: "BE", country: "Belgique" },
  { code: "CH", country: "Suisse" },
  { code: "MULTI", country: "Multi-pays", note: "Plusieurs pays, un seul lien" },
];

const POINTS = [
  {
    title: "Ce qu'est le CC Submit",
    body: "Le visiteur que tu envoies s'inscrit à une offre et renseigne sa carte. Quand l'annonceur valide l'inscription, c'est une conversion.",
  },
  {
    title: "Ce que tu touches",
    body: "Un montant par conversion validée, qui dépend de l'offre. Ton dashboard affiche ce qui te revient, conversion par conversion.",
  },
  {
    title: "D'où vient le trafic",
    body: "Des réseaux sociaux avant tout, TikTok en tête. Tu gardes la main sur tes contenus, on fournit le lien et le suivi.",
  },
];

export function Offers() {
  return (
    <section id="offers" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Les offres"
              title="Une verticale, travaillée à fond"
              description="RevNetwork ne fait que du CC Submit. Pas de catalogue à trier : des offres qui convertissent sur du trafic social, pays par pays."
            />

            <ul className="mt-10 space-y-7">
              {POINTS.map((point) => (
                <li key={point.title} className="border-l border-white/12 pl-5">
                  <p className="font-display text-lg font-bold tracking-tight">
                    {point.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {point.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="self-start overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]"
          >
            <div className="hidden grid-cols-[1.3fr_1fr_1.2fr] gap-4 border-b border-white/8 px-7 py-4 text-[11px] font-semibold tracking-[0.14em] text-foreground/55 uppercase sm:grid">
              <span>Offre</span>
              <span>Conversion</span>
              <span>Rémunération</span>
            </div>

            <ul>
              {OFFERS.map((offer) => (
                <li
                  key={offer.code}
                  className="group grid items-center gap-x-4 gap-y-3 border-b border-white/8 px-7 py-6 transition-colors last:border-b-0 hover:bg-white/[0.03] sm:grid-cols-[1.3fr_1fr_1.2fr]"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-display flex h-12 w-16 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/[0.05] text-sm font-extrabold tracking-wide transition-colors group-hover:border-signal group-hover:text-signal">
                      {offer.code}
                    </span>
                    <div>
                      <p className="font-display text-lg leading-tight font-bold tracking-tight">
                        CC Submit
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {offer.country}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80">
                    {offer.note ?? "Inscription validée"}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-foreground/80">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
                    Payée à la conversion
                  </p>
                </li>
              ))}
            </ul>

            <p className="border-t border-white/8 bg-white/[0.02] px-7 py-4 text-xs leading-relaxed text-muted-foreground">
              Les pays ouverts évoluent. L&apos;équipe t&apos;indique ceux qui
              sont disponibles au moment où elle te remet ton lien.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
