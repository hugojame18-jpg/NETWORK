"use client";

import { motion } from "framer-motion";
import { Headset, Zap, TrendingUp, Globe2, BadgeCheck, Rocket } from "lucide-react";

const BENEFITS = [
  { icon: Headset, title: "Support 24/7", description: "Un manager dédié, joignable à toute heure." },
  { icon: Zap, title: "Paiements express", description: "Retraits rapides, jusqu'au paiement quotidien." },
  { icon: TrendingUp, title: "Payouts élevés", description: "Des taux parmi les plus compétitifs du marché." },
  { icon: Globe2, title: "Couverture mondiale", description: "Des offres dans plus de 150 pays." },
  { icon: BadgeCheck, title: "Offres exclusives", description: "En direct des annonceurs, sans intermédiaire." },
  { icon: Rocket, title: "Scalable", description: "Du premier lead au volume, sans plafond." },
];

export function BenefitsStrip() {
  return (
    <section className="border-y border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-6 py-2 sm:grid-cols-3 lg:grid-cols-6">
        {BENEFITS.map((benefit, i) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="flex flex-col items-center gap-2 px-3 py-6 text-center"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <benefit.icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold">{benefit.title}</p>
            <p className="text-xs leading-snug text-muted-foreground">{benefit.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
