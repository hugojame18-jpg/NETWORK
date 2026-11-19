"use client";

import { motion } from "framer-motion";

/**
 * What the network runs — one vertical, said plainly.
 *
 * This used to list VOD, SOI/DOI and Pin Flow alongside it. The network runs
 * CC Submit; a page that advertises four verticals and delivers one loses the
 * affiliate at the first conversation.
 */
const POINTS = [
  {
    title: "Ce que c'est",
    body: "Le visiteur que tu envoies s'inscrit à une offre et renseigne sa carte. Quand l'annonceur valide l'inscription, c'est une conversion — et elle t'est payée.",
  },
  {
    title: "Ce que tu touches",
    body: "Un montant pour chaque conversion validée, qui dépend de l'offre. Ton dashboard affiche directement ce qui te revient, conversion par conversion.",
  },
  {
    title: "D'où vient le trafic",
    body: "Des réseaux sociaux avant tout, TikTok en tête. Tu gardes la main sur tes contenus, on fournit le lien et le suivi.",
  },
];

export function Verticals() {
  return (
    <section id="offer" className="relative overflow-hidden py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-foreground/70 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden />
              L&apos;offre
            </p>
            {/* The name of the vertical is the headline: one thing, said big. */}
            <h2 className="display text-6xl sm:text-7xl lg:text-8xl">
              CC
              <br />
              <span className="text-outline">Submit</span>
            </h2>
            <p className="mt-7 max-w-sm text-lg leading-relaxed text-muted-foreground">
              Une seule verticale, celle qu&apos;on connaît : des offres payées
              à la conversion, sur un pays ou sur plusieurs à la fois.
            </p>
          </motion.div>

          <ol className="divide-y divide-white/10 border-y border-white/10">
            {POINTS.map((point, index) => (
              <motion.li
                key={point.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="grid gap-x-6 gap-y-2 py-8 sm:grid-cols-[3rem_1fr]"
              >
                <span className="font-display text-sm font-bold text-signal">
                  0{index + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {point.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                    {point.body}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
