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
    body: "50 % du montant que l'annonceur verse pour chaque conversion. Le chiffre affiché dans ton dashboard est déjà ta part, pas le brut.",
  },
  {
    title: "D'où vient le trafic",
    body: "Des réseaux sociaux avant tout, TikTok en tête. Tu gardes la main sur tes contenus, on fournit le lien et le suivi.",
  },
];

export function Verticals() {
  return (
    <section id="offer" className="relative overflow-hidden py-28">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-14 text-right text-3xl font-bold tracking-widest text-muted-foreground/25 uppercase sm:text-4xl">
          L&apos;offre
        </p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="grid gap-10 lg:grid-cols-[1fr_1.4fr]"
        >
          <div>
            <h3 className="text-2xl font-bold tracking-tight uppercase">
              CC Submit
            </h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Une seule verticale, celle qu&apos;on connaît : des offres payées
              à la conversion, sur un pays ou sur plusieurs à la fois.
            </p>
          </div>

          <ol className="relative space-y-8 border-t border-primary/40 pt-8 pl-6">
            <span
              className="absolute top-9 bottom-1 left-[3px] w-px bg-border"
              aria-hidden
            />
            {POINTS.map((point) => (
              <li key={point.title} className="relative">
                <span
                  className="absolute top-1.5 -left-6 h-2 w-2 rounded-full bg-primary"
                  aria-hidden
                />
                <p className="text-sm font-semibold">{point.title}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {point.body}
                </p>
              </li>
            ))}
          </ol>
        </motion.div>
      </div>
    </section>
  );
}
