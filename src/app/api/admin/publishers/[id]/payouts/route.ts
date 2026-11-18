import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { logAction } from "@/lib/audit";
import { checkMutationRateLimit } from "@/lib/rate-limit";
import { recordPayoutSchema } from "@/lib/validations/admin";
import { getAffiliateLedger } from "@/lib/data/ledger";
import { paymentMethodLabel } from "@/lib/payment-methods";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Records a payout that has already left: amount, date, method, note.
 *
 * Nothing here moves money — the transfer happens in the admin's bank or
 * wallet, and this only writes down that it happened. Which is why it is
 * stored as a Payment already marked PAID rather than as a request to approve:
 * there is nothing left to approve.
 *
 * The affiliate's statistics are deliberately untouched. A payout draws down
 * the balance (earned minus paid, computed in @/lib/data/ledger) and nothing
 * else, so last month's figures still read the same after they have been paid.
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const admin = await requireApiRole("ADMIN");
    if (!(await checkMutationRateLimit(admin.id))) {
      return NextResponse.json(
        { error: "Trop de requêtes, réessayez plus tard." },
        { status: 429 },
      );
    }

    const { id } = await params;
    const parsed = recordPayoutSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides" },
        { status: 400 },
      );
    }

    const publisher = await prisma.publisher.findUnique({
      where: { id },
      select: { id: true, userId: true, user: { select: { name: true } } },
    });
    if (!publisher) {
      return NextResponse.json(
        { error: "Affilié introuvable" },
        { status: 404 },
      );
    }

    // Noon UTC rather than midnight: the date comes from a date picker with no
    // time, and midnight lands on the previous day for any viewer west of UTC.
    const paidAt = new Date(`${parsed.data.paidAt}T12:00:00.000Z`);
    if (Number.isNaN(paidAt.getTime())) {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }

    const payment = await prisma.payment.create({
      data: {
        publisherId: publisher.id,
        amount: parsed.data.amount,
        method: parsed.data.method,
        status: "PAID",
        note: parsed.data.note || null,
        // Not a request anyone filed, so both dates are the day it was sent.
        requestedAt: paidAt,
        reviewedAt: new Date(),
        paidAt,
      },
    });

    const amountLabel = `${parsed.data.amount.toFixed(2)} $`;

    // The affiliate finds out in their own panel rather than by noticing their
    // balance drop. In-app only: an email is the admin's call to make, not a
    // side effect of bookkeeping.
    await prisma.notification.create({
      data: {
        userId: publisher.userId,
        type: "PAYMENT",
        title: "Paiement envoyé",
        body: `Un paiement de ${amountLabel} t'a été envoyé par ${paymentMethodLabel(
          parsed.data.method,
        )}. Il est déduit de ton solde ; tes statistiques ne changent pas.`,
      },
    });

    await logAction({
      actorId: admin.id,
      action: "payout.recorded",
      targetType: "Payment",
      targetId: payment.id,
      metadata: {
        publisherId: publisher.id,
        amount: parsed.data.amount,
        method: parsed.data.method,
        paidAt: parsed.data.paidAt,
      },
    });

    const ledger = await getAffiliateLedger(publisher.id);

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      balance: ledger.balance,
    });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("[POST /api/admin/publishers/:id/payouts]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
