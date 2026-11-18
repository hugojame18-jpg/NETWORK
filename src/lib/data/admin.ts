import "server-only";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/format";
import { getAffiliateLedgers } from "@/lib/data/ledger";
import { flowConfig, lastSync } from "@/lib/flow";

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

/**
 * One affiliate's file, for the detail screen: who they are, the terms they
 * are on, and where to send their money. Returns null for an unknown id so
 * the route can answer 404 rather than throw.
 */
export async function getAffiliateProfile(publisherId: string) {
  return prisma.publisher.findUnique({
    where: { id: publisherId },
    select: {
      id: true,
      memberId: true,
      companyName: true,
      website: true,
      commissionRate: true,
      postbackToken: true,
      sub3Aliases: {
        orderBy: { createdAt: "asc" },
        select: { id: true, token: true },
      },
      paymentMethod: true,
      paymentDetails: true,
      minPayout: true,
      createdAt: true,
      referredById: true,
      referredBy: {
        select: {
          id: true,
          memberId: true,
          user: { select: { name: true } },
        },
      },
      workedWithNetworks: true,
      previousNetworks: true,
      affiliateExperience: true,
      tiktokLinks: true,
      trafficSources: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          createdAt: true,
        },
      },
      _count: { select: { referrals: true } },
    },
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
 * The network's activity day by day, oldest first, for the home chart.
 *
 * Read from the daily stats — the same rows the postback and the Flow sync
 * write to. The chart used to read the Click/Lead/Conversion tables of the
 * old tracking engine, which nothing fills any more, so it drew a flat line
 * under a day with eleven conversions on it.
 *
 * Days without a row are filled with zeros: a gap in the line would read as
 * "no data", when what it means is "nothing happened".
 */
export async function getNetworkSeries(days = 90) {
  const today = startOfTodayLocalAsUtc();
  const since = new Date(today.getTime() - (days - 1) * DAY_MS);

  const grouped = await prisma.publisherDailyStat.groupBy({
    by: ["date"],
    where: { date: { gte: since } },
    _sum: { revenue: true, conversions: true, clicks: true },
  });
  const byDay = new Map(
    grouped.map((group) => [group.date.toISOString().slice(0, 10), group._sum]),
  );

  const points: {
    date: string;
    clicks: number;
    conversions: number;
    revenue: number;
  }[] = [];
  for (let t = since.getTime(); t <= today.getTime(); t += DAY_MS) {
    const key = new Date(t).toISOString().slice(0, 10);
    const sums = byDay.get(key);
    points.push({
      date: key,
      clicks: sums?.clicks ?? 0,
      conversions: sums?.conversions ?? 0,
      revenue: toNumber(sums?.revenue),
    });
  }
  return points;
}

/**
 * The admin home answers one question: what needs me right now?
 *
 * Every item is something that costs money or trust if it is left alone: an
 * affiliate waiting to be paid, traffic arriving under a sub3 nobody owns,
 * postbacks being turned away, a sync that stopped. The queues it used to
 * watch — link and site requests — belong to screens that are off the menu.
 */
export async function getAdminPulse() {
  const today = startOfTodayLocalAsUtc();
  const tomorrow = new Date(today.getTime() + DAY_MS);
  const startMonth = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1),
  );
  const weekAgo = new Date(Date.now() - 7 * DAY_MS);

  const [
    todayRange,
    monthRange,
    publisherCount,
    activeToday,
    pendingPayments,
    rejectedHits,
    ledgers,
    sync,
    flow,
  ] = await Promise.all([
    getNetworkRevenue({ from: today, to: tomorrow, label: "Aujourd'hui" }),
    getNetworkRevenue({ from: startMonth, to: tomorrow, label: "Ce mois-ci" }),
    prisma.publisher.count(),
    prisma.publisherDailyStat.count({
      where: { date: { gte: today, lt: tomorrow } },
    }),
    prisma.payment.count({
      where: { status: { in: ["PENDING", "APPROVED"] } },
    }),
    // A week, not all time: an old rejected call that has since been dealt
    // with should stop asking for attention on its own.
    prisma.postbackHit.count({
      where: {
        createdAt: { gte: weekAgo },
        status: { in: ["UNKNOWN_TOKEN", "UNAUTHORIZED", "INVALID"] },
      },
    }),
    getAffiliateLedgers(),
    lastSync(),
    flowConfig(),
  ]);

  let owed = 0;
  let owedCount = 0;
  for (const ledger of ledgers.values()) {
    // Half a cent of float dust is not a debt.
    if (ledger.balance > 0.005) {
      owed += ledger.balance;
      owedCount += 1;
    }
  }

  return {
    today: todayRange,
    month: monthRange,
    publisherCount,
    /** Affiliates with activity recorded today. */
    activeToday,
    pendingPayments,
    rejectedHits,
    /** What is owed to affiliates right now, and to how many of them. */
    owed,
    owedCount,
    unknownSub3: sync?.unknownSub3 ?? [],
    sync: {
      configured: flow.apiKey !== null,
      ranAt: sync?.ranAt ?? null,
      ok: sync?.ok ?? null,
      error: sync?.error ?? null,
    },
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
