"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const DIAGONAL_WORDS = ["Support 24/7", "Paiements rapides", "Taux élevés", "Couverture mondiale", "Offres exclusives"];

const POINTS = [
  "Un support réactif et disponible 24h/24, 7j/7.",
  "Des paiements rapides, avec option au jour le jour.",
  "Du trafic testé qui transforme vos leads en profit.",
  "Des offres exclusives et directes en CPA et CPL, partout dans le monde.",
  "Des produits à forte conversion, scalables à l'international.",
];

export function WhyUs() {
  return (
    <section id="why" className="theme-light bg-background text-foreground py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
        {/* Diagonal stacked benefit words */}
        <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden">
          <div className="-rotate-[30deg] space-y-2 text-center">
            {DIAGONAL_WORDS.map((word, i) => (
              <motion.p
                key={word}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="text-lg font-extrabold tracking-tight whitespace-nowrap uppercase sm:text-2xl"
              >
                {word}
              </motion.p>
            ))}
          </div>
        </div>

        <div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold tracking-tight uppercase sm:text-4xl"
          >
            Pourquoi nous ?
          </motion.h2>

          <p className="mt-6 text-muted-foreground">
            RevNetwork est un réseau d&apos;affiliation à la performance qui réunit les meilleurs
            acteurs du secteur. Nous aidons les marketeurs à booster leurs résultats et à développer
            leurs revenus grâce à nos technologies, nos outils et une équipe expérimentée et réactive.
          </p>

          <p className="mt-6 font-medium">En devenant notre partenaire, vous obtenez&nbsp;:</p>
          <ul className="mt-4 space-y-3">
            {POINTS.map((point, i) => (
              <motion.li
                key={point}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="flex items-start gap-3 text-sm"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-muted-foreground">{point}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
