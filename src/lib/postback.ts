import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { appUrl } from "@/lib/app-url";
import { bookingDay } from "@/lib/postback-params";

// The parsing half lives in its own module so it can be tested without a
// database; re-exported so existing imports keep working.
export {
  AMOUNT_PARAMS,
  OFFER_PARAMS,
  STATUS_PARAMS,
  SUB3_PARAMS,
  TXID_PARAMS,
  bookingDay,
  conversionState,
  normalizeSub3,
  parseAmount,
  pickParam,
  withSub3,
} from "@/lib/postback-params";

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
 * The same URL with Affise's macro names already filled in.
 *
 * Flow Network runs on Affise, and so do most of the networks around it. The
 * generic template above has to have its macros swapped by hand, which is one
 * more chance to paste a placeholder instead of a real value — this one is
 * copied once and works.
 */
export function affisePostbackUrl(secret: string): string {
  return `${appUrl()}/api/postback/global?key=${secret}&sub3={sub3}&payout={sum}&txid={transactionid}&offer={offer_name}&status={status}`;
}

/** Today's stats day — see `bookingDay`. */
export function todayUtc(): Date {
  return bookingDay(new Date());
}

/**
 * Which affiliate a sub3 belongs to: their primary token, or one of the
 * additional values attached to their account.
 *
 * Expects the value already normalised (see `normalizeSub3`).
 */
export async function resolveSub3(sub3: string): Promise<string | null> {
  const direct = await prisma.publisher.findUnique({
    where: { postbackToken: sub3 },
    select: { id: true },
  });
  if (direct) return direct.id;

  const alias = await prisma.publisherSub3.findUnique({
    where: { token: sub3 },
    select: { publisherId: true },
  });
  return alias?.publisherId ?? null;
}

/**
 * Who already holds a sub3, by name — for refusing to give it to someone else.
 *
 * Checked across both places a sub3 can live, because the database can only
 * enforce uniqueness inside each one: without this, the same value could be
 * one affiliate's primary token and another's additional one, and a
 * conversion would go to whichever lookup ran first.
 */
export async function sub3Holder(
  sub3: string,
): Promise<{ publisherId: string; name: string } | null> {
  const direct = await prisma.publisher.findUnique({
    where: { postbackToken: sub3 },
    select: { id: true, user: { select: { name: true } } },
  });
  if (direct) return { publisherId: direct.id, name: direct.user.name };

  const alias = await prisma.publisherSub3.findUnique({
    where: { token: sub3 },
    select: {
      publisherId: true,
      publisher: { select: { user: { select: { name: true } } } },
    },
  });
  return alias
    ? { publisherId: alias.publisherId, name: alias.publisher.user.name }
    : null;
}

/** Every sub3 in use, primary and additional, mapped to its affiliate. */
export async function sub3Directory(): Promise<Map<string, string>> {
  const [publishers, aliases] = await Promise.all([
    prisma.publisher.findMany({
      where: { postbackToken: { not: null } },
      select: { id: true, postbackToken: true },
    }),
    prisma.publisherSub3.findMany({
      select: { publisherId: true, token: true },
    }),
  ]);

  const directory = new Map<string, string>();
  for (const alias of aliases) {
    directory.set(alias.token.toLowerCase(), alias.publisherId);
  }
  // Primary tokens last, so they win if the two ever disagree.
  for (const publisher of publishers) {
    directory.set(publisher.postbackToken!.toLowerCase(), publisher.id);
  }
  return directory;
}

/**
 * This affiliate's sub3, creating it if the account never got one.
 *
 * `ensurePostbackTokens()` fills the gaps when the admin opens the postback
 * page, but an affiliate can reach their offers first — and a link handed out
 * without a sub3 produces conversions nobody can be paid for.
 */
export async function publisherPostbackToken(
  publisherId: string,
  known?: string | null,
): Promise<string | null> {
  if (known) return known;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const updated = await prisma.publisher.update({
        where: { id: publisherId },
        data: { postbackToken: newToken() },
        select: { postbackToken: true },
      });
      return updated.postbackToken;
    } catch {
      // Unique collision, or the row vanished — retry with a fresh token.
    }
  }
  return null;
}
