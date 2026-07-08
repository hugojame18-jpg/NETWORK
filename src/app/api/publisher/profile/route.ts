import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { updateProfileSchema } from "@/lib/validations/publisher";

export async function PATCH(request: Request) {
  try {
    const user = await requireApiRole("PUBLISHER");

    const body = await request.json().catch(() => null);
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { name: parsed.data.name } }),
      prisma.publisher.update({
        where: { userId: user.id },
        data: {
          companyName: parsed.data.companyName || null,
          website: parsed.data.website || null,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[PATCH /api/publisher/profile]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
