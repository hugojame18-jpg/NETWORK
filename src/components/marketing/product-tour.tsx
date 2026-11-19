"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DashboardMockup } from "./dashboard-mockup";

/**
 * Tracking, shown rather than listed.
 *
 * The dashboard an affiliate opens after signing up, drawn whole, then three
 * of its pieces drawn close: will I see my conversions, will I know what I'm
 * owed, can I follow my days. The figures are examples and the section says
 * so.
 */

const FEED = [
  { label: "FR · CC Submit", when: "à l'instant", fresh: true },
  { label: "BE · CC Submit", when: "il y a 12 min" },
  { label: "MultiGeo · CC Submit", when: "il y a 40 min" },
  { label: "FR · CC Submit", when: "il y a 1 h" },
];

const BARS = [34, 52, 41, 63, 48, 72, 58, 81, 66, 90, 74, 96];

function Card({
  title,
  body,
  className,
  children,
  index,
}: {
  title: string;
  body: string;
  className?: string;
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className={cn(
        "flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]",
        className,
      )}
    >
      <div className="p-7 pb-0">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {body}
        </p>
      </div>
      <div className="mt-auto p-7 pt-6">{children}</div>
    </motion.article>
  );
}

export function ProductTour() {
  return (
    <section id="tracking" className="relative border-t border-white/8 py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-foreground/70 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden />
            Tracking
          </p>
          <h2 className="display text-4xl sm:text-5xl">
            Chaque conversion suivie, de ton lien à ton solde
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Pas de fichier à attendre en fin de mois, pas de chiffre à
            demander. Tout ce que ton trafic fait est sous tes yeux, depuis
            ton téléphone comme depuis ton ordinateur.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-14"
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-10 bottom-0 -z-10 rounded-[48px] opacity-60 blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, oklch(0.55 0.22 277 / 0.5), transparent 68%)",
            }}
          />
          <DashboardMockup />
        </motion.div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <Card
            index={0}
            title="Chaque conversion, dès qu'elle tombe"
            body="Une conversion validée par l'annonceur apparaît aussitôt, une ligne chacune, avec le pays et ce qu'elle te rapporte."
          >
            <ul className="divide-y divide-white/8 rounded-2xl border border-white/10 bg-black/20">
              {FEED.map((item) => (
                <li key={item.label + item.when} className="flex items-center gap-3 px-4 py-3">
                  <span className="relative flex h-2 w-2 shrink-0">
                    {item.fresh && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
                    )}
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {item.label}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {item.when}
                    </span>
                  </span>
                  <span className="num text-sm font-semibold">+15,00 $</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card
            index={1}
            title="Ton solde, et ce qu'il manque"
            body="Ce qui t'est dû, à jour à chaque conversion, et la distance exacte jusqu'à ton prochain retrait."
          >
            <div className="rounded-2xl border border-primary/25 bg-[radial-gradient(120%_140%_at_0%_0%,color-mix(in_srgb,var(--primary)_14%,transparent),transparent_60%)] p-5">
              <p className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Solde à recevoir
              </p>
              <p className="num mt-2 text-4xl leading-none font-semibold">
                165
                <span className="text-[0.55em] font-medium opacity-55">
                  ,00&nbsp;$
                </span>
              </p>
              <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "66%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
              <p className="mt-2.5 text-xs text-muted-foreground">
                Encore 85,00 $ avant ton prochain retrait.
              </p>
            </div>
          </Card>

          <Card
            index={2}
            title="Tes journées, une par une"
            body="Clics, conversions, taux et gains, jour par jour et sur la période que tu veux."
          >
            <div className="flex h-36 items-end gap-2 rounded-2xl border border-white/10 bg-black/20 p-4">
              {BARS.map((height, index) => (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${height}%` }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.2 + index * 0.04,
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex-1 rounded-t-[4px] bg-primary"
                />
              ))}
            </div>
          </Card>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Les chiffres affichés sont des exemples.
        </p>
      </div>
    </section>
  );
}
