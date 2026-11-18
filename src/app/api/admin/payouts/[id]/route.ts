import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { logAction } from "@/lib/audit";
import { checkMutationRateLimit } from "@/lib/rate-limit";
import { toNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Removes a recorded payout.
 *
 * A figure typed wrong on a payment is worse than most mistakes: it moves a
 * balance, and the affiliate sees that balance. There has to be a way back, so
 * the row can be deleted and re-entered — the balance is derived from what is
 * recorded, so it corrects itself the moment this returns.
 *
 * What is deleted is logged with its amount and date, so the correction itself
 * leaves a trace even though the row is gone.
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const admin = await requireApiRole("ADMIN");
    if (!(await checkMutationRateLimit(admin.id))) {
      return NextResponse.json(
        { error: "Trop de requêtes, réessayez plus tard." },
        { status: 429 },
      );
    }

    const { id } = await params;
    const payment = await prisma.payment.findUnique({
      where: { id },
      select: {
        id: true,
        publisherId: true,
        amount: true,
        method: true,
        status: true,
        paidAt: true,
        requestedAt: true,
      },
    });
    if (!payment) {
      return NextResponse.json(
        { error: "Paiement introuvable" },
        { status: 404 },
      );
    }

    await prisma.$transaction(async (tx) => {
      // Commissions point at the payment that settled them. Freeing them first
      // keeps them available instead of leaving them attached to nothing.
      await tx.commission.updateMany({
        where: { paymentId: id },
        data: { paymentId: null, status: "APPROVED" },
      });
      await tx.payment.delete({ where: { id } });
    });

    await logAction({
      actorId: admin.id,
      action: "payout.deleted",
      targetType: "Payment",
      targetId: id,
      metadata: {
        publisherId: payment.publisherId,
        amount: toNumber(payment.amount),
        method: payment.method,
        status: payment.status,
        paidAt: (payment.paidAt ?? payment.requestedAt).toISOString(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("[DELETE /api/admin/payouts/:id]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
