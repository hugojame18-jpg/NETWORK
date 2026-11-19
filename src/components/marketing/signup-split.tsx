"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MascotFull } from "@/components/brand/mascot";

/**
 * The closing call to action.
 *
 * It used to be split in two, Publisher on one side and Advertiser on the
 * other. The network has no advertiser side to sign up for, so there is one
 * door now, and it leads somewhere. It is the hero's promise said once more,
 * at full size, with the same button — the page ends the way it started.
 */
export function SignupSplit() {
  return (
    <section id="join" className="relative overflow-hidden px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[40px] border border-white/10 px-6 py-20 text-center sm:py-24"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 0%, oklch(0.42 0.2 277) 0%, oklch(0.2 0.06 274) 55%, oklch(0.158 0.013 274) 100%)",
        }}
      >
        <div className="landing-grid pointer-events-none absolute inset-0 opacity-70" />

        <MascotFull pose="cheer" className="relative mx-auto mb-6 h-44 w-auto sm:h-56" />
        <h2 className="display relative mx-auto max-w-4xl text-5xl sm:text-7xl lg:text-8xl">
          Prêt à envoyer
          <br />
          ton premier clic&nbsp;?
        </h2>
        <p className="relative mx-auto mt-7 max-w-md text-lg text-foreground/70">
          Compte gratuit, dashboard ouvert tout de suite, payé à chaque
          conversion validée.
        </p>
        <Link
          href="/sign-up"
          className="glow-signal group relative mt-10 inline-flex h-14 items-center gap-2 rounded-full bg-white px-9 text-base font-semibold text-black transition-transform hover:scale-[1.03] active:scale-[0.98]"
        >
          Devenir affilié
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </motion.div>
    </section>
  );
}
