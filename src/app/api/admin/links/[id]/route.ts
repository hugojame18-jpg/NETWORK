import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { logAction } from "@/lib/audit";
import { checkMutationRateLimit } from "@/lib/rate-limit";
import { deliverLinkSchema } from "@/lib/validations/admin";
import { sendEmail, linkDeliveredEmail } from "@/lib/email";

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
    const parsed = deliverLinkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Données invalides" }, { status: 400 });
    }

    const link = await prisma.affiliateLink.update({
      where: { id },
      data: {
        targetUrl: parsed.data.targetUrl,
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
      include: {
        publisher: { select: { userId: true, user: { select: { name: true, email: true } } } },
        offer: { select: { name: true } },
      },
    });

    await prisma.notification.create({
      data: {
        userId: link.publisher.userId,
        type: "SUCCESS",
        title: "Ton lien d'affiliation est prêt",
        body: `Ton lien pour "${link.offer.name}" est disponible sur ton dashboard.`,
      },
    });

    // A delivered link is only useful once the affiliate knows about it, and
    // they may not have the dashboard open.
    await sendEmail(
      link.publisher.user.email,
      linkDeliveredEmail(link.publisher.user.name, link.offer.name),
    );

    await logAction({
      actorId: admin.id,
      action: "link.delivered",
      targetType: "AffiliateLink",
      targetId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[PATCH /api/admin/links/:id]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
