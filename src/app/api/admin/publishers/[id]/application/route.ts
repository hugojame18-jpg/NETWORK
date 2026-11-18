import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { logAction } from "@/lib/audit";
import { checkMutationRateLimit } from "@/lib/rate-limit";
import { publisherApplicationSchema } from "@/lib/validations/admin";
import {
  sendEmail,
  applicationApprovedEmail,
  applicationRejectedEmail,
} from "@/lib/email";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const admin = await requireApiRole("ADMIN");
    if (!(await checkMutationRateLimit(admin.id))) {
      return NextResponse.json(
        { error: "Trop de requêtes, réessayez plus tard." },
        { status: 429 },
      );
    }
    const { id } = await params;

    const body = await request.json().catch(() => null);
    const parsed = publisherApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const publisher = await prisma.publisher.update({
      where: { id },
      data: { applicationStatus: parsed.data.status },
      include: { user: { select: { name: true, email: true } } },
    });

    await prisma.notification.create({
      data: {
        userId: publisher.userId,
        type: parsed.data.status === "APPROVED" ? "SUCCESS" : "WARNING",
        title:
          parsed.data.status === "APPROVED"
            ? "Compte approuvé"
            : "Candidature refusée",
        body:
          parsed.data.status === "APPROVED"
            ? "Votre compte publisher a été approuvé, vous pouvez désormais générer des liens."
            : "Votre candidature publisher a été refusée. Contactez le support pour plus d'informations.",
      },
    });

    // The pending screen promises an email on decision, so send one. Approval
    // and rejection are the only outcomes worth writing about; moving a record
    // back to PENDING is an internal correction.
    if (parsed.data.status !== "PENDING") {
      await sendEmail(
        publisher.user.email,
        parsed.data.status === "APPROVED"
          ? applicationApprovedEmail(publisher.user.name)
          : applicationRejectedEmail(publisher.user.name),
      );
    }

    await logAction({
      actorId: admin.id,
      action: `publisher.application.${parsed.data.status.toLowerCase()}`,
      targetType: "Publisher",
      targetId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("[PATCH /api/admin/publishers/:id/application]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
