"use client";

import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * What an affiliate actually gets, shown rather than listed.
 *
 * This replaces a block of adjectives set at an angle. Four cards, each a
 * piece of the real dashboard drawn small, each answering one question a
 * visitor has before signing up: will I see my sales, will I know what I'm
 * owed, can I follow my days, is there more to earn. The figures are examples
 * and the section says so.
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
        "flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.10)]",
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
    <section
      id="why"
      className="theme-light bg-background py-28 text-foreground"
    >
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            Ton dashboard
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Tu sais toujours où tu en es
          </h2>
          <p className="mt-4 text-muted-foreground">
            Pas de fichier à attendre en fin de mois, pas de chiffre à
            demander. Tout ce que ton trafic fait est sous tes yeux, depuis
            ton téléphone comme depuis ton ordinateur.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          <Card
            index={0}
            className="lg:col-span-2"
            title="Chaque conversion, dès qu'elle tombe"
            body="Une conversion validée par l'annonceur apparaît aussitôt, une ligne chacune, avec le pays et ce qu'elle te rapporte."
          >
            <ul className="divide-y divide-border rounded-2xl border border-border bg-background">
              {FEED.map((item) => (
                <li key={item.label + item.when} className="flex items-center gap-3 px-4 py-3">
                  <span className="relative flex h-2 w-2 shrink-0">
                    {item.fresh && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                    )}
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
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
            <div className="flex h-36 items-end gap-2 rounded-2xl border border-border bg-background p-4">
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

          <Card
            index={3}
            className="lg:col-span-2"
            title="Un lien de parrainage qui travaille pour toi"
            body="Chaque affilié qui s'inscrit avec ton lien te rapporte 10 % du chiffre d'affaires qu'il génère, aussi longtemps qu'il tourne."
          >
            <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  Ton lien
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-card px-3 py-2 font-mono text-xs">
                    revnetwork.live/sign-up?ref=TONCODE
                  </code>
                  <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium">
                    <Copy className="h-3.5 w-3.5" />
                    Copier
                  </span>
                </div>
              </div>
              <ul className="space-y-2.5 rounded-2xl border border-border bg-background p-4 text-sm">
                {["Ton code dès l'inscription", "Tes filleuls et leurs gains suivis", "Versé avec ton solde"].map(
                  (line) => (
                    <li key={line} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      <span className="text-muted-foreground">{line}</span>
                    </li>
                  ),
                )}
              </ul>
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
