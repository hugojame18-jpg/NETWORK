import { timingSafeEqual } from "node:crypto";
import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/ip";
import { maybeSyncFlowTraffic } from "@/lib/flow";
import {
  AMOUNT_PARAMS,
  OFFER_PARAMS,
  SUB3_PARAMS,
  TXID_PARAMS,
  parseAmount,
  pickParam,
  postbackSecret,
  todayUtc,
} from "@/lib/postback";
import type { PostbackStatus } from "@/generated/prisma/enums";

// Money arrives through this route; nothing about it may be cached or
// statically evaluated at build time.
export const dynamic = "force-dynamic";

/** Constant-time compare, so the secret can't be recovered one byte at a time. */
function sameSecret(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

interface Outcome {
  status: PostbackStatus;
  httpStatus: number;
  body: string;
  message?: string;
}

const OK: Outcome = { status: "ACCEPTED", httpStatus: 200, body: "OK" };

async function handle(
  request: Request,
  params: URLSearchParams,
): Promise<Response> {
  // The caller is an advertiser's server, not a visitor, so the address is
  // infrastructure rather than personal data and is kept as-is — without it an
  // unexplained stream of postbacks cannot be traced back to its source.
  const ip = getClientIp(request.headers);
  const rawQuery = params.toString();

  // Networks echo back whatever case the sub3 was written in, and tokens are
  // stored lower-cased, so a site set up as "Slime" must still resolve.
  const sub3 = pickParam(params, SUB3_PARAMS)?.toLowerCase() ?? null;
  const transactionId = pickParam(params, TXID_PARAMS);
  const offerName = pickParam(params, OFFER_PARAMS);
  const amount = parseAmount(pickParam(params, AMOUNT_PARAMS));

  async function log(outcome: Outcome, publisherId: string | null) {
    await prisma.postbackHit.create({
      data: {
        publisherId,
        status: outcome.status,
        sub3,
        amount,
        transactionId,
        offerName,
        rawQuery,
        ip,
        message: outcome.message,
      },
    });
    return new NextResponse(outcome.body, {
      status: outcome.httpStatus,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const key = params.get("key") ?? params.get("secret") ?? "";
  const expected = await postbackSecret();
  if (!sameSecret(key, expected)) {
    return log(
      {
        status: "UNAUTHORIZED",
        httpStatus: 401,
        body: "unauthorized",
        message: "Clé absente ou incorrecte.",
      },
      null,
    );
  }

  if (!sub3) {
    return log(
      {
        status: "INVALID",
        httpStatus: 400,
        body: "missing sub3",
        message:
          "Aucun sub3 dans l'appel — impossible de savoir à quel affilié l'attribuer.",
      },
      null,
    );
  }

  const publisher = await prisma.publisher.findUnique({
    where: { postbackToken: sub3 },
    select: { id: true },
  });

  if (!publisher) {
    return log(
      {
        status: "UNKNOWN_TOKEN",
        httpStatus: 400,
        body: "unknown sub3",
        message: `Aucun affilié ne porte le sub3 « ${sub3} ».`,
      },
      null,
    );
  }

  // Networks re-fire postbacks on timeouts and retries. Counting the same
  // transaction twice is counting money twice, so a repeat is recorded and
  // then ignored.
  if (transactionId) {
    const seen = await prisma.postbackHit.findFirst({
      where: { publisherId: publisher.id, transactionId, status: "ACCEPTED" },
      select: { id: true },
    });
    if (seen) {
      return log(
        {
          status: "DUPLICATE",
          httpStatus: 200,
          body: "duplicate",
          message: `Transaction ${transactionId} déjà comptée.`,
        },
        publisher.id,
      );
    }
  }

  // A conversion means traffic is live right now, which is exactly when the
  // click count beside it is worth refreshing. Queued after the response:
  // networks time out postbacks, and this must never be on that path.
  after(maybeSyncFlowTraffic);

  const day = todayUtc();
  const revenue = amount ?? 0;

  // The affiliate dashboard reads PublisherDailyStat and nothing else, so a
  // conversion only exists as far as anyone is concerned once it lands here.
  // Clicks stay at whatever was entered by hand.
  await prisma.publisherDailyStat.upsert({
    where: { publisherId_date: { publisherId: publisher.id, date: day } },
    create: {
      publisherId: publisher.id,
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

  return log(
    amount === null
      ? {
          ...OK,
          message:
            "Conversion comptée sans montant : aucun paramètre de payout reçu.",
        }
      : OK,
    publisher.id,
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  return handle(request, url.searchParams);
}

/** Some networks POST a form body instead of using the query string. */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const params = new URLSearchParams(url.searchParams);

  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as Record<string, unknown>;
      for (const [key, value] of Object.entries(body)) {
        if (value !== null && value !== undefined)
          params.set(key, String(value));
      }
    } else if (contentType.includes("form")) {
      const form = await request.formData();
      for (const [key, value] of form.entries()) params.set(key, String(value));
    }
  } catch {
    // A body we can't parse is not fatal: the query string may carry everything.
  }

  return handle(request, params);
}
