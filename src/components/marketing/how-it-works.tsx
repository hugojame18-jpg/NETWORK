"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "./section-heading";

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
    title: "On te donne ton lien",
    description:
      "L'équipe te remet ton lien de tracking, prêt à être partagé. Il porte ton identifiant : tout ce qui passe par lui est à toi.",
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
    description:
      "Ton solde se met à jour à chaque conversion. Dès qu'il atteint le minimum de retrait, tu demandes ton virement.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          align="left"
          eyebrow="Comment ça marche"
          title="De l'inscription au premier paiement"
          description="Quatre étapes, et aucune ne te demande de configurer quoi que ce soit."
        />

        {/* One hairline grid rather than four floating cards: the steps are a
            sequence, and a shared frame is what makes them read as one. The
            lines are the gaps showing the frame's colour through, so they
            stay right at every column count. */}
        <ol className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <motion.li
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative bg-background p-7 sm:p-8"
            >
              <p className="display text-outline text-6xl transition-colors duration-300 group-hover:text-signal group-hover:[-webkit-text-stroke:0px]">
                {step.number}
              </p>
              <h3 className="mt-8 text-lg font-semibold tracking-tight">
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
