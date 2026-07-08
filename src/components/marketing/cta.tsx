"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border bg-card px-8 py-16 text-center shadow-premium"
      >
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--primary), transparent 70%)" }}
        />
        <div className="relative">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Prêt à faire grandir vos revenus ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Rejoignez RevNetwork aujourd&apos;hui et accédez à des offres à forte performance, un
            tracking en temps réel et des paiements fiables.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-11 px-6" render={<Link href="/sign-up" />}>
              Créer mon compte gratuitement
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="h-11 px-6" render={<Link href="/sign-in" />}>
              J&apos;ai déjà un compte
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
