"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { DashboardMockup } from "./dashboard-mockup";

/**
 * Three facts, each one something the product actually does. The commission
 * split is deliberately not among them: what an affiliate is paid is shown to
 * them in their dashboard, in dollars, and is not advertised as a percentage.
 */
const FACTS = [
  { value: "Gratuit", label: "inscription et accès immédiats" },
  { value: "En direct", label: "chaque conversion, dès qu'elle est validée" },
  { value: "10 %", label: "du chiffre de chaque affilié que tu parraines" },
];

const rise = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

/**
 * The first screen.
 *
 * Built from the brand's three elements and nothing else: the night
 * background with its indigo light, the display face for the two lines that
 * say what this is, and the signal colour on the only two things that matter
 * here — the promise and the button. Everything decorative that used to float
 * behind the headline is gone; the product itself, shown below, is the image.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-24 sm:pt-24">
      {/* The room: a faint floor, and light coming from above. */}
      <div className="landing-grid pointer-events-none absolute inset-0 -z-10" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[620px] w-[1100px] -translate-x-1/2 rounded-full opacity-45 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.55 0.22 277), transparent 72%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <motion.p
          {...rise}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pr-4 pl-3 text-[13px] font-medium text-foreground/80 backdrop-blur"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
          </span>
          Réseau d&apos;affiliation CC Submit
        </motion.p>

        <motion.h1
          {...rise}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="display text-[clamp(3rem,8.2vw,6.75rem)]"
        >
          Ton trafic rapporte.
          <br />
          <span className="text-signal">On te le paie.</span>
        </motion.h1>

        <motion.p
          {...rise}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground"
        >
          Tu reçois ton lien, tu envoies ton trafic. Chaque conversion validée
          s&apos;affiche aussitôt dans ton dashboard, avec ce qu&apos;elle te
          rapporte.
        </motion.p>

        <motion.div
          {...rise}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/sign-up"
            className="glow-signal group inline-flex h-12 items-center gap-2 rounded-full bg-signal px-7 text-[15px] font-semibold text-signal-foreground transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Créer mon compte
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#how"
            className="inline-flex h-12 items-center rounded-full border border-white/12 px-7 text-[15px] font-medium text-foreground/85 transition-colors hover:border-white/25 hover:bg-white/[0.04]"
          >
            Comment ça marche
          </a>
        </motion.div>

        <motion.dl
          {...rise}
          transition={{ duration: 0.6, delay: 0.26 }}
          className="mx-auto mt-14 flex max-w-3xl flex-col divide-y divide-white/8 text-left sm:flex-row sm:divide-x sm:divide-y-0"
        >
          {FACTS.map((fact) => (
            <div key={fact.value} className="flex-1 px-6 py-4 sm:py-1">
              <dt className="font-display text-2xl font-bold tracking-tight">
                {fact.value}
              </dt>
              <dd className="mt-1 text-sm text-muted-foreground">
                {fact.label}
              </dd>
            </div>
          ))}
        </motion.dl>
      </div>

      {/* The product is the picture. */}
      <div className="relative mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <div
          className="pointer-events-none absolute inset-x-0 top-8 bottom-0 -z-10 rounded-[48px] opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, oklch(0.55 0.22 277 / 0.55), transparent 68%)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 48, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <DashboardMockup />
        </motion.div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Aperçu du dashboard affilié — les chiffres affichés sont un exemple.
        </p>
      </div>
    </section>
  );
}
