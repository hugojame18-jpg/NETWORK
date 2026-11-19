"use client";

import { motion } from "framer-motion";
import { MIN_PAYOUT_USD, dollars } from "@/lib/public-terms";

/**
 * The path an affiliate really takes, step for step. There is no catalogue to
 * browse and no link to generate: the team hands over the link, and
 * conversions come back on their own.
 */
const STEPS = [
  {
    number: "01",
    title: "Tu crées ton compte",
    description:
      "Gratuit, en deux minutes. Pas de dossier à faire valider : ton dashboard est ouvert dès l'inscription.",
  },
  {
    number: "02",
    title: "On te remet ton lien",
    description:
      "L'équipe te donne ton lien de tracking, prêt à être partagé. Il porte ton identifiant : tout ce qui passe par lui est à toi.",
  },
  {
    number: "03",
    title: "Tu envoies ton trafic",
    description:
      "Chaque conversion validée par l'annonceur remonte toute seule dans ton dashboard, avec ce qu'elle te rapporte.",
  },
  {
    number: "04",
    title: "Tu demandes ton paiement",
    description: `Ton solde monte à chaque conversion. Dès qu'il atteint ${dollars(MIN_PAYOUT_USD)}, tu demandes ton versement depuis ton dashboard.`,
  },
];

/**
 * The one light section of the page: four steps on a single line, joined by
 * the path they describe. Set on white so the page has a breath in its middle
 * and the steps read like a notice, not like a pitch.
 */
export function HowItWorks() {
  return (
    <section
      id="how"
      className="theme-light bg-background py-28 text-foreground sm:py-36"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-foreground/70 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              Fonctionnement
            </p>
            <h2 className="display text-4xl sm:text-5xl">
              De l&apos;inscription au premier paiement
            </h2>
          </div>
          <p className="max-w-sm text-lg leading-relaxed text-muted-foreground">
            Quatre étapes, et aucune ne te demande de configurer quoi que ce
            soit.
          </p>
        </div>

        <ol className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* The path the four steps sit on. */}
          <span
            className="pointer-events-none absolute top-6 right-[22%] left-6 hidden h-px bg-[linear-gradient(90deg,var(--primary),color-mix(in_srgb,var(--primary)_25%,transparent))] lg:block"
            aria-hidden
          />
          {STEPS.map((step, index) => (
            <motion.li
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.09 }}
              className="relative"
            >
              <span className="font-display relative flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-sm font-extrabold text-background ring-8 ring-background">
                {step.number}
              </span>
              <h3 className="font-display mt-6 text-xl font-bold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
