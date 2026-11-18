import "server-only";
import { prisma } from "@/lib/prisma";
import { toNumber, formatCalendarDate } from "@/lib/format";
import {
  AMOUNT_PARAMS,
  STATUS_PARAMS,
  TXID_PARAMS,
  bookingDay,
  conversionState,
  parseAmount,
  pickParam,
  type ConversionState,
} from "@/lib/postback-params";
import type { PostbackStatus } from "@/generated/prisma/enums";

/**
 * Turning a postback into money on an affiliate's day — or taking it back.
 *
 * One function decides, and both callers go through it: the endpoint when a
 * call arrives, and the replay when a sub3 is attached to an account after
 * calls for it were already turned away. Two copies of this logic would
 * eventually disagree about what counts, and the difference would be money.
 */

export interface Outcome {
  status: PostbackStatus;
  httpStatus: number;
  body: string;
  message?: string;
}

export interface Settlement {
  publisherId: string;
  state: ConversionState;
  /** The status exactly as the network wrote it, for the journal. */
  rawStatus: string | null;
  transactionId: string | null;
  amount: number | null;
  /** When the call arrived — decides which day it is booked against. */
  at: Date;
}

/** Adds one conversion to the affiliate's day. */
async function book(publisherId: string, day: Date, revenue: number) {
  // The affiliate dashboard reads PublisherDailyStat and nothing else, so a
  // conversion only exists as far as anyone is concerned once it lands here.
  await prisma.publisherDailyStat.upsert({
    where: { publisherId_date: { publisherId, date: day } },
    create: {
      publisherId,
      date: day,
      clicks: 0,
      hosts: 0,
      conversions: 1,
      revenue,
    },
    update: {
      conversions: { increment: 1 },
      revenue: { increment: revenue },
    },
  });
}

/**
 * Takes one conversion back off the affiliate's day.
 *
 * Floored at zero on both figures: the day can have been corrected by hand
 * since, and a negative count or a negative revenue on someone's dashboard is
 * a worse outcome than an imperfect cancellation.
 */
async function unbook(publisherId: string, day: Date, revenue: number) {
  await prisma.$transaction(async (tx) => {
    const row = await tx.publisherDailyStat.findUnique({
      where: { publisherId_date: { publisherId, date: day } },
      select: { id: true, conversions: true, revenue: true },
    });
    if (!row) return;
    await tx.publisherDailyStat.update({
      where: { id: row.id },
      data: {
        conversions: Math.max(0, row.conversions - 1),
        revenue: Math.max(0, toNumber(row.revenue) - revenue),
      },
    });
  });
}

/** Decides what a call means and applies it. Returns what to log and answer. */
export async function settle(input: Settlement): Promise<Outcome> {
  const { publisherId, state, transactionId, amount } = input;

  if (state === "pending") {
    return {
      status: "IGNORED",
      httpStatus: 200,
      body: "pending",
      message:
        "Conversion encore en attente chez le réseau : elle sera comptée quand il la validera.",
    };
  }

  if (state === "unknown") {
    return {
      status: "IGNORED",
      httpStatus: 200,
      body: "unknown status",
      message: `Statut « ${input.rawStatus ?? ""} » non reconnu : conversion non comptée.`,
    };
  }

  if (state === "declined") {
    if (!transactionId) {
      return {
        status: "IGNORED",
        httpStatus: 200,
        body: "nothing to reverse",
        message:
          "Annulation sans identifiant de transaction : impossible de savoir laquelle retirer.",
      };
    }

    const original = await prisma.postbackHit.findFirst({
      where: { publisherId, transactionId, status: "ACCEPTED" },
      orderBy: { createdAt: "desc" },
      select: { id: true, amount: true, createdAt: true },
    });
    if (!original) {
      return {
        status: "IGNORED",
        httpStatus: 200,
        body: "nothing to reverse",
        message: `Annulation de ${transactionId} : cette transaction n'a jamais été comptée, ou l'a déjà été retirée.`,
      };
    }

    // What comes off is what went on: the amount of the original call, on the
    // day it was booked — not whatever the cancellation happens to carry.
    const day = bookingDay(original.createdAt);
    const reversed = toNumber(original.amount);
    await unbook(publisherId, day, reversed);
    await prisma.postbackHit.update({
      where: { id: original.id },
      data: {
        // No longer ACCEPTED, so a second cancellation finds nothing to take
        // back, and a later re-approval is counted again instead of being
        // dismissed as a duplicate.
        status: "REVERSED",
        message: "Comptée, puis annulée par le réseau.",
      },
    });

    return {
      status: "REVERSED",
      httpStatus: 200,
      body: "reversed",
      message: `Annulation de ${transactionId} : ${reversed.toFixed(2)} $ retirés du ${formatCalendarDate(day)}.`,
    };
  }

  // Networks re-fire postbacks on timeouts and retries. Counting the same
  // transaction twice is counting money twice, so a repeat is recorded and
  // then ignored.
  if (transactionId) {
    const seen = await prisma.postbackHit.findFirst({
      where: { publisherId, transactionId, status: "ACCEPTED" },
      select: { id: true },
    });
    if (seen) {
      return {
        status: "DUPLICATE",
        httpStatus: 200,
        body: "duplicate",
        message: `Transaction ${transactionId} déjà comptée.`,
      };
    }
  }

  await book(publisherId, bookingDay(input.at), amount ?? 0);

  return {
    status: "ACCEPTED",
    httpStatus: 200,
    body: "OK",
    message:
      amount === null
        ? "Conversion comptée sans montant : aucun paramètre de payout reçu."
        : undefined,
  };
}

export interface ReplaySummary {
  /** Conversions that are now counted for the affiliate. */
  counted: number;
  /** Gross those conversions carried. */
  amount: number;
  /** Calls looked at, counted or not. */
  examined: number;
}

/**
 * Counts the calls that were turned away because nobody owned their sub3.
 *
 * When a sub3 is attached to an account, the conversions that already arrived
 * under it are sitting in the journal as "sub3 inconnu" — real sales, refused
 * only because the account did not know the value yet. They are settled here
 * in the order they arrived, through the same rules as a live call, and each
 * lands on the day it was actually received.
 */
export async function replayUnknownHits(
  publisherId: string,
  sub3: string,
): Promise<ReplaySummary> {
  const hits = await prisma.postbackHit.findMany({
    where: {
      status: "UNKNOWN_TOKEN",
      sub3: { equals: sub3, mode: "insensitive" },
    },
    orderBy: { createdAt: "asc" },
    select: { id: true, rawQuery: true, createdAt: true },
  });

  const summary: ReplaySummary = { counted: 0, amount: 0, examined: 0 };

  for (const hit of hits) {
    // Re-read from the query string as it arrived, so a call is judged by
    // today's rules rather than by whatever was parsed out of it at the time.
    const params = new URLSearchParams(hit.rawQuery);
    const rawStatus = pickParam(params, STATUS_PARAMS);
    const amount = parseAmount(pickParam(params, AMOUNT_PARAMS));

    // The row is still marked "sub3 inconnu" while it is judged, so the
    // duplicate check — which looks for ACCEPTED rows — cannot match itself.
    const outcome = await settle({
      publisherId,
      state: conversionState(rawStatus),
      rawStatus,
      transactionId: pickParam(params, TXID_PARAMS),
      amount,
      at: hit.createdAt,
    });

    await prisma.postbackHit.update({
      where: { id: hit.id },
      data: {
        publisherId,
        status: outcome.status,
        message:
          outcome.status === "ACCEPTED"
            ? "Comptée après coup, une fois le sub3 rattaché."
            : outcome.message,
      },
    });

    summary.examined += 1;
    if (outcome.status === "ACCEPTED") {
      summary.counted += 1;
      summary.amount += amount ?? 0;
    }
  }

  return summary;
}
