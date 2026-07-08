"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "./section-heading";

const STEPS = [
  {
    number: "01",
    title: "Créez votre compte",
    description: "Inscrivez-vous en tant que publisher ou annonceur en moins de deux minutes, sans paperasse.",
  },
  {
    number: "02",
    title: "Choisissez vos offres",
    description: "Parcourez le catalogue d'offres filtrées par pays, device et catégorie, ou publiez les vôtres.",
  },
  {
    number: "03",
    title: "Générez vos liens",
    description: "Récupérez un lien de tracking unique par offre, prêt à être diffusé sur vos canaux.",
  },
  {
    number: "04",
    title: "Suivez et encaissez",
    description: "Visualisez vos clics, conversions et commissions en direct, puis demandez votre paiement.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted/30 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Comment ça marche"
          title="De l'inscription au premier paiement"
          description="Un parcours pensé pour vous faire gagner du temps, pas pour vous le faire perdre en configuration."
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
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
