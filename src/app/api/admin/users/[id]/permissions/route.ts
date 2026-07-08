import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { logAction } from "@/lib/audit";
import { checkMutationRateLimit } from "@/lib/rate-limit";
import { permissionGrantSchema } from "@/lib/validations/admin";

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
    const parsed = permissionGrantSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const permission = await prisma.permission.findUnique({ where: { key: parsed.data.permissionKey } });
    if (!permission) {
      return NextResponse.json({ error: "Permission inconnue" }, { status: 404 });
    }

    if (parsed.data.grant) {
      await prisma.userPermission.upsert({
        where: { userId_permissionId: { userId: id, permissionId: permission.id } },
        update: {},
        create: { userId: id, permissionId: permission.id },
      });
    } else {
      await prisma.userPermission.deleteMany({ where: { userId: id, permissionId: permission.id } });
    }

    await logAction({
      actorId: admin.id,
      action: parsed.data.grant ? "permission.grant" : "permission.revoke",
      targetType: "User",
      targetId: id,
      metadata: { permissionKey: parsed.data.permissionKey },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[PATCH /api/admin/users/:id/permissions]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
