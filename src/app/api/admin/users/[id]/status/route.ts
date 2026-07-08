import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { logAction } from "@/lib/audit";
import { checkMutationRateLimit } from "@/lib/rate-limit";
import { userStatusSchema } from "@/lib/validations/admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const admin = await requireApiRole("ADMIN");
    if (!(await checkMutationRateLimit(admin.id))) {
      return NextResponse.json({ error: "Trop de requêtes, réessayez plus tard." }, { status: 429 });
    }
    const { id } = await params;

    const body = await request.json().catch(() => null);
    const parsed = userStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    if (id === admin.id) {
      return NextResponse.json({ error: "Vous ne pouvez pas modifier votre propre statut." }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    await prisma.user.update({ where: { id }, data: { status: parsed.data.status } });

    await logAction({
      actorId: admin.id,
      action: `user.status.${parsed.data.status.toLowerCase()}`,
      targetType: "User",
      targetId: id,
      metadata: { email: target.email, previousStatus: target.status, newStatus: parsed.data.status },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[PATCH /api/admin/users/:id/status]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
