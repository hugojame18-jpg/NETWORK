import "server-only";
import { randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/format";
import { REFERRAL_RATE, computeBadges, resolveTier, type Badge, type TierProgress } from "@/lib/loyalty";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Publisher-facing numbers are read exclusively from `PublisherDailyStat`
 * (manually entered by the admin every night) — never computed from the
 * Click/Lead/Conversion/Commission tracking tables. Those tables still exist
 * and still record real tracking data, but they are not the source of truth
 * shown to publishers. See src/app/api/admin/daily-stats for how rows get in.
 */
export interface DailyStatPoint {
  date: string;
  clicks: number;
  hosts: number;
  conversions: number;
  revenue: number;
  [key: string]: string | number;
}

/** Zero the time-of-day of a Date using its UTC calendar fields. Used to
 *  normalize values that are already anchored in UTC (e.g. a "YYYY-MM-DD"
 *  parsed as UTC midnight). */
function toUtcMidnight(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * The operator's current calendar day, pinned to UTC midnight — the exact
 * representation used as the key for `@db.Date` rows.
 *
 * `@db.Date` stores a plain calendar date; the admin enters it from a local
 * date-picker (e.g. "07/07/2026"), and it lands in the DB as `2026-07-07`,
 * which Prisma reads back as `2026-07-07T00:00:00Z`. So "today" must mean the
 * calendar day on the operator's wall clock — NOT the UTC day. Reading the
 * LOCAL fields (getFullYear/Month/Date) and re-pinning to UTC midnight gives
 * that. Using UTC fields instead would make "today" flip to the previous day
 * between local midnight and the UTC offset (e.g. 00:00–02:00 in Paris).
 *
 * In containers (which default to UTC) set the `TZ` env to the operator's zone
 * so the server wall clock matches — see docker-compose.yml.
 */
function startOfTodayLocalAsUtc(now = new Date()): Date {
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

/** The UTC calendar-day key ("YYYY-MM-DD") of a stored stat date. */
function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * `@db.Date` columns hold a calendar day with no time component, so an exact
 * `date: someDate` match is fragile — it only works if `someDate` carries
 * exactly zero time-of-day in the same representation Prisma serializes with.
 * A half-open `[day, day+1)` range is equivalent for a single day and doesn't
 * depend on that, so every lookup below uses it instead of equality.
 */
function dayRange(day: Date) {
  const start = toUtcMidnight(day);
  const end = new Date(start.getTime() + DAY_MS);
  return { gte: start, lt: end };
}

export async function getPublisherByUserId(userId: string) {
  return prisma.publisher.findUniqueOrThrow({ where: { userId } });
}

export async function getRevenueSummary(publisherId: string) {
  const startToday = startOfTodayLocalAsUtc();
  const startYesterday = new Date(startToday.getTime() - DAY_MS);
  const startMonth = new Date(Date.UTC(startToday.getUTCFullYear(), startToday.getUTCMonth(), 1));
  const startTomorrow = new Date(startToday.getTime() + DAY_MS);

  const [todayAgg, yesterdayAgg, monthAgg, totalAgg] = await Promise.all([
    prisma.publisherDailyStat.aggregate({ where: { publisherId, date: dayRange(startToday) }, _sum: { revenue: true } }),
    prisma.publisherDailyStat.aggregate({ where: { publisherId, date: dayRange(startYesterday) }, _sum: { revenue: true } }),
    prisma.publisherDailyStat.aggregate({
      where: { publisherId, date: { gte: startMonth, lt: startTomorrow } },
      _sum: { revenue: true },
    }),
    prisma.publisherDailyStat.aggregate({ where: { publisherId }, _sum: { revenue: true } }),
  ]);

  return {
    today: toNumber(todayAgg._sum.revenue),
    yesterday: toNumber(yesterdayAgg._sum.revenue),
    month: toNumber(monthAgg._sum.revenue),
    total: toNumber(totalAgg._sum.revenue),
  };
}

/**
 * Buckets clicks/hosts/conversions/revenue per day for the last N days, from
 * admin-entered stats. Everything is computed in UTC — the interval, the
 * bucket keys, and the row keys — so a stored calendar date always lands in
 * the bucket for that exact same calendar date, on any server timezone.
 */
export async function getPerformanceSeries(publisherId: string, days = 90): Promise<DailyStatPoint[]> {
  const today = startOfTodayLocalAsUtc();
  const since = new Date(today.getTime() - (days - 1) * DAY_MS);

  const rows = await prisma.publisherDailyStat.findMany({
    where: { publisherId, date: { gte: since } },
    orderBy: { date: "asc" },
  });

  const buckets = new Map<string, DailyStatPoint>();
  for (let t = since.getTime(); t <= today.getTime(); t += DAY_MS) {
    const key = dayKey(new Date(t));
    buckets.set(key, { date: key, clicks: 0, hosts: 0, conversions: 0, revenue: 0 });
  }

  rows.forEach((row) => {
    const bucket = buckets.get(dayKey(row.date));
    if (bucket) {
      bucket.clicks = row.clicks;
      bucket.hosts = row.hosts;
      bucket.conversions = row.conversions;
      bucket.revenue = toNumber(row.revenue);
    }
  });

  return Array.from(buckets.values());
}

export type StatsPeriodPreset =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_7_days"
  | "last_30_days"
  | "this_month"
  | "last_month"
  | "this_year"
  | "full_year"
  | "custom";

export function resolveStatsPeriod(
  preset: StatsPeriodPreset,
  customFrom?: string,
  customTo?: string,
): { start: Date; end: Date } {
  const now = startOfTodayLocalAsUtc();
  const day = DAY_MS;

  switch (preset) {
    case "today":
      return { start: now, end: now };
    case "yesterday": {
      const y = new Date(now.getTime() - day);
      return { start: y, end: y };
    }
    case "this_week": {
      const dow = (now.getUTCDay() + 6) % 7; // Monday = 0
      return { start: new Date(now.getTime() - dow * day), end: now };
    }
    case "last_7_days":
      return { start: new Date(now.getTime() - 6 * day), end: now };
    case "last_30_days":
      return { start: new Date(now.getTime() - 29 * day), end: now };
    case "this_month":
      return { start: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)), end: now };
    case "last_month": {
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
      const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0));
      return { start, end };
    }
    case "this_year":
      return { start: new Date(Date.UTC(now.getUTCFullYear(), 0, 1)), end: now };
    case "full_year":
      return { start: new Date(Date.UTC(now.getUTCFullYear(), 0, 1)), end: new Date(Date.UTC(now.getUTCFullYear(), 11, 31)) };
    case "custom": {
      const start = customFrom ? toUtcMidnight(new Date(`${customFrom}T00:00:00.000Z`)) : now;
      const end = customTo ? toUtcMidnight(new Date(`${customTo}T00:00:00.000Z`)) : now;
      return { start, end };
    }
  }
}

export async function getStatsForPeriod(publisherId: string, start: Date, end: Date) {
  const [rows, agg] = await Promise.all([
    prisma.publisherDailyStat.findMany({
      where: { publisherId, date: { gte: start, lte: end } },
      orderBy: { date: "asc" },
    }),
    prisma.publisherDailyStat.aggregate({
      where: { publisherId, date: { gte: start, lte: end } },
      _sum: { clicks: true, hosts: true, conversions: true, revenue: true },
    }),
  ]);

  const clicks = agg._sum.clicks ?? 0;
  const conversions = agg._sum.conversions ?? 0;

  return {
    rows,
    totals: {
      clicks,
      hosts: agg._sum.hosts ?? 0,
      conversions,
      revenue: toNumber(agg._sum.revenue),
      conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
    },
  };
}

export interface LeaderboardEntry {
  rank: number;
  publisherId: string;
  displayName: string;
  conversions: number;
  revenue: number;
  clicks: number;
  isCurrent: boolean;
}

export interface Leaderboard {
  periodLabel: string;
  top: LeaderboardEntry[];
  /** The current publisher's entry, only when they rank *outside* `top`. */
  me: LeaderboardEntry | null;
  totalRanked: number;
}

const monthLabelFormatter = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });

/**
 * Masks an affiliate's identity to a first name + last initial ("Marcus D."),
 * so leaderboards and referral lists are motivating without exposing other
 * affiliates' full identities.
 */
function maskAffiliateName(
  publisher: { companyName: string | null; user: { name: string | null; email: string } } | undefined,
): string {
  const base = publisher?.user.name?.trim() || publisher?.companyName?.trim() || publisher?.user.email.split("@")[0] || "Affilié";
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2 && parts[1][0]) return `${parts[0]} ${parts[1][0].toUpperCase()}.`;
  return parts[0] ?? "Affilié";
}

function leaderboardName(
  publisher: { companyName: string | null; user: { name: string | null; email: string } } | undefined,
  isCurrent: boolean,
): string {
  return isCurrent ? "Vous" : maskAffiliateName(publisher);
}

// Referral codes: 8 chars from an unambiguous alphabet (no 0/O/1/I) so they're
// easy to read aloud and share.
const REFERRAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateReferralCode(): string {
  let code = "";
  for (let i = 0; i < 8; i++) code += REFERRAL_ALPHABET[randomInt(REFERRAL_ALPHABET.length)];
  return code;
}

/**
 * Returns the publisher's referral code, generating and persisting one the
 * first time it's needed (the column is nullable so the migration stayed
 * additive). Retries on the rare unique-constraint collision.
 */
export async function ensureReferralCode(publisherId: string): Promise<string> {
  const existing = await prisma.publisher.findUnique({ where: { id: publisherId }, select: { referralCode: true } });
  if (existing?.referralCode) return existing.referralCode;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode();
    try {
      await prisma.publisher.update({ where: { id: publisherId }, data: { referralCode: code } });
      return code;
    } catch {
      // Unique collision — try another code.
    }
  }
  throw new Error("Impossible de générer un code de parrainage unique");
}

/** Resolve a referral code to the referrer's publisher id (null if unknown). */
export async function resolveReferrer(referralCode: string): Promise<string | null> {
  const code = referralCode.trim().toUpperCase();
  if (!code) return null;
  const referrer = await prisma.publisher.findUnique({ where: { referralCode: code }, select: { id: true } });
  return referrer?.id ?? null;
}

export interface ReferredAffiliate {
  displayName: string;
  joinedAt: Date;
  revenue: number;
  conversions: number;
  /** Your reward from this affiliate (REFERRAL_RATE of their lifetime revenue). */
  reward: number;
}

export interface RewardsOverview {
  tier: TierProgress;
  lifetimeRevenue: number;
  lifetimeConversions: number;
  monthRevenue: number;
  /** Tier bonus applied to lifetime / month revenue (motivational display). */
  bonusLifetime: number;
  bonusThisMonth: number;
  badges: Badge[];
  referralCode: string;
  referrals: ReferredAffiliate[];
  referralCount: number;
  referralEarnings: number;
}

/**
 * Everything the rewards page needs: current tier + progress, milestone badges,
 * and the referral program (code, referred affiliates, earnings). All figures
 * derive from `PublisherDailyStat`, so the loyalty numbers always agree with
 * what the publisher sees elsewhere on the dashboard.
 */
export async function getRewardsOverview(publisherId: string): Promise<RewardsOverview> {
  const startMonth = (() => {
    const t = startOfTodayLocalAsUtc();
    return new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), 1));
  })();

  const [lifetimeAgg, monthAgg, referralCode, referred] = await Promise.all([
    prisma.publisherDailyStat.aggregate({ where: { publisherId }, _sum: { revenue: true, conversions: true } }),
    prisma.publisherDailyStat.aggregate({ where: { publisherId, date: { gte: startMonth } }, _sum: { revenue: true } }),
    ensureReferralCode(publisherId),
    prisma.publisher.findMany({
      where: { referredById: publisherId },
      select: { id: true, createdAt: true, companyName: true, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const lifetimeRevenue = toNumber(lifetimeAgg._sum.revenue);
  const lifetimeConversions = lifetimeAgg._sum.conversions ?? 0;
  const monthRevenue = toNumber(monthAgg._sum.revenue);

  // Per-referred-affiliate lifetime revenue in a single grouped query.
  const referredIds = referred.map((r) => r.id);
  const referredStats = referredIds.length
    ? await prisma.publisherDailyStat.groupBy({
        by: ["publisherId"],
        where: { publisherId: { in: referredIds } },
        _sum: { revenue: true, conversions: true },
      })
    : [];
  const statByPublisher = new Map(
    referredStats.map((g) => [g.publisherId, { revenue: toNumber(g._sum.revenue), conversions: g._sum.conversions ?? 0 }]),
  );

  const referrals: ReferredAffiliate[] = referred.map((r) => {
    const s = statByPublisher.get(r.id) ?? { revenue: 0, conversions: 0 };
    return {
      displayName: maskAffiliateName(r),
      joinedAt: r.createdAt,
      revenue: s.revenue,
      conversions: s.conversions,
      reward: s.revenue * REFERRAL_RATE,
    };
  });
  const referralEarnings = referrals.reduce((sum, r) => sum + r.reward, 0);

  const tier = resolveTier(lifetimeRevenue);

  return {
    tier,
    lifetimeRevenue,
    lifetimeConversions,
    monthRevenue,
    bonusLifetime: lifetimeRevenue * tier.current.bonusRate,
    bonusThisMonth: monthRevenue * tier.current.bonusRate,
    badges: computeBadges({ conversions: lifetimeConversions, revenue: lifetimeRevenue, referrals: referred.length }),
    referralCode,
    referrals,
    referralCount: referred.length,
    referralEarnings,
  };
}

/**
 * Top-performing publishers this month, ranked by conversions (revenue breaks
 * ties). Sourced from `PublisherDailyStat` — the same admin-entered figures the
 * rest of the publisher dashboard uses — so the ranking always matches what
 * each affiliate sees for themselves. Only publishers who actually converted
 * this month are ranked (a board full of zeros motivates no one). The current
 * publisher's own rank is returned in `me` when they fall outside the top slice
 * so they always know where they stand.
 */
export async function getMonthlyLeaderboard(currentPublisherId: string, limit = 5): Promise<Leaderboard> {
  const today = startOfTodayLocalAsUtc();
  const startMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const endExclusive = new Date(today.getTime() + DAY_MS);

  const grouped = await prisma.publisherDailyStat.groupBy({
    by: ["publisherId"],
    where: { date: { gte: startMonth, lt: endExclusive } },
    _sum: { conversions: true, revenue: true, clicks: true },
    orderBy: [{ _sum: { conversions: "desc" } }, { _sum: { revenue: "desc" } }],
  });

  const ranked = grouped.filter((group) => (group._sum.conversions ?? 0) > 0);

  const ids = ranked.map((group) => group.publisherId);
  const publishers = ids.length
    ? await prisma.publisher.findMany({
        where: { id: { in: ids } },
        select: { id: true, companyName: true, user: { select: { name: true, email: true } } },
      })
    : [];
  const byId = new Map(publishers.map((publisher) => [publisher.id, publisher]));

  const entries: LeaderboardEntry[] = ranked.map((group, index) => {
    const isCurrent = group.publisherId === currentPublisherId;
    return {
      rank: index + 1,
      publisherId: group.publisherId,
      displayName: leaderboardName(byId.get(group.publisherId), isCurrent),
      conversions: group._sum.conversions ?? 0,
      revenue: toNumber(group._sum.revenue),
      clicks: group._sum.clicks ?? 0,
      isCurrent,
    };
  });

  const top = entries.slice(0, limit);
  const me = entries.find((entry) => entry.isCurrent) ?? null;

  return {
    periodLabel: monthLabelFormatter.format(today),
    top,
    me: me && !top.some((entry) => entry.isCurrent) ? me : null,
    totalRanked: entries.length,
  };
}

export async function getAvailableOffers(filters?: { category?: string; country?: string }) {
  return prisma.offer.findMany({
    where: {
      status: "ACTIVE",
      ...(filters?.category ? { category: filters.category } : {}),
      ...(filters?.country ? { OR: [{ countries: { isEmpty: true } }, { countries: { has: filters.country } }] } : {}),
    },
    include: { advertiser: { select: { companyName: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOfferById(id: string) {
  return prisma.offer.findUnique({
    where: { id },
    include: { advertiser: { select: { companyName: true } } },
  });
}

export async function getPublisherLinks(publisherId: string) {
  return prisma.affiliateLink.findMany({
    where: { publisherId },
    include: { offer: { select: { name: true, slug: true, payout: true, payoutType: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getExistingLink(publisherId: string, offerId: string) {
  return prisma.affiliateLink.findFirst({ where: { publisherId, offerId, subId: "" } });
}

interface HistoryFilters {
  type?: "clicks" | "conversions";
  page?: number;
  pageSize?: number;
}

export async function getClickHistory(publisherId: string, { page = 1, pageSize = 20 }: HistoryFilters = {}) {
  const [items, total] = await Promise.all([
    prisma.click.findMany({
      where: { publisherId },
      include: { offer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.click.count({ where: { publisherId } }),
  ]);
  return { items, total, page, pageSize };
}

export async function getConversionHistory(publisherId: string, { page = 1, pageSize = 20 }: HistoryFilters = {}) {
  const [items, total] = await Promise.all([
    prisma.conversion.findMany({
      where: { publisherId },
      include: { offer: { select: { name: true } }, commission: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.conversion.count({ where: { publisherId } }),
  ]);
  return { items, total, page, pageSize };
}

export async function getPayments(publisherId: string) {
  return prisma.payment.findMany({
    where: { publisherId },
    orderBy: { requestedAt: "desc" },
  });
}

export async function getPendingCommissionsTotal(publisherId: string) {
  const agg = await prisma.commission.aggregate({
    where: { publisherId, status: "APPROVED", paymentId: null },
    _sum: { amount: true },
  });
  return toNumber(agg._sum.amount);
}

