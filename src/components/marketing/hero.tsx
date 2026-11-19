"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { MascotPeek } from "@/components/brand/mascot";
import { MIN_PAYOUT_USD, dollars } from "@/lib/public-terms";

const PROOFS = [
  "Inscription gratuite",
  "Dashboard ouvert tout de suite",
  "Une équipe sur Telegram",
];

/* Illustrative figures, internally consistent: nine conversions at 15 $ is
   the 135 $ of the day, and the balance bar is 165 of 250. The caption under
   the panel says they are an example. */
const FEED = [
  { geo: "FR", when: "à l'instant", fresh: true },
  { geo: "BE", when: "il y a 6 min" },
  { geo: "CH", when: "il y a 19 min" },
  { geo: "BE", when: "il y a 41 min" },
  { geo: "FR", when: "il y a 1 h" },
];

const rise = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

/**
 * What the network looks like from the inside, in one panel: conversions
 * arriving one by one, the balance they add up to, and the distance to the
 * next withdrawal. It stands where a stock illustration would — the product
 * is the picture.
 */
function LivePanel() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div
        className="pointer-events-none absolute -inset-10 -z-10 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.55 0.22 277 / 0.55), transparent 75%)",
        }}
      />

      {/* The mascot, looking over the edge of the panel it watches. */}
      <MascotPeek
        delay={1}
        className="absolute right-12 bottom-full z-10 w-32 sm:w-40"
      />

      <div className="relative rounded-[28px] border border-white/10 bg-white/[0.04] p-2 shadow-[0_40px_120px_-30px_rgb(0_0_0/0.9)] backdrop-blur">
        <div className="overflow-hidden rounded-[22px] border border-white/8 bg-[oklch(0.185_0.018_274)]">
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
            <p className="flex items-center gap-2.5 text-sm font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
              </span>
              Conversions en direct
            </p>
            <p className="text-xs text-muted-foreground">Aujourd&apos;hui</p>
          </div>

          <ul>
            {FEED.map((row, index) => (
              <motion.li
                key={row.geo + row.when}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.12 }}
                className="flex items-center gap-3.5 border-b border-white/6 px-5 py-3.5 last:border-b-0"
              >
                <span className="font-display flex h-9 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-xs font-bold tracking-wide">
                  {row.geo}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">CC Submit</span>
                  <span className="block text-xs text-muted-foreground">
                    Validée · {row.when}
                  </span>
                </span>
                <span
                  className={
                    row.fresh
                      ? "num text-sm font-semibold text-signal"
                      : "num text-sm font-semibold"
                  }
                >
                  +15,00&nbsp;$
                </span>
              </motion.li>
            ))}
          </ul>

          <div className="grid grid-cols-2 border-t border-white/8 bg-white/[0.025]">
            <div className="border-r border-white/8 px-5 py-4">
              <p className="text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                Conversions
              </p>
              <p className="font-display mt-1 text-2xl font-bold">9</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                Gains du jour
              </p>
              <p className="font-display mt-1 text-2xl font-bold">
                135,00&nbsp;$
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* The balance, overlapping the panel: what the feed adds up to. */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-4 -mt-5 rounded-2xl border border-white/12 bg-[oklch(0.23_0.03_275)] p-4 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.9)] sm:absolute sm:-bottom-[7.5rem] sm:-left-12 sm:mx-0 sm:mt-0 sm:w-64"
      >
        <p className="text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          Solde à recevoir
        </p>
        <p className="font-display mt-1 text-3xl font-bold">165,00&nbsp;$</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "66%" }}
            transition={{ duration: 1.1, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="brand-fill h-full rounded-full"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Retrait dès {dollars(MIN_PAYOUT_USD)}
        </p>
      </motion.div>
    </div>
  );
}

/**
 * The first screen.
 *
 * Laid out the way an affiliate network presents itself: what it is and what
 * to do on the left, the proof — conversions landing — on the right. The
 * headline says the two halves of the deal and nothing else.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden pt-14 pb-24 sm:pt-24 lg:pb-32">
      <div className="landing-grid pointer-events-none absolute inset-0 -z-10" />
      <div
        className="pointer-events-none absolute -top-48 left-[12%] -z-10 h-[620px] w-[900px] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.55 0.22 277), transparent 72%)",
        }}
      />

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
        <div>
          <motion.p
            {...rise}
            transition={{ duration: 0.5 }}
            className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pr-4 pl-3 text-[13px] font-medium text-foreground/80"
          >
            <span className="h-2 w-2 rounded-full bg-signal" />
            Réseau d&apos;affiliation · CC Submit
          </motion.p>

          <motion.h1
            {...rise}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="display text-[clamp(2.6rem,5.1vw,4.6rem)]"
          >
            Envoie ton trafic.
            <br />
            <span className="text-signal">Encaisse chaque conversion.</span>
          </motion.h1>

          <motion.p
            {...rise}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            Des offres CC Submit par pays, un lien de tracking à ton nom, tes
            conversions en direct dans ton dashboard et un paiement à la
            demande dès {dollars(MIN_PAYOUT_USD)}.
          </motion.p>

          <motion.div
            {...rise}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href="/sign-up"
              className="glow-signal brand-fill group inline-flex h-13 items-center justify-center gap-2 rounded-full px-8 text-[15px] font-semibold transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Devenir affilié
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#offers"
              className="inline-flex h-13 items-center justify-center rounded-full border border-white/14 px-8 text-[15px] font-medium text-foreground/90 transition-colors hover:border-white/30 hover:bg-white/[0.04]"
            >
              Voir les offres
            </a>
          </motion.div>

          <motion.ul
            {...rise}
            transition={{ duration: 0.6, delay: 0.26 }}
            className="mt-9 flex flex-col gap-x-7 gap-y-2.5 text-sm text-foreground/75 sm:flex-row sm:flex-wrap"
          >
            {PROOFS.map((proof) => (
              <li key={proof} className="flex items-center gap-2">
                <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-signal/18 text-signal">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {proof}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 36, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="lg:pl-10"
        >
          <LivePanel />
          <p className="mt-8 text-center text-xs text-muted-foreground sm:mt-36 lg:text-right">
            Aperçu du dashboard — les chiffres affichés sont un exemple.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
