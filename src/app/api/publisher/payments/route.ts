import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { requestPaymentSchema } from "@/lib/validations/publisher";
import { toNumber } from "@/lib/format";
import { checkMutationRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const user = await requireApiRole("PUBLISHER");
    if (!(await checkMutationRateLimit(user.id))) {
      return NextResponse.json({ error: "Trop de requêtes, réessayez plus tard." }, { status: 429 });
    }
    const publisher = await prisma.publisher.findUniqueOrThrow({ where: { userId: user.id } });

    const body = await request.json().catch(() => null);
    const parsed = requestPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const minPayout = toNumber(publisher.minPayout);
    if (parsed.data.amount < minPayout) {
      return NextResponse.json(
        { error: `Le montant minimum de retrait est de ${minPayout.toFixed(2)} $.` },
        { status: 400 },
      );
    }

    const availableCommissions = await prisma.commission.findMany({
      where: { publisherId: publisher.id, status: "APPROVED", paymentId: null },
      orderBy: { createdAt: "asc" },
    });
    const availableTotal = availableCommissions.reduce((sum, c) => sum + toNumber(c.amount), 0);

    if (parsed.data.amount > availableTotal) {
      return NextResponse.json(
        { error: `Solde disponible insuffisant (${availableTotal.toFixed(2)} $ disponible).` },
        { status: 400 },
      );
    }

    // Greedily attach commissions (oldest first) until the requested amount is covered.
    const toAttach: string[] = [];
    let running = 0;
    for (const commission of availableCommissions) {
      if (running >= parsed.data.amount) break;
      toAttach.push(commission.id);
      running += toNumber(commission.amount);
    }

    const payment = await prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          publisherId: publisher.id,
          amount: parsed.data.amount,
          method: parsed.data.method,
          status: "PENDING",
        },
      });
      await tx.commission.updateMany({
        where: { id: { in: toAttach } },
        data: { paymentId: created.id },
      });
      return created;
    });

    return NextResponse.json({ payment });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[POST /api/publisher/payments]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
