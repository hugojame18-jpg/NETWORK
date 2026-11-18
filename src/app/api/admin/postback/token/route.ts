import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { logAction } from "@/lib/audit";
import { checkMutationRateLimit } from "@/lib/rate-limit";
import { postbackTokenSchema } from "@/lib/validations/admin";

/**
 * Sets an affiliate's sub3 to a chosen value.
 *
 * The generated token works, but only when RevNetwork owns the link. When the
 * traffic is already running under a sub3 the network knows — a site that has
 * been sending "slime" for months — the affiliate has to be made to match it,
 * not the other way round.
 */
export async function PATCH(request: Request) {
  try {
    const admin = await requireApiRole("ADMIN");
    if (!(await checkMutationRateLimit(admin.id))) {
      return NextResponse.json(
        { error: "Trop de requêtes, réessayez plus tard." },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = postbackTokenSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides" },
        { status: 400 },
      );
    }

    const { publisherId, token } = parsed.data;

    const holder = await prisma.publisher.findUnique({
      where: { postbackToken: token },
      select: { id: true, user: { select: { name: true } } },
    });
    if (holder && holder.id !== publisherId) {
      return NextResponse.json(
        { error: `Ce sub3 est déjà celui de ${holder.user.name}.` },
        { status: 409 },
      );
    }

    await prisma.publisher.update({
      where: { id: publisherId },
      data: { postbackToken: token },
    });

    await logAction({
      actorId: admin.id,
      action: "postback.token.changed",
      targetType: "Publisher",
      targetId: publisherId,
    });

    return NextResponse.json({ success: true, token });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("[PATCH /api/admin/postback/token]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
