/**
 * Loyalty program: performance tiers, payout bonuses and milestone badges.
 *
 * This module is intentionally pure (no DB, no Node-only APIs) so it can be
 * shared by server data-loaders and client components alike. The numbers that
 * feed it come from `PublisherDailyStat` — the admin-entered figures that are
 * the single source of truth for every publisher-facing metric.
 */

export type TierKey = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export interface Tier {
  key: TierKey;
  label: string;
  /** Minimum lifetime revenue (USD) required to reach this tier. */
  minRevenue: number;
  /** Payout bonus granted at this tier, as a fraction (0.05 = +5%). */
  bonusRate: number;
  /** Tailwind gradient classes for the tier medallion. */
  gradient: string;
  /** Accent colour token used for rings/text. */
  accent: string;
}

/**
 * Tiers are based on *lifetime* revenue and never demote — a permanent,
 * earned status is far more motivating than one that can be lost. Ordered
 * ascending; keep the first tier at minRevenue 0 so everyone has a tier.
 */
export const TIERS: Tier[] = [
  { key: "BRONZE", label: "Bronze", minRevenue: 0, bonusRate: 0, gradient: "from-amber-600 to-amber-800", accent: "text-amber-600" },
  { key: "SILVER", label: "Argent", minRevenue: 1_000, bonusRate: 0.03, gradient: "from-slate-300 to-slate-500", accent: "text-slate-400" },
  { key: "GOLD", label: "Or", minRevenue: 5_000, bonusRate: 0.05, gradient: "from-amber-300 to-amber-500", accent: "text-amber-500" },
  { key: "PLATINUM", label: "Platine", minRevenue: 20_000, bonusRate: 0.08, gradient: "from-sky-300 to-indigo-500", accent: "text-sky-400" },
];

/** Referral reward: share of a referred affiliate's lifetime revenue. */
export const REFERRAL_RATE = 0.05;

export interface TierProgress {
  current: Tier;
  next: Tier | null;
  /** 0–100 progress from the current tier's floor to the next tier's floor. */
  progress: number;
  /** Revenue still needed to reach the next tier (0 when maxed). */
  remaining: number;
}

export function resolveTier(lifetimeRevenue: number): TierProgress {
  let currentIndex = 0;
  for (let i = 0; i < TIERS.length; i++) {
    if (lifetimeRevenue >= TIERS[i].minRevenue) currentIndex = i;
  }
  const current = TIERS[currentIndex];
  const next = TIERS[currentIndex + 1] ?? null;

  if (!next) return { current, next: null, progress: 100, remaining: 0 };

  const span = next.minRevenue - current.minRevenue;
  const done = lifetimeRevenue - current.minRevenue;
  const progress = Math.max(0, Math.min(100, (done / span) * 100));
  return { current, next, progress, remaining: Math.max(0, next.minRevenue - lifetimeRevenue) };
}

export type BadgeMetric = "conversions" | "revenue" | "referrals";

export interface Badge {
  key: string;
  label: string;
  description: string;
  /** Icon key resolved to a lucide icon in the client component. */
  icon: string;
  metric: BadgeMetric;
  target: number;
  achieved: boolean;
  /** Current value of the underlying metric. */
  current: number;
  /** 0–100 progress toward `target`. */
  progress: number;
}

interface BadgeSpec {
  key: string;
  label: string;
  description: string;
  icon: string;
  metric: BadgeMetric;
  target: number;
}

const BADGE_SPECS: BadgeSpec[] = [
  { key: "first-conversion", label: "Première conversion", description: "Votre toute première conversion", icon: "zap", metric: "conversions", target: 1 },
  { key: "centurion", label: "Centurion", description: "100 conversions cumulées", icon: "target", metric: "conversions", target: 100 },
  { key: "closer", label: "Closer", description: "500 conversions cumulées", icon: "flame", metric: "conversions", target: 500 },
  { key: "legend", label: "Légende", description: "1 000 conversions cumulées", icon: "trophy", metric: "conversions", target: 1_000 },
  { key: "first-k", label: "Premier millier", description: "1 000 $ de revenus générés", icon: "dollar-sign", metric: "revenue", target: 1_000 },
  { key: "high-roller", label: "High roller", description: "10 000 $ de revenus générés", icon: "gem", metric: "revenue", target: 10_000 },
  { key: "whale", label: "Whale", description: "50 000 $ de revenus générés", icon: "crown", metric: "revenue", target: 50_000 },
  { key: "first-referral", label: "Premier filleul", description: "Parrainez votre 1er affilié", icon: "user-plus", metric: "referrals", target: 1 },
  { key: "connector", label: "Connecteur", description: "5 filleuls parrainés", icon: "users", metric: "referrals", target: 5 },
  { key: "ambassador", label: "Ambassadeur", description: "10 filleuls parrainés", icon: "medal", metric: "referrals", target: 10 },
];

export function computeBadges(stats: { conversions: number; revenue: number; referrals: number }): Badge[] {
  return BADGE_SPECS.map((spec) => {
    const current = stats[spec.metric];
    const achieved = current >= spec.target;
    return {
      ...spec,
      current,
      achieved,
      progress: Math.max(0, Math.min(100, (current / spec.target) * 100)),
    };
  });
}
