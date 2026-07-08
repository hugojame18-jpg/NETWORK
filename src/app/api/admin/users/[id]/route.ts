import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { logAction } from "@/lib/audit";
import { checkMutationRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
});

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const admin = await requireApiRole("ADMIN");
    if (!(await checkMutationRateLimit(admin.id))) {
      return NextResponse.json({ error: "Trop de requêtes, réessayez plus tard." }, { status: 429 });
    }
    const { id } = await params;

    const body = await request.json().catch(() => null);
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    await prisma.user.update({ where: { id }, data: { name: parsed.data.name } });
    await logAction({ actorId: admin.id, action: "user.update", targetType: "User", targetId: id, metadata: parsed.data });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[PATCH /api/admin/users/:id]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const admin = await requireApiRole("ADMIN");
    if (!(await checkMutationRateLimit(admin.id))) {
      return NextResponse.json({ error: "Trop de requêtes, réessayez plus tard." }, { status: 429 });
    }
    const { id } = await params;

    if (id === admin.id) {
      return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte." }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    await logAction({
      actorId: admin.id,
      action: "user.delete",
      targetType: "User",
      targetId: id,
      metadata: { email: target.email, role: target.role },
    });

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[DELETE /api/admin/users/:id]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
