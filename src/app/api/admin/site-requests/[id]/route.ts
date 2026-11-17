import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { logAction } from "@/lib/audit";
import { checkMutationRateLimit } from "@/lib/rate-limit";
import { siteRequestStatusSchema } from "@/lib/validations/admin";
import { promoSiteName } from "@/lib/promo-sites";
import { sendEmail, siteRequestApprovedEmail } from "@/lib/email";

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
    const parsed = siteRequestStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const siteRequest = await prisma.siteRequest.update({
      where: { id },
      data: {
        status: parsed.data.status,
        handledAt: parsed.data.status === "PENDING" ? null : new Date(),
      },
      include: { publisher: { select: { userId: true, user: { select: { name: true, email: true } } } } },
    });

    const siteName = promoSiteName(siteRequest.siteSlug);
    await prisma.notification.create({
      data: {
        userId: siteRequest.publisher.userId,
        type: parsed.data.status === "APPROVED" ? "SUCCESS" : "INFO",
        title:
          parsed.data.status === "APPROVED"
            ? `Demande acceptée — ${siteName}`
            : `Demande mise à jour — ${siteName}`,
        body:
          parsed.data.status === "APPROVED"
            ? `Tu peux promouvoir "${siteName}". Ton lien arrive.`
            : `Ta demande pour "${siteName}" est désormais "${parsed.data.status}".`,
      },
    });

    // Only approval is worth an email: it unblocks the affiliate. A rejection
    // or a reset to pending stays in the dashboard notification.
    if (parsed.data.status === "APPROVED") {
      await sendEmail(
        siteRequest.publisher.user.email,
        siteRequestApprovedEmail(siteRequest.publisher.user.name, siteName),
      );
    }

    await logAction({
      actorId: admin.id,
      action: `site-request.${parsed.data.status.toLowerCase()}`,
      targetType: "SiteRequest",
      targetId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[PATCH /api/admin/site-requests/:id]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
