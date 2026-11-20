import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { logAction } from "@/lib/audit";
import { siteOfferSchema, SITE_OFFER_KEY } from "@/lib/validations/site-offer";

/** What the generated sites say about the offer. Everything is required. */
export async function PUT(request: Request) {
  try {
    const admin = await requireApiRole("ADMIN");
    const parsed = siteOfferSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides" },
        { status: 400 },
      );
    }
    await prisma.setting.upsert({
      where: { key: SITE_OFFER_KEY },
      create: { key: SITE_OFFER_KEY, value: parsed.data },
      update: { value: parsed.data },
    });
    await logAction({
      actorId: admin.id,
      action: "sites.offer.updated",
      targetType: "Setting",
      targetId: SITE_OFFER_KEY,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("[PUT /api/admin/site-offer]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
