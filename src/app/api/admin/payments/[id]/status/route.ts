import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { logAction } from "@/lib/audit";
import { checkMutationRateLimit } from "@/lib/rate-limit";
import { paymentStatusSchema } from "@/lib/validations/admin";

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
    const parsed = paymentStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) {
      return NextResponse.json({ error: "Paiement introuvable" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id },
        data: {
          status: parsed.data.status,
          reviewedAt: new Date(),
          paidAt: parsed.data.status === "PAID" ? new Date() : payment.paidAt,
        },
      });

      if (parsed.data.status === "PAID" && payment.status !== "PAID") {
        await tx.commission.updateMany({ where: { paymentId: id }, data: { status: "PAID" } });
        // The balance already reflects approved commissions; paying out draws it down.
        await tx.publisher.update({ where: { id: payment.publisherId }, data: { balance: { decrement: payment.amount } } });
      }

      if (parsed.data.status === "REJECTED") {
        // Free up the commissions so the publisher can include them in a future request.
        await tx.commission.updateMany({ where: { paymentId: id }, data: { paymentId: null } });
      }
    });

    const publisher = await prisma.publisher.findUniqueOrThrow({ where: { id: payment.publisherId } });
    await prisma.notification.create({
      data: {
        userId: publisher.userId,
        type: "PAYMENT",
        title:
          parsed.data.status === "PAID"
            ? "Paiement envoyé"
            : parsed.data.status === "REJECTED"
              ? "Paiement refusé"
              : "Paiement mis à jour",
        body:
          parsed.data.status === "PAID"
            ? `Votre paiement de ${Number(payment.amount).toFixed(2)} $ a été envoyé.`
            : parsed.data.status === "REJECTED"
              ? `Votre demande de paiement de ${Number(payment.amount).toFixed(2)} $ a été refusée.`
              : `Le statut de votre paiement est maintenant "${parsed.data.status}".`,
      },
    });

    await logAction({
      actorId: admin.id,
      action: `payment.status.${parsed.data.status.toLowerCase()}`,
      targetType: "Payment",
      targetId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[PATCH /api/admin/payments/:id/status]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
