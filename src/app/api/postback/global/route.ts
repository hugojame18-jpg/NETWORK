import { timingSafeEqual } from "node:crypto";
import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/ip";
import { maybeSyncFlowTraffic } from "@/lib/flow";
import {
  AMOUNT_PARAMS,
  OFFER_PARAMS,
  STATUS_PARAMS,
  SUB3_PARAMS,
  TXID_PARAMS,
  conversionState,
  normalizeSub3,
  parseAmount,
  pickParam,
  postbackSecret,
  resolveSub3,
} from "@/lib/postback";
import { settle, type Outcome } from "@/lib/postback-booking";

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
  const sub3 = normalizeSub3(pickParam(params, SUB3_PARAMS));
  const rawStatus = pickParam(params, STATUS_PARAMS);
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

  // The sub3 can be the affiliate's primary token or any of the additional
  // values attached to their account — one account, several sites.
  const publisherId = await resolveSub3(sub3);

  if (!publisherId) {
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

  const outcome = await settle({
    publisherId,
    state: conversionState(rawStatus),
    rawStatus,
    transactionId,
    amount,
    at: new Date(),
  });

  // A conversion means traffic is live right now, which is exactly when the
  // click count beside it is worth refreshing. Queued after the response:
  // networks time out postbacks, and this must never be on that path.
  if (outcome.status === "ACCEPTED") after(maybeSyncFlowTraffic);

  return log(outcome, publisherId);
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
