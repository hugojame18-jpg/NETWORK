import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { logAction } from "@/lib/audit";
import { checkMutationRateLimit } from "@/lib/rate-limit";
import { sub3AliasSchema } from "@/lib/validations/admin";
import { sub3Holder } from "@/lib/postback";
import { replayUnknownHits } from "@/lib/postback-booking";
import { syncFlowTraffic } from "@/lib/flow";

export const dynamic = "force-dynamic";
// The Flow re-read at the end can take a few seconds on a cold start.
export const maxDuration = 60;

/**
 * Attaches one more sub3 to an affiliate.
 *
 * Three things follow, in this order, because each one is what makes the
 * attachment mean something:
 *   1. the conversions already received under that sub3 — turned away as
 *      "sub3 inconnu" until now — are counted, each on the day it arrived;
 *   2. Flow is re-read, so the clicks of the last few days land on the
 *      account too and the value drops off the "unknown" list;
 *   3. from here on, both arrive on their own.
 */
export async function POST(request: Request) {
  try {
    const admin = await requireApiRole("ADMIN");
    if (!(await checkMutationRateLimit(admin.id))) {
      return NextResponse.json(
        { error: "Trop de requêtes, réessayez plus tard." },
        { status: 429 },
      );
    }

    const parsed = sub3AliasSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides" },
        { status: 400 },
      );
    }
    const { publisherId, token } = parsed.data;

    const publisher = await prisma.publisher.findUnique({
      where: { id: publisherId },
      select: { id: true, user: { select: { name: true } } },
    });
    if (!publisher) {
      return NextResponse.json(
        { error: "Affilié introuvable" },
        { status: 404 },
      );
    }

    const holder = await sub3Holder(token);
    if (holder) {
      return NextResponse.json(
        {
          error:
            holder.publisherId === publisherId
              ? `${holder.name} porte déjà ce sub3.`
              : `Ce sub3 est déjà celui de ${holder.name}.`,
        },
        { status: 409 },
      );
    }

    const alias = await prisma.publisherSub3.create({
      data: { publisherId, token },
      select: { id: true, token: true },
    });

    const replay = await replayUnknownHits(publisherId, token);

    await logAction({
      actorId: admin.id,
      action: "postback.alias.added",
      targetType: "Publisher",
      targetId: publisherId,
      metadata: {
        token,
        replayedConversions: replay.counted,
        replayedAmount: replay.amount,
      },
    });

    // Best effort: the attachment is already done and must not be reported as
    // failed because Flow was slow to answer.
    let trafficSynced = false;
    try {
      const sync = await syncFlowTraffic();
      trafficSynced = sync.ok;
    } catch {
      trafficSynced = false;
    }

    return NextResponse.json({
      success: true,
      alias,
      publisherName: publisher.user.name,
      replay,
      trafficSynced,
    });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("[POST /api/admin/postback/aliases]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
