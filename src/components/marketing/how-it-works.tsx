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
    <section id="how" className="bg-muted/30 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Comment ça marche"
          title="De l'inscription au premier paiement"
          description="Quatre étapes, et aucune ne te demande de configurer quoi que ce soit."
        />

        <div className="relative mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute top-8 right-[12%] left-[12%] hidden h-px bg-border lg:block" />
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative flex flex-col items-start"
            >
              <div className="glass shadow-premium relative z-10 mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-semibold text-primary">
                {step.number}
              </div>
              <h3 className="text-base font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
