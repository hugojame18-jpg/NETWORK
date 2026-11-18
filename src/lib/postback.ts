import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { appUrl } from "@/lib/app-url";

const SECRET_KEY = "postback.secret";

/**
 * The sub3 value carried by an affiliate's traffic. Twelve hex characters:
 * short enough to paste into a campaign by hand, wide enough (48 bits) that
 * nobody finds a live one by trying.
 */
function newToken(): string {
  return randomBytes(6).toString("hex");
}

/** A longer secret, since this one guards the endpoint itself. */
function newSecret(): string {
  return randomBytes(16).toString("hex");
}

/**
 * The shared key every postback must carry.
 *
 * Kept in the database rather than an environment variable on purpose: it is
 * generated on first use, so the endpoint is never briefly unprotected while
 * someone remembers to set a variable, and it can be read back in the admin
 * without a deploy.
 */
export async function postbackSecret(): Promise<string> {
  const existing = await prisma.setting.findUnique({
    where: { key: SECRET_KEY },
  });
  if (
    existing &&
    typeof existing.value === "string" &&
    existing.value.length > 0
  ) {
    return existing.value;
  }

  const secret = newSecret();
  await prisma.setting.upsert({
    where: { key: SECRET_KEY },
    create: { key: SECRET_KEY, value: secret },
    update: { value: secret },
  });
  return secret;
}

/** Invalidates every postback URL already handed out. */
export async function rotatePostbackSecret(): Promise<string> {
  const secret = newSecret();
  await prisma.setting.upsert({
    where: { key: SECRET_KEY },
    create: { key: SECRET_KEY, value: secret },
    update: { value: secret },
  });
  return secret;
}

/**
 * Gives every affiliate a sub3 token, and returns how many were missing one.
 *
 * Assigned lazily rather than backfilled in the migration: accounts created
 * before postbacks existed still need one, and so will any account created by
 * a code path that forgets to.
 */
export async function ensurePostbackTokens(): Promise<number> {
  const missing = await prisma.publisher.findMany({
    where: { postbackToken: null },
    select: { id: true },
  });

  for (const publisher of missing) {
    // One at a time: a collision on the unique index is astronomically
    // unlikely, but retrying one row is cheaper than losing a whole batch.
    let attempts = 0;
    while (attempts < 5) {
      try {
        await prisma.publisher.update({
          where: { id: publisher.id },
          data: { postbackToken: newToken() },
        });
        break;
      } catch {
        attempts += 1;
      }
    }
  }

  return missing.length;
}

/** The URL to hand to an upstream network, with the macros it has to fill in. */
export function postbackUrlTemplate(secret: string): string {
  return `${appUrl()}/api/postback/global?key=${secret}&sub3={sub3}&payout={payout}&txid={transaction_id}`;
}

/**
 * Parameter names seen in the wild for the same three things. Networks each
 * pick their own, and a conversion silently worth zero because the amount
 * arrived as `sum` instead of `payout` is exactly the kind of bug nobody
 * notices for a month.
 */
export const AMOUNT_PARAMS = [
  "payout",
  "amount",
  "sum",
  "revenue",
  "value",
  "price",
];
export const TXID_PARAMS = [
  "txid",
  "transaction_id",
  "transactionid",
  "tid",
  "clickid",
  "click_id",
];
export const SUB3_PARAMS = ["sub3", "sub_id3", "subid3", "s3", "aff_sub3"];
export const OFFER_PARAMS = [
  "offer",
  "offer_name",
  "campaign",
  "campaign_name",
];

/** First present, non-empty value among `names`. */
export function pickParam(
  params: URLSearchParams,
  names: string[],
): string | null {
  for (const name of names) {
    const value = params.get(name);
    if (value !== null && value.trim() !== "") return value.trim();
  }
  return null;
}

/** Parses an amount that may arrive as "30", "30.00", "30,00" or "$30". */
export function parseAmount(raw: string | null): number | null {
  if (raw === null) return null;
  const cleaned = raw.replace(/[^0-9.,-]/g, "").replace(",", ".");
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? value : null;
}

/** Today at UTC midnight, matching how PublisherDailyStat stores its DATE. */
export function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}
