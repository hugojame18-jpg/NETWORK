import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { updateAdvertiserProfileSchema } from "@/lib/validations/advertiser";

export async function PATCH(request: Request) {
  try {
    const user = await requireApiRole("ADVERTISER");

    const body = await request.json().catch(() => null);
    const parsed = updateAdvertiserProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { name: parsed.data.name } }),
      prisma.advertiser.update({
        where: { userId: user.id },
        data: { companyName: parsed.data.companyName, website: parsed.data.website || null },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[PATCH /api/advertiser/profile]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
