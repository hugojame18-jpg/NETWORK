import "server-only";
import { eachDayOfInterval, format, startOfDay, startOfMonth, subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/format";

export async function getAdvertiserByUserId(userId: string) {
  return prisma.advertiser.findUniqueOrThrow({ where: { userId } });
}

export async function getSpendSummary(advertiserId: string) {
  const now = new Date();
  const startToday = startOfDay(now);
  const startMonth = startOfMonth(now);

  const offerIds = (await prisma.offer.findMany({ where: { advertiserId }, select: { id: true } })).map((o) => o.id);

  const [todayAgg, monthAgg, totalAgg, activeOffers, publisherCount] = await Promise.all([
    prisma.conversion.aggregate({
      where: { offerId: { in: offerIds }, createdAt: { gte: startToday }, status: { not: "REJECTED" } },
      _sum: { payout: true },
    }),
    prisma.conversion.aggregate({
      where: { offerId: { in: offerIds }, createdAt: { gte: startMonth }, status: { not: "REJECTED" } },
      _sum: { payout: true },
    }),
    prisma.conversion.aggregate({
      where: { offerId: { in: offerIds }, status: { not: "REJECTED" } },
      _sum: { payout: true },
    }),
    prisma.offer.count({ where: { advertiserId, status: "ACTIVE" } }),
    prisma.affiliateLink.findMany({ where: { offerId: { in: offerIds } }, select: { publisherId: true }, distinct: ["publisherId"] }),
  ]);

  return {
    today: toNumber(todayAgg._sum.payout),
    month: toNumber(monthAgg._sum.payout),
    total: toNumber(totalAgg._sum.payout),
    activeOffers,
    publisherCount: publisherCount.length,
  };
}

export async function getSpendSeries(advertiserId: string, days = 90) {
  const since = startOfDay(subDays(new Date(), days - 1));
  const offerIds = (await prisma.offer.findMany({ where: { advertiserId }, select: { id: true } })).map((o) => o.id);

  const [clicks, conversions] = await Promise.all([
    prisma.click.findMany({ where: { offerId: { in: offerIds }, createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.conversion.findMany({
      where: { offerId: { in: offerIds }, createdAt: { gte: since } },
      select: { createdAt: true, payout: true },
    }),
  ]);

  const buckets = new Map<string, { date: string; clicks: number; leads: number; conversions: number; commissions: number }>();
  for (const day of eachDayOfInterval({ start: since, end: new Date() })) {
    const key = format(day, "yyyy-MM-dd");
    buckets.set(key, { date: key, clicks: 0, leads: 0, conversions: 0, commissions: 0 });
  }

  clicks.forEach((c) => {
    const bucket = buckets.get(format(c.createdAt, "yyyy-MM-dd"));
    if (bucket) bucket.clicks += 1;
  });
  conversions.forEach((c) => {
    const bucket = buckets.get(format(c.createdAt, "yyyy-MM-dd"));
    if (bucket) {
      bucket.conversions += 1;
      bucket.commissions += toNumber(c.payout);
    }
  });

  return Array.from(buckets.values());
}

export async function getCampaigns(advertiserId: string) {
  return prisma.campaign.findMany({
    where: { advertiserId },
    include: { _count: { select: { offers: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCampaignById(advertiserId: string, id: string) {
  return prisma.campaign.findFirst({
    where: { id, advertiserId },
    include: { offers: true },
  });
}

export async function getAdvertiserOffers(advertiserId: string) {
  return prisma.offer.findMany({
    where: { advertiserId },
    include: { campaign: { select: { name: true } }, _count: { select: { affiliateLinks: true, conversions: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdvertiserOfferById(advertiserId: string, id: string) {
  return prisma.offer.findFirst({ where: { id, advertiserId } });
}

export async function getSpendByOffer(advertiserId: string) {
  const offers = await prisma.offer.findMany({
    where: { advertiserId },
    include: {
      conversions: { where: { status: { not: "REJECTED" } }, select: { payout: true } },
      _count: { select: { clicks: true, conversions: true } },
    },
  });

  return offers.map((offer) => ({
    id: offer.id,
    name: offer.name,
    clicks: offer._count.clicks,
    conversions: offer._count.conversions,
    spend: offer.conversions.reduce((sum, c) => sum + toNumber(c.payout), 0),
  }));
}

export async function getTopPublishers(advertiserId: string) {
  const offerIds = (await prisma.offer.findMany({ where: { advertiserId }, select: { id: true } })).map((o) => o.id);

  const conversions = await prisma.conversion.findMany({
    where: { offerId: { in: offerIds }, status: { not: "REJECTED" } },
    include: { publisher: { select: { companyName: true, user: { select: { name: true } } } } },
  });

  const byPublisher = new Map<string, { publisherId: string; name: string; conversions: number; spend: number }>();
  for (const conversion of conversions) {
    const key = conversion.publisherId;
    const existing = byPublisher.get(key) ?? {
      publisherId: key,
      name: conversion.publisher.companyName ?? conversion.publisher.user.name,
      conversions: 0,
      spend: 0,
    };
    existing.conversions += 1;
    existing.spend += toNumber(conversion.payout);
    byPublisher.set(key, existing);
  }

  return Array.from(byPublisher.values()).sort((a, b) => b.spend - a.spend).slice(0, 10);
}
