import "server-only";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import {
  SITE_OFFER_KEY,
  siteOfferSchema,
  type SiteOffer,
} from "@/lib/validations/site-offer";

export const MAX_SITES_PER_AFFILIATE = 10;

/** The offer settings, or null while any field is still missing. */
export async function getSiteOffer(): Promise<SiteOffer | null> {
  const row = await prisma.setting.findUnique({ where: { key: SITE_OFFER_KEY } });
  if (!row) return null;
  const parsed = siteOfferSchema.safeParse(row.value);
  return parsed.success ? parsed.data : null;
}

/** The stored settings even when incomplete, to refill the admin form. */
export async function getSiteOfferDraft(): Promise<Partial<SiteOffer>> {
  const row = await prisma.setting.findUnique({ where: { key: SITE_OFFER_KEY } });
  const value = row?.value;
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Partial<SiteOffer>)
    : {};
}

/**
 * A site and its sub3, together: the sub3 is also attached to the affiliate
 * as an additional value, which is how a sale coming back on the postback
 * finds the account.
 */
export async function createAffiliateSite(args: {
  publisherId: string;
  name: string;
  headline: string;
}) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const sub3 = randomBytes(6).toString("hex");
    try {
      return await prisma.$transaction(async (tx) => {
        const clash = await tx.publisher.findUnique({
          where: { postbackToken: sub3 },
          select: { id: true },
        });
        if (clash) throw new Error("sub3 taken");
        await tx.publisherSub3.create({
          data: { publisherId: args.publisherId, token: sub3 },
        });
        return tx.affiliateSite.create({ data: { ...args, sub3 } });
      });
    } catch {
      // A collision on a 48-bit value: draw another.
    }
  }
  throw new Error("Impossible de créer un sub3 unique.");
}
