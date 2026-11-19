/**
 * Fills a LOCAL database with believable activity, so every screen can be
 * looked at with something on it: a few affiliates of very different sizes,
 * ten weeks of daily stats, recent conversions, payouts, a referral.
 *
 * Refuses to run against anything that is not localhost. This script deletes
 * and rewrites statistics and payments; pointed at production it would replace
 * real money with invented money.
 *
 *   pnpm tsx scripts/seed-demo.ts
 *
 * Run `pnpm db:seed` first — it creates the accounts this builds on.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL ?? "";
if (!/@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url)) {
  console.error(
    "Refusing to run: DATABASE_URL is not a local database. This script overwrites statistics and payments.",
  );
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: url }),
});

const DAY_MS = 86_400_000;
const DAYS = 75;

/** Small deterministic generator, so two runs draw the same charts. */
function rng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

interface Profile {
  email: string;
  name: string;
  company: string | null;
  sub3: string;
  /** Clicks on an ordinary day today. */
  clicks: number;
  /** Conversions per click. */
  rate: number;
  /** Gross per conversion. */
  payout: number;
  /** Days ago the traffic started. */
  startedDaysAgo: number;
  referredBy?: string;
  payment?: { method: "PAYPAL" | "BANK_WIRE" | "CRYPTO"; details: object };
}

const PROFILES: Profile[] = [
  {
    email: "publisher@ccsubmit.io",
    name: "Julia Chen",
    company: "Chen Media Buying",
    sub3: "julia",
    clicks: 1400,
    rate: 0.011,
    payout: 30,
    startedDaysAgo: 74,
    payment: { method: "PAYPAL", details: { email: "julia@example.com" } },
  },
  {
    email: "publisher2@ccsubmit.io",
    name: "Marcus Diallo",
    company: "Diallo Traffic Network",
    sub3: "marcus",
    clicks: 820,
    rate: 0.008,
    payout: 28,
    startedDaysAgo: 60,
    payment: {
      method: "CRYPTO",
      details: { wallet: "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE" },
    },
  },
  {
    email: "lina@example.com",
    name: "Lina Roussel",
    company: null,
    sub3: "lina",
    clicks: 460,
    rate: 0.013,
    payout: 30,
    startedDaysAgo: 38,
    referredBy: "publisher@ccsubmit.io",
    payment: { method: "PAYPAL", details: { email: "lina@example.com" } },
  },
  {
    email: "tom@example.com",
    name: "Tom Besnard",
    company: null,
    sub3: "tomb",
    clicks: 190,
    rate: 0.006,
    payout: 26,
    startedDaysAgo: 21,
    referredBy: "publisher@ccsubmit.io",
  },
  {
    email: "sofia@example.com",
    name: "Sofia Marin",
    company: "Marin Studio",
    sub3: "sofia",
    clicks: 60,
    rate: 0.004,
    payout: 30,
    startedDaysAgo: 6,
  },
  {
    email: "noah@example.com",
    name: "Noah Petit",
    company: null,
    sub3: "noah",
    clicks: 0,
    rate: 0,
    payout: 0,
    startedDaysAgo: 0,
  },
];

const OFFERS = [
  "BE | CC | Blank v2 (DTC) - €9.99 - Lotus",
  "MultiGeo | CC | Ecom Modest Blank - €2",
  "MultiGeo | CC | Black Blank - €3.95",
  "FR | CC | Sweep iPhone - €1",
];

function today(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

async function main() {
  const passwordHash = await bcrypt.hash("Publisher123!", 12);
  const start = today();

  // Clean slate for everything this script owns.
  await prisma.postbackHit.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.publisherDailyStat.deleteMany();
  await prisma.publisherSub3.deleteMany();

  const idByEmail = new Map<string, string>();

  for (const [index, profile] of PROFILES.entries()) {
    const joined = new Date(
      start.getTime() - (profile.startedDaysAgo + 2) * DAY_MS,
    );
    const user = await prisma.user.upsert({
      where: { email: profile.email },
      update: { name: profile.name, status: "ACTIVE" },
      create: {
        email: profile.email,
        name: profile.name,
        passwordHash,
        role: "PUBLISHER",
        status: "ACTIVE",
        emailVerified: joined,
        createdAt: joined,
      },
    });

    const publisher = await prisma.publisher.upsert({
      where: { userId: user.id },
      update: {
        companyName: profile.company,
        postbackToken: profile.sub3,
        paymentMethod: profile.payment?.method ?? null,
        paymentDetails: profile.payment?.details ?? undefined,
        minPayout: 250,
        createdAt: joined,
        onboardingSeenAt: new Date(),
      },
      create: {
        userId: user.id,
        companyName: profile.company,
        postbackToken: profile.sub3,
        referralCode: `DEMO${index + 1}${profile.sub3.toUpperCase()}`,
        paymentMethod: profile.payment?.method ?? null,
        paymentDetails: profile.payment?.details ?? undefined,
        minPayout: 250,
        createdAt: joined,
        onboardingSeenAt: new Date(),
      },
    });
    idByEmail.set(profile.email, publisher.id);
  }

  for (const profile of PROFILES) {
    if (!profile.referredBy) continue;
    await prisma.publisher.update({
      where: { id: idByEmail.get(profile.email)! },
      data: { referredById: idByEmail.get(profile.referredBy)! },
    });
  }

  // A second sub3 on the biggest account, as in real life.
  await prisma.publisherSub3.create({
    data: { publisherId: idByEmail.get("publisher@ccsubmit.io")!, token: "jc-tiktok" },
  });

  for (const [index, profile] of PROFILES.entries()) {
    if (profile.clicks === 0) continue;
    const publisherId = idByEmail.get(profile.email)!;
    const random = rng(index * 7919 + 17);

    for (let ago = Math.min(DAYS - 1, profile.startedDaysAgo); ago >= 0; ago -= 1) {
      const date = new Date(start.getTime() - ago * DAY_MS);
      // Traffic ramps up from a third of today's level, dips on weekends,
      // and wobbles — a flat line convinces nobody.
      const progress = 1 - ago / Math.max(1, profile.startedDaysAgo);
      const ramp = 0.35 + 0.65 * progress;
      const weekend = [0, 6].includes(date.getUTCDay()) ? 0.78 : 1;
      const noise = 0.75 + random() * 0.5;
      // Today is still in progress.
      const partial = ago === 0 ? 0.55 : 1;

      const clicks = Math.round(profile.clicks * ramp * weekend * noise * partial);
      const hosts = Math.round(clicks * (0.58 + random() * 0.1));
      const expected = clicks * profile.rate * (0.7 + random() * 0.6);
      const conversions = Math.max(0, Math.round(expected));
      const revenue = conversions * profile.payout;

      await prisma.publisherDailyStat.create({
        data: { publisherId, date, clicks, hosts, conversions, revenue },
      });

      // Individual conversions for the last few days, so the feeds have
      // something to show and add up to the day they belong to.
      if (ago <= 3) {
        for (let n = 0; n < conversions; n += 1) {
          const at = new Date(
            date.getTime() +
              Math.floor(random() * (ago === 0 ? 11 : 23) * 3_600_000) +
              Math.floor(random() * 3_600_000),
          );
          await prisma.postbackHit.create({
            data: {
              publisherId,
              status: "ACCEPTED",
              sub3: profile.sub3,
              amount: profile.payout,
              transactionId: `demo-${profile.sub3}-${ago}-${n}`,
              offerName: OFFERS[Math.floor(random() * OFFERS.length)],
              rawQuery: `sub3=${profile.sub3}&payout=${profile.payout}&status=1`,
              createdAt: at,
            },
          });
        }
      }
    }
  }

  // A few calls that were not counted, so the journal is not all green.
  const julia = idByEmail.get("publisher@ccsubmit.io")!;
  await prisma.postbackHit.createMany({
    data: [
      {
        status: "UNKNOWN_TOKEN",
        sub3: "squish",
        amount: 30,
        transactionId: "demo-unknown-1",
        offerName: OFFERS[0],
        rawQuery: "sub3=squish&payout=30",
        message: "Aucun affilié ne porte le sub3 « squish ».",
        createdAt: new Date(Date.now() - 5 * 3_600_000),
      },
      {
        publisherId: julia,
        status: "DUPLICATE",
        sub3: "julia",
        amount: 30,
        transactionId: "demo-julia-1-0",
        offerName: OFFERS[1],
        rawQuery: "sub3=julia&payout=30",
        message: "Transaction demo-julia-1-0 déjà comptée.",
        createdAt: new Date(Date.now() - 26 * 3_600_000),
      },
    ],
  });

  // Payouts: last month settled for the two established accounts.
  const lastMonth = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 3, 12),
  );
  await prisma.payment.createMany({
    data: [
      {
        publisherId: julia,
        amount: 3200,
        method: "PAYPAL",
        status: "PAID",
        note: "Solde d'octobre",
        requestedAt: lastMonth,
        reviewedAt: lastMonth,
        paidAt: lastMonth,
      },
      {
        publisherId: idByEmail.get("publisher2@ccsubmit.io")!,
        amount: 900,
        method: "CRYPTO",
        status: "PAID",
        note: "USDT TRC20",
        requestedAt: lastMonth,
        reviewedAt: lastMonth,
        paidAt: lastMonth,
      },
      {
        publisherId: idByEmail.get("lina@example.com")!,
        amount: 400,
        method: "PAYPAL",
        status: "PENDING",
        requestedAt: new Date(Date.now() - 20 * 3_600_000),
      },
    ],
  });

  await prisma.setting.upsert({
    where: { key: "flow.lastSync" },
    update: {},
    create: {
      key: "flow.lastSync",
      value: {
        ranAt: new Date(Date.now() - 14 * 60_000).toISOString(),
        ok: true,
        rowsWritten: 12,
        rowsReturned: 15,
        unknownSub3: ["squish", "lujelly"],
        from: new Date(start.getTime() - 2 * DAY_MS).toISOString().slice(0, 10),
        to: start.toISOString().slice(0, 10),
      },
    },
  });
  await prisma.setting.upsert({
    where: { key: "flow.apiKey" },
    update: {},
    create: { key: "flow.apiKey", value: "local-demo-key-not-real" },
  });

  const announcements = await prisma.announcement.count();
  if (announcements === 0) {
    await prisma.announcement.create({
      data: {
        title: "Nouvelle offre multi-pays disponible",
        body: "Demande ton lien à l'équipe sur Telegram : elle convertit très bien sur du trafic TikTok.",
        active: true,
      },
    });
  }

  console.log("Demo data written for", PROFILES.length, "affiliates.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
