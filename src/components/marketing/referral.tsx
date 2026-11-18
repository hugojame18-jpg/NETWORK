"use client";

import { motion } from "framer-motion";
import { Gift, GraduationCap, Users } from "lucide-react";
import { SectionHeading } from "./section-heading";

/**
 * The three things an affiliate gets beyond the commission itself. Each maps
 * to a screen in the dashboard: Récompenses (referral code and ladder) and
 * Formation.
 */
const CARDS = [
  {
    icon: Users,
    title: "Parraine, touche 10 %",
    body: "Tu as un code de parrainage dès l'inscription. Chaque affilié qui s'inscrit avec te rapporte 10 % du chiffre d'affaires qu'il génère, aussi longtemps qu'il tourne.",
  },
  {
    icon: Gift,
    title: "Des paliers à débloquer",
    body: "Bronze, Argent, Or, Platine : ton palier monte avec tes gains cumulés et ne redescend jamais. Une échelle de récompenses t'attend dans ton dashboard.",
  },
  {
    icon: GraduationCap,
    title: "On te montre comment faire",
    body: "Des vidéos de formation, dans l'ordre où il faut les regarder, pour lancer ton trafic sans tâtonner.",
  },
];

export function Referral() {
  return (
    <section id="referral" className="bg-muted/30 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Au-delà de la commission"
          title="Ce que tu gagnes en plus"
          description="Ton trafic te paie. Ton réseau et ta régularité aussi."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass rounded-2xl p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <card.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-base font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{card.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
