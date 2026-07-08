import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { logAction } from "@/lib/audit";
import { checkMutationRateLimit } from "@/lib/rate-limit";
import { platformSettingsSchema } from "@/lib/validations/admin";

export async function PATCH(request: Request) {
  try {
    const admin = await requireApiRole("ADMIN");
    if (!(await checkMutationRateLimit(admin.id))) {
      return NextResponse.json({ error: "Trop de requêtes, réessayez plus tard." }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    const parsed = platformSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    await prisma.setting.upsert({
      where: { key: "platform" },
      update: { value: parsed.data },
      create: { key: "platform", value: parsed.data },
    });

    await logAction({ actorId: admin.id, action: "settings.update", targetType: "Setting", targetId: "platform" });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[PATCH /api/admin/settings]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
