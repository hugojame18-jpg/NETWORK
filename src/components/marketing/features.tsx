"use client";

import { motion } from "framer-motion";
import { BarChart3, Bell, KeyRound, Layers } from "lucide-react";
import { SectionHeading } from "./section-heading";

export function Features() {
  return (
    <section id="features" className="py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Avantages"
          title="Une plateforme, deux métiers, un seul niveau d'exigence"
          description="Publishers et annonceurs partagent la même infrastructure de tracking — et le même niveau de finition."
        />

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="hover-lift shadow-premium relative overflow-hidden rounded-2xl border border-border bg-card p-8 lg:col-span-2"
          >
            <div className="bg-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_60%_60%_at_100%_0%,black,transparent)]" />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="relative mt-5 text-xl font-semibold">Des graphiques qui racontent une histoire</h3>
            <p className="relative mt-2 max-w-md text-sm text-muted-foreground">
              Clics, leads, conversions et commissions sur la même timeline, avec des périodes
              comparables et des exports prêts pour vos reportings.
            </p>
            <div className="relative mt-8 flex h-32 items-end gap-2">
              {[30, 45, 38, 55, 62, 48, 70, 65, 80, 74, 90, 84].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03, duration: 0.5 }}
                  className="flex-1 rounded-t-sm bg-gradient-to-t from-chart-2/30 to-chart-1"
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hover-lift shadow-premium rounded-2xl border border-border bg-card p-8"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-xl font-semibold">Notifications utiles</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Une conversion approuvée, un paiement envoyé, une offre mise à jour : vous le savez
              tout de suite, sans avoir à rafraîchir.
            </p>
            <div className="mt-6 space-y-2">
              {["Conversion approuvée", "Paiement envoyé"].map((label) => (
                <div key={label} className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  {label}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="hover-lift shadow-premium rounded-2xl border border-border bg-card p-8"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <KeyRound className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-xl font-semibold">Sécurité de niveau entreprise</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Authentification robuste, permissions par rôle, rate limiting et validation stricte
              sur chaque endpoint de l&apos;API.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hover-lift shadow-premium relative overflow-hidden rounded-2xl border border-border bg-card p-8 lg:col-span-2"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-xl font-semibold">Un catalogue d&apos;offres organisé</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Catégories, restrictions, payout, pays et device : tout ce qu&apos;il faut savoir
              avant de promouvoir une offre, au même endroit.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Finance", "CPA", "US · CA · FR", "Desktop + Mobile", "Cookie 30j"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
