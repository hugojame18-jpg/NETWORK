import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { toNumber } from "@/lib/format";

const postbackSchema = z.object({
  click_id: z.string().min(1),
  signature: z.string().min(1),
  status: z.enum(["APPROVED", "PENDING", "REJECTED"]).optional(),
  payout: z.coerce.number().positive().optional(),
});

function verifySignature(clickId: string, signature: string): boolean {
  const secret = process.env.TRACKING_POSTBACK_SECRET;
  if (!secret) return false;

  const expected = createHmac("sha256", secret).update(clickId).digest("hex");
  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(signature);
  if (expectedBuf.length !== providedBuf.length) return false;
  return timingSafeEqual(expectedBuf, providedBuf);
}

/**
 * Server-to-server postback: advertisers call this once a lead they received
 * (via `click_id`, echoed back from the redirect in /api/track/click) turns
 * into a real conversion. Authenticated with an HMAC signature rather than a
 * session, since the caller is the advertiser's backend, not a browser.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const limit = await rateLimit(`track:conversion:${ip}`, { limit: 120, windowSeconds: 60 });
  if (!limit.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const url = new URL(request.url);
  const bodyJson = await request.json().catch(() => ({}));
  const merged = {
    click_id: url.searchParams.get("click_id") ?? bodyJson.click_id,
    signature: url.searchParams.get("signature") ?? bodyJson.signature,
    status: url.searchParams.get("status") ?? bodyJson.status,
    payout: url.searchParams.get("payout") ?? bodyJson.payout,
  };

  const parsed = postbackSchema.safeParse(merged);
  if (!parsed.success) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  if (!verifySignature(parsed.data.click_id, parsed.data.signature)) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  }

  const click = await prisma.click.findUnique({
    where: { id: parsed.data.click_id },
    include: { offer: true, link: true },
  });
  if (!click) {
    return NextResponse.json({ error: "Clic introuvable" }, { status: 404 });
  }

  const cookieExpiry = new Date(click.createdAt.getTime() + click.offer.cookieDays * 24 * 60 * 60 * 1000);
  if (cookieExpiry < new Date()) {
    return NextResponse.json({ error: "Fenêtre d'attribution expirée" }, { status: 410 });
  }

  const existingLead = await prisma.lead.findUnique({ where: { clickId: click.id } });
  if (existingLead) {
    return NextResponse.json({ error: "Conversion déjà enregistrée pour ce clic" }, { status: 409 });
  }

  const status = parsed.data.status ?? "APPROVED";
  const payout = parsed.data.payout ?? toNumber(click.offer.payout);

  const { conversion } = await prisma.$transaction(async (tx) => {
    const lead = await tx.lead.create({
      data: {
        clickId: click.id,
        linkId: click.linkId,
        offerId: click.offerId,
        publisherId: click.publisherId,
        status,
      },
    });

    const createdConversion = await tx.conversion.create({
      data: {
        leadId: lead.id,
        offerId: click.offerId,
        publisherId: click.publisherId,
        payout,
        status,
      },
    });

    if (status === "APPROVED") {
      const commission = await tx.commission.create({
        data: {
          conversionId: createdConversion.id,
          publisherId: click.publisherId,
          amount: payout,
          status: "APPROVED",
        },
      });

      await tx.publisher.update({
        where: { id: click.publisherId },
        data: { balance: { increment: payout }, totalEarned: { increment: payout } },
      });

      await tx.notification.create({
        data: {
          userId: (await tx.publisher.findUniqueOrThrow({ where: { id: click.publisherId } })).userId,
          type: "CONVERSION",
          title: "Nouvelle conversion approuvée",
          body: `Votre conversion sur "${click.offer.name}" a été approuvée (+${payout.toFixed(2)} $).`,
        },
      });

      return { conversion: createdConversion, commission };
    }

    return { conversion: createdConversion, commission: null };
  });

  return NextResponse.json({ success: true, conversionId: conversion.id });
}
