import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { campaignSchema } from "@/lib/validations/advertiser";

export async function POST(request: Request) {
  try {
    const user = await requireApiRole("ADVERTISER");
    const advertiser = await prisma.advertiser.findUniqueOrThrow({ where: { userId: user.id } });

    const body = await request.json().catch(() => null);
    const parsed = campaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", issues: parsed.error.flatten() }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        advertiserId: advertiser.id,
        name: parsed.data.name,
        description: parsed.data.description || null,
        budget: parsed.data.budget ?? null,
        status: parsed.data.status,
      },
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[POST /api/advertiser/campaigns]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
