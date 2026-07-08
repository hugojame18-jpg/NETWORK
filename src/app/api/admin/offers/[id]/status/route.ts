import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { logAction } from "@/lib/audit";
import { checkMutationRateLimit } from "@/lib/rate-limit";
import { offerStatusSchema } from "@/lib/validations/admin";

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
    const parsed = offerStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const offer = await prisma.offer.update({ where: { id }, data: { status: parsed.data.status } });

    await prisma.notification.create({
      data: {
        userId: (await prisma.advertiser.findUniqueOrThrow({ where: { id: offer.advertiserId } })).userId,
        type: "OFFER",
        title: `Offre ${parsed.data.status === "ACTIVE" ? "approuvée" : parsed.data.status.toLowerCase()}`,
        body: `Votre offre "${offer.name}" est maintenant "${parsed.data.status}".`,
      },
    });

    await logAction({
      actorId: admin.id,
      action: `offer.status.${parsed.data.status.toLowerCase()}`,
      targetType: "Offer",
      targetId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[PATCH /api/admin/offers/:id/status]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
