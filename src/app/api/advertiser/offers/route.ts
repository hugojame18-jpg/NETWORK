import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { offerSchema } from "@/lib/validations/advertiser";
import { slugify } from "@/lib/slug";

async function uniqueSlug(name: string) {
  const base = slugify(name) || "offre";
  let slug = base;
  let suffix = 1;
  while (await prisma.offer.findUnique({ where: { slug }, select: { id: true } })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return slug;
}

export async function POST(request: Request) {
  try {
    const user = await requireApiRole("ADVERTISER");
    const advertiser = await prisma.advertiser.findUniqueOrThrow({ where: { userId: user.id } });

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

    const slug = await uniqueSlug(parsed.data.name);

    const offer = await prisma.offer.create({
      data: {
        advertiserId: advertiser.id,
        campaignId: parsed.data.campaignId || null,
        name: parsed.data.name,
        slug,
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
        status: "PENDING",
      },
    });

    return NextResponse.json({ offer });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[POST /api/advertiser/offers]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
