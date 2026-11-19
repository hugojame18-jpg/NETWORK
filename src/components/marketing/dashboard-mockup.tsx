"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Gift,
  GraduationCap,
  LayoutDashboard,
  Target,
  Wallet,
} from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";

/* Illustrative figures, kept modest and internally consistent: nine
   conversions at 15 $ is the 135 $ shown for the day, and the balance bar is
   165 of 250. The caption under the mock-up says they are an example. */
const BARS = [42, 58, 49, 66, 54, 71, 63, 80, 69, 88, 76, 94, 83, 52];

const MENU = [
  { label: "Accueil", icon: LayoutDashboard, active: true },
  { label: "Statistiques", icon: BarChart3 },
  { label: "Conversions", icon: Target },
  { label: "Formation", icon: GraduationCap },
  { label: "Récompenses", icon: Gift },
  { label: "Paiements", icon: Wallet },
];

const FEED = [
  { label: "FR · CC Submit", when: "il y a 4 min" },
  { label: "BE · CC Submit", when: "il y a 22 min" },
  { label: "MultiGeo · CC Submit", when: "il y a 1 h" },
];

/**
 * The product, in miniature.
 *
 * Drawn light on the dark page because the real dashboard is light — the
 * earlier mock-up was a dark panel with another domain in its address bar and
 * a menu that no longer exists. Every block here is one an affiliate finds
 * after signing up, in the place they find it: the balance and how far the
 * next payout is, the day's figures, gains per day, the latest conversions.
 */
export function DashboardMockup() {
  return (
    <div className="theme-light relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-background text-foreground shadow-[0_40px_120px_-20px_rgb(0_0_0/0.7)]">
      {/* Window bar */}
      <div className="flex items-center gap-1.5 border-b border-border bg-card px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
        <span className="mx-auto rounded-md bg-muted px-3 py-0.5 text-[11px] text-muted-foreground">
          revnetwork.live/dashboard
        </span>
      </div>

      <div className="grid text-left md:grid-cols-[176px_1fr]">
        {/* Sidebar */}
        <div className="hidden flex-col gap-0.5 border-r border-border bg-card p-3 md:flex">
          <div className="mb-3 flex items-center gap-2 px-1">
            <LogoMark className="h-7 w-7 rounded-lg [&_svg]:h-4 [&_svg]:w-4" />
            <span className="text-[13px] font-semibold">RevNetwork</span>
          </div>
          {MENU.map((item) => (
            <div
              key={item.label}
              className={
                item.active
                  ? "flex items-center gap-2 rounded-md bg-accent px-2 py-1.5 text-[12px] font-medium"
                  : "flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] text-muted-foreground"
              }
            >
              <item.icon
                className={
                  item.active ? "h-3.5 w-3.5 text-primary" : "h-3.5 w-3.5"
                }
              />
              {item.label}
            </div>
          ))}
        </div>

        {/* Page */}
        <div className="space-y-3 p-4 sm:p-5">
          <div>
            <p className="text-[15px] font-semibold tracking-tight">Salut Léa</p>
            <p className="text-[11px] text-muted-foreground">
              Voici où tu en es.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="surface-brand p-4 sm:col-span-1">
              <p className="text-[9px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Solde à recevoir
              </p>
              <p className="num mt-2 text-[26px] leading-none font-semibold">
                165
                <span className="text-[0.6em] font-medium opacity-55">
                  ,00&nbsp;$
                </span>
              </p>
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "66%" }}
                  transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">
                Encore 85,00 $ avant ton prochain retrait.
              </p>
            </div>

            <div className="surface p-4">
              <p className="text-[9px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Aujourd&apos;hui
              </p>
              <p className="num mt-2 text-[22px] leading-none font-semibold">
                135
                <span className="text-[0.6em] font-medium opacity-55">
                  ,00&nbsp;$
                </span>
              </p>
              <p className="mt-2 text-[10px] text-muted-foreground">
                9 conversions · 1 204 clics
              </p>
            </div>

            <div className="surface p-4">
              <p className="text-[9px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                7 derniers jours
              </p>
              <p className="num mt-2 text-[22px] leading-none font-semibold">
                780
                <span className="text-[0.6em] font-medium opacity-55">
                  ,00&nbsp;$
                </span>
              </p>
              <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-success/12 px-1.5 py-0.5 text-[10px] font-medium text-success">
                ↗ 12,4 %
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-5">
            <div className="surface p-4 sm:col-span-3">
              <p className="text-[12px] font-semibold">Tes gains par jour</p>
              <div className="mt-4 flex h-24 items-end gap-1.5 sm:h-28">
                {BARS.map((height, index) => (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{
                      delay: 0.5 + index * 0.035,
                      duration: 0.55,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={
                      index === BARS.length - 1
                        ? "flex-1 rounded-t-[3px] bg-primary/45"
                        : "flex-1 rounded-t-[3px] bg-primary"
                    }
                  />
                ))}
              </div>
            </div>

            <div className="surface sm:col-span-2">
              <p className="px-4 pt-4 text-[12px] font-semibold">
                Dernières conversions
              </p>
              <ul className="mt-2 divide-y divide-border">
                {FEED.map((item, index) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.15, duration: 0.4 }}
                    className="flex items-center gap-2 px-4 py-2"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-medium">
                        {item.label}
                      </span>
                      <span className="block text-[9.5px] text-muted-foreground">
                        {item.when}
                      </span>
                    </span>
                    <span className="num text-[11px] font-semibold">
                      +15,00 $
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
