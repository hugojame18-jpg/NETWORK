"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight, TrendingUp, Users, MousePointerClick, Wallet } from "lucide-react";

const BARS = [38, 52, 44, 61, 58, 70, 64, 78, 72, 88, 82, 95];

const STATS = [
  { label: "Revenus aujourd'hui", value: "1 284 $", delta: "+12,4%", icon: Wallet },
  { label: "Clics", value: "8 942", delta: "+4,1%", icon: MousePointerClick },
  { label: "Conversions", value: "312", delta: "+8,7%", icon: TrendingUp },
  { label: "Nouveaux publishers", value: "24", delta: "+2", icon: Users },
];

export function DashboardMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 150, damping: 20 });
  const transform = useMotionTemplate`perspective(1200px) rotateX(${springX}deg) rotateY(${springY}deg)`;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 8);
    rotateX.set(py * -8);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      style={{ transform }}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="glass-strong shadow-premium relative mx-auto w-full max-w-4xl rounded-2xl p-2"
    >
      <div className="flex items-center gap-1.5 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
        <span className="ml-3 text-xs text-muted-foreground">app.revnetwork.io/dashboard</span>
      </div>

      <div className="grid grid-cols-[180px_1fr] gap-3 rounded-xl bg-background/60 p-3">
        <div className="hidden flex-col gap-2 rounded-lg border border-border/60 bg-card/60 p-3 sm:flex">
          <div className="mb-2 flex items-center gap-2">
            <span className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold">
              R
            </span>
            <span className="text-xs font-medium">RevNetwork</span>
          </div>
          {["Overview", "Offres", "Liens", "Paiements", "Profil"].map((item, i) => (
            <div
              key={item}
              className={cnItem(i === 0)}
            >
              {item}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08, duration: 0.5 }}
                className="hover-lift rounded-lg border border-border/60 bg-card/80 p-3"
              >
                <div className="flex items-center justify-between">
                  <stat.icon className="h-3.5 w-3.5 text-primary" />
                  <span className="flex items-center gap-0.5 text-[10px] font-medium text-success">
                    {stat.delta}
                    <ArrowUpRight className="h-2.5 w-2.5" />
                  </span>
                </div>
                <p className="mt-2 text-base font-semibold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="rounded-lg border border-border/60 bg-card/80 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium">Revenus des 12 dernières semaines</p>
              <span className="text-[10px] text-muted-foreground">USD</span>
            </div>
            <div className="flex h-28 items-end gap-1.5">
              {BARS.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.6 + i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 rounded-t-sm bg-gradient-to-t from-primary/40 to-primary"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function cnItem(active: boolean) {
  return [
    "rounded-md px-2 py-1.5 text-[11px]",
    active ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground",
  ].join(" ");
}
