import { NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";
import { prisma } from "@/lib/prisma";
import { getClientIp, getClientCountry, hashIp } from "@/lib/ip";
import { isBotUserAgent, isClickFloodFromIp, isRapidDuplicateClick } from "@/lib/fraud";

interface RouteParams {
  params: Promise<{ token: string }>;
}

function deviceTypeFromUa(userAgent: string): "DESKTOP" | "MOBILE" | "TABLET" | "ALL" {
  const { device } = UAParser(userAgent);
  if (device.type === "mobile") return "MOBILE";
  if (device.type === "tablet") return "TABLET";
  return "DESKTOP";
}

/**
 * Public tracking redirect: this is the URL publishers actually share.
 * Records the click, applies fraud heuristics, sets an attribution cookie,
 * and forwards the visitor to the offer's landing page with a click_id the
 * advertiser echoes back on conversion (see /api/track/conversion).
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { token } = await params;
  const url = new URL(request.url);

  const link = await prisma.affiliateLink.findUnique({
    where: { token },
    include: { offer: true },
  });

  if (!link || link.offer.status !== "ACTIVE") {
    return NextResponse.redirect(new URL("/", url.origin));
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  const ip = getClientIp(request.headers);
  const ipHash = hashIp(ip);
  const country = getClientCountry(request.headers);
  const device = deviceTypeFromUa(userAgent);

  const { browser, os } = UAParser(userAgent);

  const [botDetected, floodDetected, duplicateDetected] = await Promise.all([
    Promise.resolve(isBotUserAgent(userAgent)),
    isClickFloodFromIp(ipHash),
    isRapidDuplicateClick(link.id, ipHash),
  ]);

  const isFraud = botDetected || floodDetected || duplicateDetected;
  const fraudReason = botDetected
    ? "bot_user_agent"
    : floodDetected
      ? "click_flood"
      : duplicateDetected
        ? "duplicate_click"
        : null;

  const click = await prisma.$transaction(async (tx) => {
    const created = await tx.click.create({
      data: {
        linkId: link.id,
        publisherId: link.publisherId,
        offerId: link.offerId,
        cookieId: crypto.randomUUID(),
        ipHash,
        userAgent,
        device,
        browser: browser.name ?? null,
        os: os.name ?? null,
        country,
        referrer: request.headers.get("referer"),
        subId: link.subId || null,
        isFraud,
        fraudReason,
      },
    });
    await tx.affiliateLink.update({ where: { id: link.id }, data: { clickCount: { increment: 1 } } });
    return created;
  });

  const destination = new URL(link.offer.landingUrl);
  destination.searchParams.set("click_id", click.id);

  const response = NextResponse.redirect(destination, { status: 302 });
  response.cookies.set(`ccs_click_${link.offerId}`, click.id, {
    maxAge: link.offer.cookieDays * 24 * 60 * 60,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}
