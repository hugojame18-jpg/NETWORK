"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Copy,
  Crown,
  Gem,
  DollarSign,
  Flame,
  Gift,
  Medal,
  Target,
  Trophy,
  UserPlus,
  Users,
  Zap,
  Lock,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { Badge as BadgeData, TierProgress } from "@/lib/loyalty";
import type { ReferredAffiliate } from "@/lib/data/publisher";
import { REFERRAL_RATE } from "@/lib/loyalty";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";

const BADGE_ICONS: Record<string, LucideIcon> = {
  zap: Zap,
  target: Target,
  flame: Flame,
  trophy: Trophy,
  "dollar-sign": DollarSign,
  gem: Gem,
  crown: Crown,
  "user-plus": UserPlus,
  users: Users,
  medal: Medal,
};

export interface RewardsPanelProps {
  appUrl: string;
  tier: TierProgress;
  lifetimeRevenue: number;
  bonusLifetime: number;
  bonusThisMonth: number;
  badges: BadgeData[];
  referralCode: string;
  referrals: ReferredAffiliate[];
  referralCount: number;
  referralEarnings: number;
}

function TierMedallion({ gradient, label }: { gradient: string; label: string }) {
  return (
    <div className="relative">
      <div className={cn("flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg", gradient)}>
        <Crown className="h-8 w-8 text-white/90 drop-shadow" />
      </div>
      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-background px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide shadow">
        {label}
      </span>
    </div>
  );
}

function TierCard({ tier, bonusLifetime, bonusThisMonth }: Pick<RewardsPanelProps, "tier" | "bonusLifetime" | "bonusThisMonth">) {
  const { current, next, progress, remaining } = tier;
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="shadow-premium overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <TierMedallion gradient={current.gradient} label={current.label} />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Votre palier</p>
              <p className={cn("text-2xl font-bold", current.accent)}>{current.label}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Bonus de payout&nbsp;
                <span className="font-semibold text-foreground">+{(current.bonusRate * 100).toFixed(0)}%</span>
              </p>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-xs text-muted-foreground">Bonus cumulé</p>
              <p className="text-xl font-semibold text-success">{formatCurrency(bonusLifetime)}</p>
              <p className="text-xs text-muted-foreground">dont {formatCurrency(bonusThisMonth)} ce mois</p>
            </div>
          </div>

          {next ? (
            <div className="mt-6">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Prochain palier&nbsp;: <span className="font-medium text-foreground">{next.label}</span> (+
                  {(next.bonusRate * 100).toFixed(0)}%)
                </span>
                <span className="font-medium">{formatCurrency(remaining)} restants</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ) : (
            <div className="mt-6 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              Palier maximum atteint — vous êtes au sommet du réseau.
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function BadgeTile({ badge, index }: { badge: BadgeData; index: number }) {
  const Icon = BADGE_ICONS[badge.icon] ?? Trophy;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={cn(
        "hover-lift relative flex flex-col items-center rounded-xl border p-4 text-center",
        badge.achieved ? "border-primary/40 bg-primary/5" : "border-border bg-card",
      )}
      title={badge.description}
    >
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full",
          badge.achieved ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
        )}
      >
        {badge.achieved ? <Icon className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
      </div>
      <p className="mt-2 text-xs font-semibold leading-tight">{badge.label}</p>
      {badge.achieved ? (
        <span className="mt-1 flex items-center gap-0.5 text-[10px] font-medium text-success">
          <Check className="h-3 w-3" /> Obtenu
        </span>
      ) : (
        <span className="mt-1 text-[10px] text-muted-foreground">
          {formatNumber(badge.current)}/{formatNumber(badge.target)}
        </span>
      )}
    </motion.div>
  );
}

function ReferralCard({
  appUrl,
  referralCode,
  referrals,
  referralCount,
  referralEarnings,
}: Pick<RewardsPanelProps, "appUrl" | "referralCode" | "referrals" | "referralCount" | "referralEarnings">) {
  const [copied, setCopied] = useState(false);
  const link = `${appUrl}/sign-up?ref=${referralCode}`;

  async function copy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Card className="shadow-premium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Gift className="h-4 w-4" />
          </span>
          Parrainage
        </CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Gagnez {(REFERRAL_RATE * 100).toFixed(0)}% des revenus de chaque affilié que vous parrainez, à vie.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Filleuls</p>
            <p className="text-xl font-semibold">{formatNumber(referralCount)}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Gains de parrainage</p>
            <p className="text-xl font-semibold text-success">{formatCurrency(referralEarnings)}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Votre code</p>
            <p className="text-xl font-semibold tracking-widest">{referralCode}</p>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Votre lien de parrainage</p>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-muted px-3 py-2 text-xs">{link}</code>
            <Button size="sm" variant="outline" onClick={copy}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copié" : "Copier"}
            </Button>
          </div>
        </div>

        {referrals.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filleul</TableHead>
                  <TableHead>Inscrit le</TableHead>
                  <TableHead className="text-right">Conversions</TableHead>
                  <TableHead className="text-right">Votre gain</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((ref, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{ref.displayName}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(ref.joinedAt)}</TableCell>
                    <TableCell className="text-right">{formatNumber(ref.conversions)}</TableCell>
                    <TableCell className="text-right font-medium text-success">{formatCurrency(ref.reward)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border py-8 text-center">
            <Users className="mx-auto h-7 w-7 text-muted-foreground/40" />
            <p className="mt-2 text-sm font-medium">Aucun filleul pour l&apos;instant</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Partagez votre lien pour recruter des affiliés et toucher des commissions récurrentes.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Rewards page: performance tier, milestone badges and the referral program. */
export function RewardsPanel(props: RewardsPanelProps) {
  const unlocked = props.badges.filter((b) => b.achieved).length;
  return (
    <div className="space-y-6">
      <TierCard tier={props.tier} bonusLifetime={props.bonusLifetime} bonusThisMonth={props.bonusThisMonth} />

      <Card className="shadow-premium">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/15 text-amber-500">
              <Trophy className="h-4 w-4" />
            </span>
            Badges
          </CardTitle>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {unlocked}/{props.badges.length} débloqués
          </span>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {props.badges.map((badge, i) => (
              <BadgeTile key={badge.key} badge={badge} index={i} />
            ))}
          </div>
        </CardContent>
      </Card>

      <ReferralCard
        appUrl={props.appUrl}
        referralCode={props.referralCode}
        referrals={props.referrals}
        referralCount={props.referralCount}
        referralEarnings={props.referralEarnings}
      />
    </div>
  );
}
