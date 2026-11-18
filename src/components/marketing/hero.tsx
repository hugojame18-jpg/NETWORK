"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardMockup } from "./dashboard-mockup";
import { Particles } from "./particles";

/**
 * Three figures, each one a rule the product actually enforces — the
 * commission rate, the referral share, and how fast a conversion shows up.
 * Nothing here is a promise about volume or earnings.
 */
const FACTS = [
  { value: "50 %", label: "de chaque conversion, pour toi" },
  { value: "10 %", label: "du chiffre de chaque affilié que tu parraines" },
  { value: "En direct", label: "une conversion validée s'affiche aussitôt" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-24 lg:pt-28">
      {/* Animated particle "network" backdrop. */}
      <Particles className="pointer-events-none absolute inset-0 -z-10 opacity-70" />
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--primary), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground"
        >
          Réseau d&apos;affiliation CC Submit · payé à la conversion
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl leading-[1.05] font-semibold tracking-tight sm:text-6xl md:text-7xl"
        >
          Ton trafic rapporte.
          <br />
          <span className="text-gradient-brand">Tu en gardes la moitié.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
        >
          RevNetwork te donne ton lien, compte chaque conversion dès
          qu&apos;elle est validée et te reverse 50 % de ce qu&apos;elle
          rapporte. L&apos;inscription est gratuite et ton dashboard est ouvert
          tout de suite.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button
            size="lg"
            className="h-11 px-6"
            render={<Link href="/sign-up" />}
          >
            Créer mon compte
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 px-6"
            render={<a href="#how" />}
          >
            Comment ça marche
          </Button>
        </motion.div>

        <motion.dl
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.26 }}
          className="mx-auto mt-14 grid max-w-3xl gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3"
        >
          {FACTS.map((fact) => (
            <div key={fact.value} className="bg-background/80 px-5 py-5">
              <dt className="text-2xl font-semibold tracking-tight">
                {fact.value}
              </dt>
              <dd className="mt-1 text-sm text-muted-foreground">
                {fact.label}
              </dd>
            </div>
          ))}
        </motion.dl>
      </div>

      {/* Floating dashboard preview */}
      <div className="relative mx-auto mt-16 max-w-5xl px-6">
        <div
          className="pointer-events-none absolute -inset-x-10 top-10 bottom-0 -z-10 rounded-[40px] opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at center, var(--primary), transparent 70%)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <DashboardMockup />
          </motion.div>
        </motion.div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Aperçu du dashboard affilié — les chiffres affichés sont un exemple.
        </p>
      </div>
    </section>
  );
}
