"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "./animated-counter";

const STATS = [
  { value: 4200, suffix: "+", label: "Publishers actifs" },
  { value: 380, suffix: "+", label: "Annonceurs" },
  { value: 9.4, prefix: "", suffix: "M $", decimals: 1, label: "Commissions versées" },
  { value: 99.9, suffix: "%", decimals: 1, label: "Disponibilité du tracking" },
];

export function Stats() {
  return (
    <section className="border-y border-border bg-muted/30 py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="text-center"
          >
            <p className="text-gradient-brand text-4xl font-semibold tracking-tight sm:text-5xl">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals ?? 0} />
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
