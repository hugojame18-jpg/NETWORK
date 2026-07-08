import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { generateLinkSchema } from "@/lib/validations/publisher";

export async function POST(request: Request) {
  try {
    const user = await requireApiRole("PUBLISHER");
    const publisher = await prisma.publisher.findUniqueOrThrow({ where: { userId: user.id } });

    const body = await request.json().catch(() => null);
    const parsed = generateLinkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const offer = await prisma.offer.findUnique({ where: { id: parsed.data.offerId } });
    if (!offer || offer.status !== "ACTIVE") {
      return NextResponse.json({ error: "Cette offre n'est pas disponible." }, { status: 404 });
    }

    const existing = await prisma.affiliateLink.findFirst({
      where: { publisherId: publisher.id, offerId: offer.id, subId: "" },
    });
    if (existing) {
      return NextResponse.json({ link: existing });
    }

    const link = await prisma.affiliateLink.create({
      data: {
        token: randomBytes(9).toString("base64url"),
        publisherId: publisher.id,
        offerId: offer.id,
        subId: "",
        label: parsed.data.label || `${offer.name} — lien principal`,
      },
    });

    return NextResponse.json({ link });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[POST /api/publisher/links]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
