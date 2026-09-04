import "server-only";
import { eachDayOfInterval, format, startOfDay, subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/format";

export async function getPlatformStats() {
  const [publisherCount, advertiserCount, revenueAgg, commissionAgg, conversionCount, pendingOffers, pendingPayments] =
    await Promise.all([
      prisma.publisher.count(),
      prisma.advertiser.count(),
      prisma.conversion.aggregate({ where: { status: { not: "REJECTED" } }, _sum: { payout: true } }),
      prisma.commission.aggregate({ _sum: { amount: true } }),
      prisma.conversion.count({ where: { status: { not: "REJECTED" } } }),
      prisma.offer.count({ where: { status: "PENDING" } }),
      prisma.payment.count({ where: { status: "PENDING" } }),
    ]);

  return {
    publisherCount,
    advertiserCount,
    revenue: toNumber(revenueAgg._sum.payout),
    commissions: toNumber(commissionAgg._sum.amount),
    conversionCount,
    pendingOffers,
    pendingPayments,
  };
}

export async function getPlatformSeries(days = 90) {
  const since = startOfDay(subDays(new Date(), days - 1));

  const [clicks, leads, conversions, commissions] = await Promise.all([
    prisma.click.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.lead.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.conversion.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.commission.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true, amount: true } }),
  ]);

  const buckets = new Map<string, { date: string; clicks: number; leads: number; conversions: number; commissions: number }>();
  for (const day of eachDayOfInterval({ start: since, end: new Date() })) {
    const key = format(day, "yyyy-MM-dd");
    buckets.set(key, { date: key, clicks: 0, leads: 0, conversions: 0, commissions: 0 });
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

  const totalsByPublisher = new Map(statTotals.map((t) => [t.publisherId, t._sum]));

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
    include: { user: true, _count: { select: { offers: true, campaigns: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCampaignsAdminList() {
  return prisma.campaign.findMany({
    include: { advertiser: { select: { companyName: true } }, _count: { select: { offers: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOffersAdminList() {
  return prisma.offer.findMany({
    include: { advertiser: { select: { companyName: true } }, _count: { select: { affiliateLinks: true, conversions: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPaymentsAdminList() {
  return prisma.payment.findMany({
    include: { publisher: { select: { companyName: true, user: { select: { name: true, email: true } } } } },
    orderBy: { requestedAt: "desc" },
  });
}

export async function getCommissionsAdminList() {
  return prisma.commission.findMany({
    include: {
      publisher: { select: { companyName: true, user: { select: { name: true } } } },
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
      publisher: { select: { memberId: true, user: { select: { name: true, email: true } } } },
    },
    // Pending first (enum order), then most recent.
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take,
  });
}

export async function getLinkRequestsAdminList(take = 200) {
  return prisma.affiliateLink.findMany({
    include: {
      publisher: { select: { memberId: true, user: { select: { name: true, email: true } } } },
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

export async function getDailyStatsAdminList({ publisherId, take = 100 }: DailyStatFilters = {}) {
  return prisma.publisherDailyStat.findMany({
    where: publisherId ? { publisherId } : undefined,
    include: { publisher: { select: { companyName: true, user: { select: { name: true, email: true } } } } },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take,
  });
}
