"use client";

import { motion } from "framer-motion";
import { LineChart, ShieldCheck, Wallet, Zap, Globe2, Headset } from "lucide-react";
import { SectionHeading } from "./section-heading";

const REASONS = [
  {
    icon: Zap,
    title: "Tracking en temps réel",
    description: "Chaque clic, lead et conversion apparaît dans votre dashboard en quelques millisecondes, sans délai de traitement.",
  },
  {
    icon: Wallet,
    title: "Paiements sur lesquels compter",
    description: "Un statut clair pour chaque paiement — en attente, validé, envoyé — et un historique complet, sans surprise.",
  },
  {
    icon: ShieldCheck,
    title: "Protection anti-fraude",
    description: "Détection des clics dupliqués, du trafic bot et des schémas suspects avant qu'ils n'affectent vos revenus.",
  },
  {
    icon: LineChart,
    title: "Analytics qui comptent",
    description: "Des graphiques clairs sur les clics, leads, conversions et commissions — pas juste des tableaux bruts.",
  },
  {
    icon: Globe2,
    title: "Offres internationales",
    description: "Des campagnes ciblées par pays et par device, avec des payouts compétitifs sur chaque vertical.",
  },
  {
    icon: Headset,
    title: "Un support qui répond",
    description: "Une équipe dédiée pour vous aider à optimiser vos campagnes, pas un simple centre de tickets.",
  },
];

export function WhyJoin() {
  return (
    <section id="why" className="py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Pourquoi RevNetwork"
          title="Conçu pour les affiliés et les annonceurs sérieux"
          description="Nous avons construit la plateforme que nous aurions voulu utiliser : rapide, transparente, et honnête sur les chiffres."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="hover-lift shadow-premium rounded-2xl border border-border bg-card p-6"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <reason.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">{reason.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{reason.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
