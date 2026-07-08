import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { offerSchema } from "@/lib/validations/advertiser";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const user = await requireApiRole("ADVERTISER");
    const advertiser = await prisma.advertiser.findUniqueOrThrow({ where: { userId: user.id } });
    const { id } = await params;

    const body = await request.json().catch(() => null);
    const parsed = offerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", issues: parsed.error.flatten() }, { status: 400 });
    }

    if (parsed.data.campaignId) {
      const campaign = await prisma.campaign.findFirst({
        where: { id: parsed.data.campaignId, advertiserId: advertiser.id },
      });
      if (!campaign) {
        return NextResponse.json({ error: "Campagne invalide" }, { status: 400 });
      }
    }

    // Editing an already-approved offer sends it back for review — advertisers
    // shouldn't be able to silently change payout/terms on a live offer.
    const existing = await prisma.offer.findFirst({ where: { id, advertiserId: advertiser.id } });
    if (!existing) {
      return NextResponse.json({ error: "Offre introuvable" }, { status: 404 });
    }
    const nextStatus = existing.status === "ACTIVE" ? "PENDING" : existing.status;

    await prisma.offer.update({
      where: { id },
      data: {
        campaignId: parsed.data.campaignId || null,
        name: parsed.data.name,
        description: parsed.data.description,
        category: parsed.data.category,
        payout: parsed.data.payout,
        payoutType: parsed.data.payoutType,
        countries: parsed.data.countries,
        devices: parsed.data.devices,
        restrictions: parsed.data.restrictions || null,
        landingUrl: parsed.data.landingUrl,
        previewUrl: parsed.data.previewUrl || null,
        creativeUrl: parsed.data.creativeUrl || null,
        cookieDays: parsed.data.cookieDays,
        dailyCap: parsed.data.dailyCap ?? null,
        status: nextStatus,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[PATCH /api/advertiser/offers/:id]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
