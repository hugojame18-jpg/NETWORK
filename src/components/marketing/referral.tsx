"use client";

import { motion } from "framer-motion";
import { Gift, GraduationCap, Send } from "lucide-react";
import { SectionHeading } from "./section-heading";

/**
 * What comes with the account beyond the numbers: the reward ladder, the
 * training, and a person to write to. The referral programme has its own card
 * in the product tour above, so it is not repeated here.
 */
const CARDS = [
  {
    icon: Gift,
    title: "Des paliers à débloquer",
    body: "Bronze, Argent, Or, Platine : ton palier monte avec tes gains cumulés et ne redescend jamais. À partir d'Argent, tes gains suivants sont majorés : +3 %, puis +5 %, puis +8 %.",
  },
  {
    icon: GraduationCap,
    title: "On te montre comment faire",
    body: "Des vidéos de formation, dans l'ordre où il faut les regarder, pour lancer ton trafic sans tâtonner.",
  },
  {
    icon: Send,
    title: "Une équipe à qui écrire",
    body: "Une question, un lien à recevoir, un doute sur un chiffre : tu écris directement à l'équipe sur Telegram, sans ticket ni formulaire.",
  },
];

export function Referral() {
  return (
    <section id="referral" className="bg-muted/30 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Avec ton compte"
          title="Tu n'es pas seul devant tes chiffres"
          description="Des paliers à franchir, de quoi apprendre, et quelqu'un pour répondre."
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
