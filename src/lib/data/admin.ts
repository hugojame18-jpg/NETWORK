import "server-only";
import { eachDayOfInterval, format, startOfDay, subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/format";

export async function getPlatformStats() {
  const [
    publisherCount,
    advertiserCount,
    dailyAgg,
    commissionAgg,
    pendingOffers,
    pendingPayments,
  ] = await Promise.all([
    prisma.publisher.count(),
    prisma.advertiser.count(),
    // Revenue and conversions come from the hand-entered daily stats, not from
    // the Conversion table: tracking is manual, so Conversion stays empty and
    // reading it would show $0 next to real earnings.
    prisma.publisherDailyStat.aggregate({
      _sum: { revenue: true, conversions: true },
    }),
    prisma.commission.aggregate({ _sum: { amount: true } }),
    prisma.offer.count({ where: { status: "PENDING" } }),
    prisma.payment.count({ where: { status: "PENDING" } }),
  ]);

  return {
    publisherCount,
    advertiserCount,
    revenue: toNumber(dailyAgg._sum.revenue),
    commissions: toNumber(commissionAgg._sum.amount),
    conversionCount: dailyAgg._sum.conversions ?? 0,
    pendingOffers,
    pendingPayments,
  };
}

export async function getPlatformSeries(days = 90) {
  const since = startOfDay(subDays(new Date(), days - 1));

  const [clicks, leads, conversions, commissions] = await Promise.all([
    prisma.click.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.lead.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.conversion.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.commission.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, amount: true },
    }),
  ]);

  const buckets = new Map<
    string,
    {
      date: string;
      clicks: number;
      leads: number;
      conversions: number;
      commissions: number;
    }
  >();
  for (const day of eachDayOfInterval({ start: since, end: new Date() })) {
    const key = format(day, "yyyy-MM-dd");
    buckets.set(key, {
      date: key,
      clicks: 0,
      leads: 0,
      conversions: 0,
      commissions: 0,
    });
  }

  clicks.forEach((c) => {
    const b = buckets.get(format(c.createdAt, "yyyy-MM-dd"));
    if (b) b.clicks += 1;
  });
  leads.forEach((l) => {
    const b = buckets.get(format(l.createdAt, "yyyy-MM-dd"));
    if (b) b.leads += 1;
  });
  conversions.forEach((c) => {
    const b = buckets.get(format(c.createdAt, "yyyy-MM-dd"));
    if (b) b.conversions += 1;
  });
  commissions.forEach((c) => {
    const b = buckets.get(format(c.createdAt, "yyyy-MM-dd"));
    if (b) b.commissions += toNumber(c.amount);
  });

  return Array.from(buckets.values());
}

export async function getPublishersAdminList() {
  const [publishers, statTotals] = await Promise.all([
    prisma.publisher.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }),
    // Cumulative total of the daily stats you enter each evening, per affiliate.
    prisma.publisherDailyStat.groupBy({
      by: ["publisherId"],
      _sum: { clicks: true, hosts: true, conversions: true, revenue: true },
    }),
  ]);

  const totalsByPublisher = new Map(
    statTotals.map((t) => [t.publisherId, t._sum]),
  );

  return publishers.map((publisher) => {
    const totals = totalsByPublisher.get(publisher.id);
    return {
      ...publisher,
      totals: {
        clicks: totals?.clicks ?? 0,
        hosts: totals?.hosts ?? 0,
        conversions: totals?.conversions ?? 0,
        revenue: toNumber(totals?.revenue),
      },
    };
  });
}

export async function getAdvertisersAdminList() {
  return prisma.advertiser.findMany({
    include: {
      user: true,
      _count: { select: { offers: true, campaigns: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCampaignsAdminList() {
  return prisma.campaign.findMany({
    include: {
      advertiser: { select: { companyName: true } },
      _count: { select: { offers: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOffersAdminList() {
  return prisma.offer.findMany({
    include: {
      advertiser: { select: { companyName: true } },
      _count: { select: { affiliateLinks: true, conversions: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPaymentsAdminList() {
  return prisma.payment.findMany({
    include: {
      publisher: {
        select: {
          companyName: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: { requestedAt: "desc" },
  });
}

export async function getCommissionsAdminList() {
  return prisma.commission.findMany({
    include: {
      publisher: {
        select: { companyName: true, user: { select: { name: true } } },
      },
      conversion: { include: { offer: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function getUsersAdminList() {
  return prisma.user.findMany({
    include: { permissions: { include: { permission: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllPermissions() {
  return prisma.permission.findMany({ orderBy: { key: "asc" } });
}

export async function getAuditLogs(take = 100) {
  return prisma.auditLog.findMany({
    include: { actor: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getSetting(key: string) {
  return prisma.setting.findUnique({ where: { key } });
}

export async function getPublishersForSelect() {
  const publishers = await prisma.publisher.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return publishers.map((p) => ({
    id: p.id,
    label: p.user.name || p.user.email,
    email: p.user.email,
  }));
}

// ---------------------------------------------------------------------------
// Network revenue
//
// Revenue lives in PublisherDailyStat — the figures entered by hand each
// evening — not in the Conversion table, which stays empty while tracking is
// manual. Every number below therefore reads from the daily stats, so the
// admin totals match what publishers see.
// ---------------------------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;

/** Today at 00:00 of the local calendar day, expressed as UTC midnight. */
function startOfTodayLocalAsUtc(now = new Date()): Date {
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export type RevenuePeriod =
  "7d" | "30d" | "month" | "last-month" | "year" | "all";

export interface PeriodRange {
  /** Inclusive lower bound; null means "since the beginning". */
  from: Date | null;
  /** Exclusive upper bound. */
  to: Date;
  label: string;
}

/** Resolves a preset (or an explicit from/to) to a concrete date range. */
export function resolvePeriod(
  period: RevenuePeriod,
  from?: string,
  to?: string,
): PeriodRange {
  const today = startOfTodayLocalAsUtc();
  const tomorrow = new Date(today.getTime() + DAY_MS);

  // An explicit range wins over the preset.
  if (from || to) {
    const parsedFrom = from ? new Date(`${from}T00:00:00.000Z`) : null;
    const parsedTo = to
      ? new Date(new Date(`${to}T00:00:00.000Z`).getTime() + DAY_MS)
      : tomorrow;
    return {
      from:
        parsedFrom && !Number.isNaN(parsedFrom.getTime()) ? parsedFrom : null,
      to: Number.isNaN(parsedTo.getTime()) ? tomorrow : parsedTo,
      label: "Période personnalisée",
    };
  }

  switch (period) {
    case "7d":
      return {
        from: new Date(today.getTime() - 6 * DAY_MS),
        to: tomorrow,
        label: "7 derniers jours",
      };
    case "30d":
      return {
        from: new Date(today.getTime() - 29 * DAY_MS),
        to: tomorrow,
        label: "30 derniers jours",
      };
    case "month":
      return {
        from: new Date(
          Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1),
        ),
        to: tomorrow,
        label: "Ce mois-ci",
      };
    case "last-month": {
      const start = new Date(
        Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1),
      );
      const end = new Date(
        Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1),
      );
      return { from: start, to: end, label: "Mois dernier" };
    }
    case "year":
      return {
        from: new Date(Date.UTC(today.getUTCFullYear(), 0, 1)),
        to: tomorrow,
        label: "Cette année",
      };
    case "all":
    default:
      return { from: null, to: tomorrow, label: "Depuis le début" };
  }
}

function dateFilter(range: PeriodRange) {
  return range.from
    ? { date: { gte: range.from, lt: range.to } }
    : { date: { lt: range.to } };
}

export interface RevenueTotals {
  /** Gross billed to advertisers, before the affiliates' share. */
  revenue: number;
  /** Sum owed to affiliates, each at their own commission rate. */
  affiliateShare: number;
  /** What the network keeps: gross minus the affiliates' share. */
  margin: number;
  conversions: number;
  clicks: number;
  hosts: number;
  /** Days with at least one entry, useful to spot gaps in the manual input. */
  daysWithData: number;
}

export async function getNetworkRevenue(
  range: PeriodRange,
): Promise<RevenueTotals> {
  const where = dateFilter(range);

  const [totals, perPublisher, rates, days] = await Promise.all([
    prisma.publisherDailyStat.aggregate({
      where,
      _sum: { revenue: true, conversions: true, clicks: true, hosts: true },
    }),
    // Grouped separately because each affiliate can sit on a different rate,
    // so the share can't be derived from the grand total.
    prisma.publisherDailyStat.groupBy({
      by: ["publisherId"],
      where,
      _sum: { revenue: true },
    }),
    prisma.publisher.findMany({ select: { id: true, commissionRate: true } }),
    prisma.publisherDailyStat.findMany({
      where,
      select: { date: true },
      distinct: ["date"],
    }),
  ]);

  const rateById = new Map(
    rates.map((r) => [r.id, toNumber(r.commissionRate)]),
  );
  const affiliateShare = perPublisher.reduce(
    (sum, group) =>
      sum +
      toNumber(group._sum.revenue) * (rateById.get(group.publisherId) ?? 0.5),
    0,
  );
  const revenue = toNumber(totals._sum.revenue);

  return {
    revenue,
    affiliateShare,
    margin: revenue - affiliateShare,
    conversions: totals._sum.conversions ?? 0,
    clicks: totals._sum.clicks ?? 0,
    hosts: totals._sum.hosts ?? 0,
    daysWithData: days.length,
  };
}

/** Revenue per affiliate over the range, best first. */
export async function getRevenueByPublisher(range: PeriodRange) {
  const grouped = await prisma.publisherDailyStat.groupBy({
    by: ["publisherId"],
    where: dateFilter(range),
    _sum: { revenue: true, conversions: true, clicks: true, hosts: true },
  });

  if (grouped.length === 0) return [];

  const publishers = await prisma.publisher.findMany({
    where: { id: { in: grouped.map((group) => group.publisherId) } },
    select: {
      id: true,
      memberId: true,
      commissionRate: true,
      user: { select: { name: true, email: true } },
    },
  });
  const byId = new Map(
    publishers.map((publisher) => [publisher.id, publisher]),
  );

  return grouped
    .map((group) => {
      const publisher = byId.get(group.publisherId);
      const revenue = toNumber(group._sum.revenue);
      const rate = toNumber(publisher?.commissionRate ?? 0.5);
      return {
        publisherId: group.publisherId,
        memberId: publisher?.memberId ?? 0,
        name: publisher?.user.name ?? "—",
        email: publisher?.user.email ?? "",
        revenue,
        rate,
        affiliateShare: revenue * rate,
        margin: revenue * (1 - rate),
        conversions: group._sum.conversions ?? 0,
        clicks: group._sum.clicks ?? 0,
        hosts: group._sum.hosts ?? 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

/** Daily revenue points over the range, oldest first, for the chart. */
export async function getRevenueSeries(range: PeriodRange) {
  const grouped = await prisma.publisherDailyStat.groupBy({
    by: ["date"],
    where: dateFilter(range),
    _sum: { revenue: true, conversions: true, clicks: true },
    orderBy: { date: "asc" },
  });

  return grouped.map((group) => ({
    date: group.date.toISOString().slice(0, 10),
    revenue: toNumber(group._sum.revenue),
    conversions: group._sum.conversions ?? 0,
    clicks: group._sum.clicks ?? 0,
  }));
}

/**
 * The admin home answers one question: what needs me right now? These are the
 * queues that block an affiliate until someone acts on them, plus today's
 * money so the first screen of the day is useful without a click.
 */
export async function getAdminPulse() {
  const today = startOfTodayLocalAsUtc();
  const tomorrow = new Date(today.getTime() + DAY_MS);
  const startMonth = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1),
  );

  const [
    todayRange,
    monthRange,
    publisherCount,
    activeToday,
    pendingLinks,
    pendingSites,
    pendingPayments,
    statsToday,
  ] = await Promise.all([
    getNetworkRevenue({ from: today, to: tomorrow, label: "Aujourd'hui" }),
    getNetworkRevenue({ from: startMonth, to: tomorrow, label: "Ce mois-ci" }),
    prisma.publisher.count(),
    prisma.publisherDailyStat.count({
      where: { date: { gte: today, lt: tomorrow } },
    }),
    prisma.affiliateLink.count({ where: { status: "REQUESTED" } }),
    prisma.siteRequest.count({ where: { status: "PENDING" } }),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.publisherDailyStat.count({
      where: { date: { gte: today, lt: tomorrow } },
    }),
  ]);

  return {
    today: todayRange,
    month: monthRange,
    publisherCount,
    /** Affiliates with figures entered for today — how far tonight's input got. */
    activeToday,
    pendingLinks,
    pendingSites,
    pendingPayments,
    statsEnteredToday: statsToday,
  };
}

export async function getTrainingVideosAdminList(take = 100) {
  return prisma.trainingVideo.findMany({
    include: { author: { select: { name: true } } },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    take,
  });
}

export async function getAnnouncementsAdminList(take = 50) {
  return prisma.announcement.findMany({
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getSiteRequestsAdminList(take = 200) {
  return prisma.siteRequest.findMany({
    include: {
      publisher: {
        select: {
          memberId: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
    // Pending first (enum order), then most recent.
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take,
  });
}

export async function getLinkRequestsAdminList(take = 200) {
  return prisma.affiliateLink.findMany({
    include: {
      publisher: {
        select: {
          memberId: true,
          user: { select: { name: true, email: true } },
        },
      },
      offer: { select: { name: true, category: true } },
    },
    // Pending requests first, then most recent.
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take,
  });
}

interface DailyStatFilters {
  publisherId?: string;
  take?: number;
}

export async function getDailyStatsAdminList({
  publisherId,
  take = 100,
}: DailyStatFilters = {}) {
  return prisma.publisherDailyStat.findMany({
    where: publisherId ? { publisherId } : undefined,
    include: {
      publisher: {
        select: {
          companyName: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take,
  });
}
