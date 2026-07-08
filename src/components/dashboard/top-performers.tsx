"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Award, Flame } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/data/publisher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/format";

interface TopPerformersProps {
  periodLabel: string;
  top: LeaderboardEntry[];
  /** Present only when the current publisher ranks outside `top`. */
  me: LeaderboardEntry | null;
  totalRanked: number;
}

const RANK_STYLES: Record<number, { ring: string; badge: string; icon: React.ReactNode }> = {
  1: {
    ring: "ring-amber-400/40",
    badge: "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950",
    icon: <Trophy className="h-3.5 w-3.5" />,
  },
  2: {
    ring: "ring-slate-300/40",
    badge: "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900",
    icon: <Medal className="h-3.5 w-3.5" />,
  },
  3: {
    ring: "ring-orange-400/40",
    badge: "bg-gradient-to-br from-orange-300 to-orange-600 text-orange-950",
    icon: <Award className="h-3.5 w-3.5" />,
  },
};

function RankBadge({ rank }: { rank: number }) {
  const style = RANK_STYLES[rank];
  if (style) {
    return (
      <span className={cn("flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-sm", style.badge)}>
        {style.icon}
      </span>
    );
  }
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
      {rank}
    </span>
  );
}

function Row({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  const style = RANK_STYLES[entry.rank];
  return (
    <motion.li
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: 0.05 + index * 0.05 }}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
        entry.isCurrent
          ? "border-primary/50 bg-primary/5 ring-1 ring-primary/30"
          : "border-transparent hover:bg-muted/50",
        style && "ring-1",
        style?.ring,
      )}
    >
      <RankBadge rank={entry.rank} />
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-medium", entry.isCurrent && "text-primary")}>
          {entry.displayName}
          {entry.isCurrent && (
            <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              vous
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">{formatCurrency(entry.revenue)} générés</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold tabular-nums">{formatNumber(entry.conversions)}</p>
        <p className="text-[11px] text-muted-foreground">conversions</p>
      </div>
    </motion.li>
  );
}

/**
 * Motivational "top performers" leaderboard shown on the publisher overview.
 * Ranks affiliates by conversions for the current month; the current publisher
 * is highlighted, and pinned at the bottom with their real rank when they fall
 * outside the visible top slice.
 */
export function TopPerformers({ periodLabel, top, me, totalRanked }: TopPerformersProps) {
  return (
    <Card className="shadow-premium">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/15 text-amber-500">
              <Trophy className="h-4 w-4" />
            </span>
            Top performers
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground capitalize">{periodLabel}</p>
        </div>
        {top.length > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-500">
            <Flame className="h-3.5 w-3.5" />
            {formatNumber(totalRanked)} en lice
          </span>
        )}
      </CardHeader>
      <CardContent>
        {top.length === 0 ? (
          <div className="py-10 text-center">
            <Trophy className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium">Le classement du mois est encore vierge</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Générez vos premières conversions ce mois-ci pour apparaître ici.
            </p>
          </div>
        ) : (
          <>
            <ul className="space-y-1.5">
              {top.map((entry, index) => (
                <Row key={entry.publisherId} entry={entry} index={index} />
              ))}
            </ul>
            {me && (
              <>
                <div className="my-2 flex items-center gap-2 px-2 text-muted-foreground/50">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-[10px]">•••</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <ul>
                  <Row entry={me} index={0} />
                </ul>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
