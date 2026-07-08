import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { campaignSchema } from "@/lib/validations/advertiser";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const user = await requireApiRole("ADVERTISER");
    const advertiser = await prisma.advertiser.findUniqueOrThrow({ where: { userId: user.id } });
    const { id } = await params;

    const body = await request.json().catch(() => null);
    const parsed = campaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const result = await prisma.campaign.updateMany({
      where: { id, advertiserId: advertiser.id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        budget: parsed.data.budget ?? null,
        status: parsed.data.status,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[PATCH /api/advertiser/campaigns/:id]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
