import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { logAction } from "@/lib/audit";
import { checkMutationRateLimit } from "@/lib/rate-limit";
import { adminOfferSchema } from "@/lib/validations/admin";
import { slugify } from "@/lib/slug";

/** Landing page stored until the real link is known — never sent to traffic. */
const PLACEHOLDER_LANDING_URL = "https://revnetwork.live/lien-a-venir";

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

/**
 * The network runs its own offers, so an Advertiser row is still required by
 * the schema. One "house" advertiser is attached to the admin's own user
 * account (a User may hold both a publisher and an advertiser profile).
 */
async function houseAdvertiserId(adminUserId: string) {
  const advertiser = await prisma.advertiser.upsert({
    where: { userId: adminUserId },
    create: { userId: adminUserId, companyName: "RevNetwork" },
    update: {},
    select: { id: true },
  });
  return advertiser.id;
}

export async function POST(request: Request) {
  try {
    const admin = await requireApiRole("ADMIN");
    if (!(await checkMutationRateLimit(admin.id))) {
      return NextResponse.json({ error: "Trop de requêtes, réessayez plus tard." }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    const parsed = adminOfferSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Données invalides" }, { status: 400 });
    }

    const offer = await prisma.offer.create({
      data: {
        advertiserId: await houseAdvertiserId(admin.id),
        name: parsed.data.name,
        slug: await uniqueSlug(parsed.data.name),
        description: parsed.data.description || parsed.data.name,
        category: parsed.data.category,
        payout: parsed.data.payout,
        payoutType: parsed.data.payoutType,
        landingUrl: parsed.data.landingUrl || PLACEHOLDER_LANDING_URL,
        countries: [],
        devices: ["ALL"],
        // Created by the admin, who is also the approver — no review needed.
        status: "ACTIVE",
      },
    });

    await logAction({
      actorId: admin.id,
      action: "offer.create",
      targetType: "Offer",
      targetId: offer.id,
    });

    return NextResponse.json({ offer });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[POST /api/admin/offers]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
