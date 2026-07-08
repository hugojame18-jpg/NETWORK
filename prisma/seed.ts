import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { DeviceType } from "../src/generated/prisma/enums";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const PERMISSIONS = [
  { key: "affiliates.manage", description: "Approuver, suspendre, bannir ou modifier des publishers" },
  { key: "advertisers.manage", description: "Gérer les comptes annonceurs" },
  { key: "offers.manage", description: "Créer, valider ou archiver des offres" },
  { key: "campaigns.manage", description: "Gérer les campagnes" },
  { key: "payments.manage", description: "Approuver ou rejeter les paiements" },
  { key: "commissions.manage", description: "Ajuster les commissions" },
  { key: "users.manage", description: "Gérer les utilisateurs et les rôles" },
  { key: "settings.manage", description: "Modifier les paramètres de la plateforme" },
  { key: "logs.view", description: "Consulter les logs d'audit" },
] as const;

async function hash(password: string) {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("Seeding database...");

  await prisma.permission.createMany({
    data: PERMISSIONS.map((p) => ({ key: p.key, description: p.description })),
    skipDuplicates: true,
  });

  // --- Admin ---------------------------------------------------------------
  const admin = await prisma.user.upsert({
    where: { email: "admin@ccsubmit.io" },
    update: {},
    create: {
      email: "admin@ccsubmit.io",
      name: "Alex Moreau",
      passwordHash: await hash("Admin123!"),
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  const allPermissions = await prisma.permission.findMany();
  await prisma.userPermission.createMany({
    data: allPermissions.map((p) => ({ userId: admin.id, permissionId: p.id })),
    skipDuplicates: true,
  });

  // --- Advertisers -----------------------------------------------------------
  const advertiserUser1 = await prisma.user.upsert({
    where: { email: "advertiser@ccsubmit.io" },
    update: {},
    create: {
      email: "advertiser@ccsubmit.io",
      name: "Nova Finance Corp",
      passwordHash: await hash("Advertiser123!"),
      role: "ADVERTISER",
      status: "ACTIVE",
      emailVerified: new Date(),
      advertiser: {
        create: {
          companyName: "Nova Finance Corp",
          website: "https://novafinance.example.com",
        },
      },
    },
    include: { advertiser: true },
  });

  const advertiser1 = advertiserUser1.advertiser!;

  const campaign1 = await prisma.campaign.create({
    data: {
      advertiserId: advertiser1.id,
      name: "Nova Card Q3",
      description: "Acquisition de nouveaux porteurs de carte Nova Platinum",
      status: "ACTIVE",
      budget: 50000,
      spent: 12500,
      startDate: new Date("2026-04-01"),
    },
  });

  const offersData = [
    {
      name: "Nova Platinum Card - Application",
      slug: "nova-platinum-card",
      description: "L'utilisateur soumet une demande complète pour la carte Nova Platinum.",
      category: "Finance",
      payout: 45,
      payoutType: "CPA" as const,
      countries: ["US", "CA", "FR"],
      devices: ["DESKTOP", "MOBILE"] as DeviceType[],
      landingUrl: "https://novafinance.example.com/apply/platinum",
      status: "ACTIVE" as const,
    },
    {
      name: "Nova Business Line of Credit",
      slug: "nova-business-credit",
      description: "Formulaire de pré-qualification pour une ligne de crédit professionnelle.",
      category: "Finance",
      payout: 60,
      payoutType: "CPL" as const,
      countries: ["US", "CA"],
      devices: ["DESKTOP"] as DeviceType[],
      landingUrl: "https://novafinance.example.com/apply/business",
      status: "ACTIVE" as const,
    },
    {
      name: "Nova Rewards Signup",
      slug: "nova-rewards-signup",
      description: "Inscription gratuite au programme de fidélité Nova Rewards.",
      category: "Loyalty",
      payout: 8,
      payoutType: "CPL" as const,
      countries: [],
      devices: ["ALL"] as DeviceType[],
      landingUrl: "https://novafinance.example.com/rewards",
      status: "PENDING" as const,
    },
  ];

  const offers = [];
  for (const o of offersData) {
    const offer = await prisma.offer.upsert({
      where: { slug: o.slug },
      update: {},
      create: { ...o, advertiserId: advertiser1.id, campaignId: campaign1.id },
    });
    offers.push(offer);
  }

  // --- Publishers ------------------------------------------------------------
  const publisherSeeds = [
    { email: "publisher@ccsubmit.io", name: "Julia Chen", company: "Chen Media Buying" },
    { email: "publisher2@ccsubmit.io", name: "Marcus Diallo", company: "Diallo Traffic Network" },
  ];

  const publishers = [];
  for (const p of publisherSeeds) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        email: p.email,
        name: p.name,
        passwordHash: await hash("Publisher123!"),
        role: "PUBLISHER",
        status: "ACTIVE",
        emailVerified: new Date(),
        publisher: {
          create: {
            companyName: p.company,
            applicationStatus: "APPROVED",
            paymentMethod: "PAYPAL",
            paymentDetails: { email: p.email },
            balance: 0,
            totalEarned: 0,
          },
        },
      },
      include: { publisher: true },
    });
    publishers.push(user.publisher!);
  }

  const [publisher1, publisher2] = publishers;

  // --- Affiliate links, clicks, leads, conversions, commissions ---------------
  let totalEarnedP1 = 0;

  for (const offer of offers.filter((o) => o.status === "ACTIVE")) {
    const link = await prisma.affiliateLink.upsert({
      where: { publisherId_offerId_subId: { publisherId: publisher1.id, offerId: offer.id, subId: "" } },
      update: {},
      create: {
        token: `${publisher1.id.slice(-6)}-${offer.id.slice(-6)}`,
        publisherId: publisher1.id,
        offerId: offer.id,
        subId: "",
        label: `${offer.name} — lien principal`,
      },
    });

    const now = Date.now();
    for (let i = 0; i < 40; i++) {
      const createdAt = new Date(now - i * 3 * 60 * 60 * 1000);
      const click = await prisma.click.create({
        data: {
          linkId: link.id,
          publisherId: publisher1.id,
          offerId: offer.id,
          cookieId: `seed-cookie-${offer.id}-${i}`,
          ipHash: `seed-ip-hash-${i % 17}`,
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SeedBot/1.0",
          device: i % 3 === 0 ? "MOBILE" : "DESKTOP",
          browser: i % 2 === 0 ? "Chrome" : "Safari",
          os: i % 2 === 0 ? "Windows" : "macOS",
          country: offer.countries[i % Math.max(offer.countries.length, 1)] ?? "US",
          referrer: "https://chenmediabuying.example.com",
          createdAt,
        },
      });

      await prisma.affiliateLink.update({
        where: { id: link.id },
        data: { clickCount: { increment: 1 } },
      });

      if (i % 6 === 0) {
        const lead = await prisma.lead.create({
          data: {
            clickId: click.id,
            linkId: link.id,
            offerId: offer.id,
            publisherId: publisher1.id,
            status: "APPROVED",
            createdAt,
          },
        });

        const payout = Number(offer.payout);
        const conversion = await prisma.conversion.create({
          data: {
            leadId: lead.id,
            offerId: offer.id,
            publisherId: publisher1.id,
            payout,
            status: "APPROVED",
            createdAt,
          },
        });

        await prisma.commission.create({
          data: {
            conversionId: conversion.id,
            publisherId: publisher1.id,
            amount: payout,
            status: "APPROVED",
            createdAt,
          },
        });

        totalEarnedP1 += payout;
      }
    }
  }

  await prisma.publisher.update({
    where: { id: publisher1.id },
    data: { balance: totalEarnedP1, totalEarned: totalEarnedP1 },
  });

  // publisher2 just joined: one fresh link, a handful of clicks, no conversions yet.
  const freshOffer = offers.find((o) => o.status === "ACTIVE");
  if (freshOffer) {
    const link2 = await prisma.affiliateLink.upsert({
      where: { publisherId_offerId_subId: { publisherId: publisher2.id, offerId: freshOffer.id, subId: "" } },
      update: {},
      create: {
        token: `${publisher2.id.slice(-6)}-${freshOffer.id.slice(-6)}`,
        publisherId: publisher2.id,
        offerId: freshOffer.id,
        subId: "",
        label: `${freshOffer.name} — lien principal`,
      },
    });

    for (let i = 0; i < 6; i++) {
      await prisma.click.create({
        data: {
          linkId: link2.id,
          publisherId: publisher2.id,
          offerId: freshOffer.id,
          cookieId: `seed-cookie-p2-${i}`,
          ipHash: `seed-ip-hash-p2-${i}`,
          userAgent: "Mozilla/5.0 (Linux; Android 14) SeedBot/1.0",
          device: "MOBILE",
          browser: "Chrome",
          os: "Android",
          country: "US",
          referrer: "https://diallotraffic.example.com",
          createdAt: new Date(Date.now() - i * 2 * 60 * 60 * 1000),
        },
      });
    }
    await prisma.affiliateLink.update({ where: { id: link2.id }, data: { clickCount: { increment: 6 } } });
  }

  await prisma.payment.create({
    data: {
      publisherId: publisher1.id,
      amount: Math.min(totalEarnedP1, 150),
      method: "PAYPAL",
      status: "PAID",
      requestedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      reviewedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
      paidAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: publisher1.userId,
        type: "CONVERSION",
        title: "Nouvelle conversion approuvée",
        body: "Votre conversion sur \"Nova Platinum Card\" a été approuvée.",
      },
      {
        userId: publisher1.userId,
        type: "PAYMENT",
        title: "Paiement envoyé",
        body: "Un paiement de 150 $ a été envoyé sur votre compte PayPal.",
      },
      {
        userId: advertiserUser1.id,
        type: "INFO",
        title: "Nouvelle candidature publisher",
        body: "Julia Chen a rejoint la campagne Nova Card Q3.",
      },
    ],
  });

  await prisma.setting.upsert({
    where: { key: "platform" },
    update: {},
    create: {
      key: "platform",
      value: {
        siteName: "CC Submit",
        supportEmail: "support@ccsubmit.io",
        defaultCookieDays: 30,
        minPayout: 50,
        maintenanceMode: false,
      },
    },
  });

  console.log("Seed complete.");
  console.log("Admin login:      admin@ccsubmit.io / Admin123!");
  console.log("Advertiser login: advertiser@ccsubmit.io / Advertiser123!");
  console.log("Publisher login:  publisher@ccsubmit.io / Publisher123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
