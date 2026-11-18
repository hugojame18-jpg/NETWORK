import "server-only";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/format";
import { REFERRAL_RATE, payoutRate } from "@/lib/loyalty";

/**
 * What an affiliate has earned, what has been paid out, and what is still owed.
 *
 * One module, used by both sides. `Publisher.balance` is a stored column that
 * nothing keeps up to date — it reads 0 next to real earnings, which is how an
 * affiliate ends up believing they are owed nothing. So the balance is derived
 * here instead, from the two facts that are actually recorded: the daily stats
 * (what the traffic earned) and the Payment rows (what was sent).
 *
 * Derived rather than stored on purpose: a running total can drift, and a
 * balance that drifts is an argument with an affiliate about money. This one is
 * recomputed on every read, so correcting a wrong daily stat or deleting a
 * mistyped payout immediately corrects the balance too.
 */

export interface AffiliateLedger {
  publisherId: string;
  /** The rate on their contract, before the referral share. */
  commissionRate: number;
  /** What they actually keep per dollar of gross, referral share deducted. */
  rate: number;
  isReferred: boolean;
  /** Gross the network billed on their traffic. Never shown to the affiliate. */
  gross: number;
  /** Their cut of their own traffic. */
  ownEarnings: number;
  /** What they earn as a sponsor, on the gross their referrals generate. */
  referralEarnings: number;
  /** Everything they have earned, ever. */
  earned: number;
  /** Sum of the payouts marked as sent. */
  paid: number;
  /** Withdrawal requests opened but not yet sent. */
  pending: number;
  /** Still owed: earned minus paid. A payout never touches the stats. */
  balance: number;
  /** Balance minus what is already requested — what can still be asked for. */
  available: number;
}

interface LedgerInput {
  publisherId: string;
  commissionRate: number;
  isReferred: boolean;
  gross: number;
  referredGross: number;
  paid: number;
  pending: number;
}

/** The arithmetic, in one place, so every caller gets the same answer. */
function compose(input: LedgerInput): AffiliateLedger {
  const rate = payoutRate(input.commissionRate, input.isReferred);
  const ownEarnings = input.gross * rate;
  const referralEarnings = input.referredGross * REFERRAL_RATE;
  const earned = ownEarnings + referralEarnings;
  const balance = earned - input.paid;

  return {
    publisherId: input.publisherId,
    commissionRate: input.commissionRate,
    rate,
    isReferred: input.isReferred,
    gross: input.gross,
    ownEarnings,
    referralEarnings,
    earned,
    paid: input.paid,
    pending: input.pending,
    balance,
    available: Math.max(0, balance - input.pending),
  };
}

export function emptyLedger(publisherId: string): AffiliateLedger {
  return compose({
    publisherId,
    commissionRate: 0.5,
    isReferred: false,
    gross: 0,
    referredGross: 0,
    paid: 0,
    pending: 0,
  });
}

interface PaymentGroup {
  status: string;
  amount: number;
}

/**
 * A REJECTED request is neither money owed nor money sent, so it counts in
 * neither column. PENDING and APPROVED both mean "asked for, not yet gone".
 */
function splitPayments(groups: PaymentGroup[]): {
  paid: number;
  pending: number;
} {
  let paid = 0;
  let pending = 0;
  for (const group of groups) {
    if (group.status === "PAID") paid += group.amount;
    else if (group.status !== "REJECTED") pending += group.amount;
  }
  return { paid, pending };
}

/** The ledger of a single affiliate. */
export async function getAffiliateLedger(
  publisherId: string,
): Promise<AffiliateLedger> {
  const publisher = await prisma.publisher.findUnique({
    where: { id: publisherId },
    select: { id: true, commissionRate: true, referredById: true },
  });
  if (!publisher) return emptyLedger(publisherId);

  const [grossAgg, referrals, paymentGroups] = await Promise.all([
    prisma.publisherDailyStat.aggregate({
      where: { publisherId },
      _sum: { revenue: true },
    }),
    prisma.publisher.findMany({
      where: { referredById: publisherId },
      select: { id: true },
    }),
    prisma.payment.groupBy({
      by: ["status"],
      where: { publisherId },
      _sum: { amount: true },
    }),
  ]);

  const referredGross = referrals.length
    ? toNumber(
        (
          await prisma.publisherDailyStat.aggregate({
            where: { publisherId: { in: referrals.map((r) => r.id) } },
            _sum: { revenue: true },
          })
        )._sum.revenue,
      )
    : 0;

  return compose({
    publisherId,
    commissionRate: toNumber(publisher.commissionRate),
    isReferred: publisher.referredById != null,
    gross: toNumber(grossAgg._sum.revenue),
    referredGross,
    ...splitPayments(
      paymentGroups.map((group) => ({
        status: group.status,
        amount: toNumber(group._sum.amount),
      })),
    ),
  });
}

/**
 * Every affiliate's ledger in three queries, for the list screen.
 *
 * Computed for all of them rather than for a given subset: a sponsor's reward
 * depends on affiliates who may not be in that subset, so the numbers have to
 * be built from the whole set to come out right.
 */
export async function getAffiliateLedgers(): Promise<
  Map<string, AffiliateLedger>
> {
  const [publishers, grossGroups, paymentGroups] = await Promise.all([
    prisma.publisher.findMany({
      select: { id: true, commissionRate: true, referredById: true },
    }),
    prisma.publisherDailyStat.groupBy({
      by: ["publisherId"],
      _sum: { revenue: true },
    }),
    prisma.payment.groupBy({
      by: ["publisherId", "status"],
      _sum: { amount: true },
    }),
  ]);

  const grossById = new Map(
    grossGroups.map((group) => [
      group.publisherId,
      toNumber(group._sum.revenue),
    ]),
  );

  const referredGrossBySponsor = new Map<string, number>();
  for (const publisher of publishers) {
    if (!publisher.referredById) continue;
    referredGrossBySponsor.set(
      publisher.referredById,
      (referredGrossBySponsor.get(publisher.referredById) ?? 0) +
        (grossById.get(publisher.id) ?? 0),
    );
  }

  const paymentsById = new Map<string, PaymentGroup[]>();
  for (const group of paymentGroups) {
    const list = paymentsById.get(group.publisherId) ?? [];
    list.push({ status: group.status, amount: toNumber(group._sum.amount) });
    paymentsById.set(group.publisherId, list);
  }

  return new Map(
    publishers.map((publisher) => [
      publisher.id,
      compose({
        publisherId: publisher.id,
        commissionRate: toNumber(publisher.commissionRate),
        isReferred: publisher.referredById != null,
        gross: grossById.get(publisher.id) ?? 0,
        referredGross: referredGrossBySponsor.get(publisher.id) ?? 0,
        ...splitPayments(paymentsById.get(publisher.id) ?? []),
      }),
    ]),
  );
}

// ---------------------------------------------------------------------------
// Period breakdowns
// ---------------------------------------------------------------------------

export interface AffiliatePeriod {
  /** "2026-11" — the UTC calendar month, which is how the stats are stored. */
  key: string;
  /** First day of the month, UTC midnight. */
  start: Date;
  clicks: number;
  hosts: number;
  conversions: number;
  /** Gross billed on their traffic that month. */
  gross: number;
  /** Their cut of it. */
  ownEarnings: number;
  /** Sponsor rewards earned that month. */
  referralEarnings: number;
  earned: number;
  /** Conversions per click, as a percentage. */
  conversionRate: number;
}

export interface AffiliateDay {
  date: Date;
  clicks: number;
  hosts: number;
  conversions: number;
  gross: number;
  earnings: number;
  conversionRate: number;
}

function monthKey(date: Date): string {
  return date.toISOString().slice(0, 7);
}

function rateOf(conversions: number, clicks: number): number {
  return clicks > 0 ? (conversions / clicks) * 100 : 0;
}

/** The affiliate's share of a dollar of gross, referral deduction included. */
async function publisherRate(publisherId: string): Promise<number | null> {
  const publisher = await prisma.publisher.findUnique({
    where: { id: publisherId },
    select: { commissionRate: true, referredById: true },
  });
  if (!publisher) return null;
  return payoutRate(
    toNumber(publisher.commissionRate),
    publisher.referredById != null,
  );
}

/**
 * Month-by-month history, newest first.
 *
 * Grouped in memory rather than in SQL: Prisma cannot group by a truncated
 * date, and one row per affiliate per day is a handful of rows — not worth a
 * raw query that would then need its own timezone handling to agree with the
 * rest of the app.
 */
export async function getAffiliateMonths(
  publisherId: string,
): Promise<AffiliatePeriod[]> {
  const rate = await publisherRate(publisherId);
  if (rate === null) return [];

  const [own, referrals] = await Promise.all([
    prisma.publisherDailyStat.findMany({
      where: { publisherId },
      select: {
        date: true,
        clicks: true,
        hosts: true,
        conversions: true,
        revenue: true,
      },
      orderBy: { date: "desc" },
    }),
    prisma.publisher.findMany({
      where: { referredById: publisherId },
      select: { id: true },
    }),
  ]);

  const referredRows = referrals.length
    ? await prisma.publisherDailyStat.findMany({
        where: { publisherId: { in: referrals.map((r) => r.id) } },
        select: { date: true, revenue: true },
      })
    : [];

  const months = new Map<string, AffiliatePeriod>();

  function bucket(date: Date): AffiliatePeriod {
    const key = monthKey(date);
    const existing = months.get(key);
    if (existing) return existing;
    const created: AffiliatePeriod = {
      key,
      start: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)),
      clicks: 0,
      hosts: 0,
      conversions: 0,
      gross: 0,
      ownEarnings: 0,
      referralEarnings: 0,
      earned: 0,
      conversionRate: 0,
    };
    months.set(key, created);
    return created;
  }

  for (const row of own) {
    const month = bucket(row.date);
    month.clicks += row.clicks;
    month.hosts += row.hosts;
    month.conversions += row.conversions;
    month.gross += toNumber(row.revenue);
  }

  for (const row of referredRows) {
    bucket(row.date).referralEarnings += toNumber(row.revenue) * REFERRAL_RATE;
  }

  return [...months.values()]
    .map((month) => ({
      ...month,
      ownEarnings: month.gross * rate,
      earned: month.gross * rate + month.referralEarnings,
      conversionRate: rateOf(month.conversions, month.clicks),
    }))
    .sort((a, b) => b.start.getTime() - a.start.getTime());
}

/** The days of one month, newest first, with the affiliate's cut per day. */
export async function getAffiliateDays(
  publisherId: string,
  monthStart: Date,
): Promise<AffiliateDay[]> {
  const rate = await publisherRate(publisherId);
  if (rate === null) return [];

  const monthEnd = new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1),
  );

  const rows = await prisma.publisherDailyStat.findMany({
    where: { publisherId, date: { gte: monthStart, lt: monthEnd } },
    select: {
      date: true,
      clicks: true,
      hosts: true,
      conversions: true,
      revenue: true,
    },
    orderBy: { date: "desc" },
  });

  return rows.map((row) => ({
    date: row.date,
    clicks: row.clicks,
    hosts: row.hosts,
    conversions: row.conversions,
    gross: toNumber(row.revenue),
    earnings: toNumber(row.revenue) * rate,
    conversionRate: rateOf(row.conversions, row.clicks),
  }));
}

/**
 * First day of the current month and of the one before it, UTC midnight.
 *
 * Read from the local wall clock, like everywhere else stats are keyed: the
 * rows are entered against the operator's calendar day, so "this month" has to
 * mean the month on their clock, not the UTC one.
 */
export function recentMonths(now = new Date()): {
  current: Date;
  previous: Date;
} {
  const current = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  const previous = new Date(
    Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - 1, 1),
  );
  return { current, previous };
}

/** Payouts recorded for an affiliate, most recent first. */
export async function getAffiliatePayments(publisherId: string) {
  return prisma.payment.findMany({
    where: { publisherId },
    orderBy: [{ paidAt: "desc" }, { requestedAt: "desc" }],
  });
}
