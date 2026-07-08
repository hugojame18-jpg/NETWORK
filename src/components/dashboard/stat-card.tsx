"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "@/components/marketing/animated-counter";

interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** A pre-rendered icon element, e.g. `<Wallet className="h-4 w-4" />` — not the component reference. */
  icon: ReactNode;
  delta?: number;
  index?: number;
}

export function StatCard({ label, value, prefix, suffix, decimals = 0, icon, delta, index = 0 }: StatCardProps) {
  const isPositive = (delta ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="hover-lift shadow-premium rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary [&_svg]:h-4 [&_svg]:w-4">
          {icon}
        </div>
        {delta !== undefined && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              isPositive ? "text-success" : "text-destructive",
            )}
          >
            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight">
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} decimals={decimals} immediate />
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );
}
