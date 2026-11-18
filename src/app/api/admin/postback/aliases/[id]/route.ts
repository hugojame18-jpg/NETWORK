import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { logAction } from "@/lib/audit";
import { checkMutationRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Detaches an additional sub3 from an affiliate.
 *
 * Only the future changes: what was already counted under it stays on their
 * days and in their balance. Taking past earnings back off an account is a
 * correction to make deliberately on the stats, never a side effect of
 * tidying a list.
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const admin = await requireApiRole("ADMIN");
    if (!(await checkMutationRateLimit(admin.id))) {
      return NextResponse.json(
        { error: "Trop de requêtes, réessayez plus tard." },
        { status: 429 },
      );
    }

    const { id } = await params;
    const alias = await prisma.publisherSub3.findUnique({
      where: { id },
      select: { id: true, token: true, publisherId: true },
    });
    if (!alias) {
      return NextResponse.json({ error: "sub3 introuvable" }, { status: 404 });
    }

    await prisma.publisherSub3.delete({ where: { id } });

    await logAction({
      actorId: admin.id,
      action: "postback.alias.removed",
      targetType: "Publisher",
      targetId: alias.publisherId,
      metadata: { token: alias.token },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("[DELETE /api/admin/postback/aliases/:id]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
