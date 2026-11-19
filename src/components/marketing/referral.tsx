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
    <section
      id="referral"
      className="relative border-t border-white/8 py-28 sm:py-36"
    >
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Avec ton compte"
          title="Tu n'es pas seul devant tes chiffres"
          description="Des paliers à franchir, de quoi apprendre, et quelqu'un pour répondre."
        />

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition-colors hover:border-white/20"
            >
              {/* A little of the hero's light in each card's corner, so the
                  section belongs to the same room. */}
              <div
                className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-60"
                style={{ background: "oklch(0.55 0.22 277)" }}
              />
              <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl brand-fill">
                <card.icon className="h-5 w-5" />
              </span>
              <h3 className="relative mt-7 text-xl font-semibold tracking-tight">
                {card.title}
              </h3>
              <p className="relative mt-3 text-[15px] leading-relaxed text-muted-foreground">
                {card.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
