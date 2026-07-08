import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { updatePaymentMethodSchema } from "@/lib/validations/publisher";

export async function PATCH(request: Request) {
  try {
    const user = await requireApiRole("PUBLISHER");

    const body = await request.json().catch(() => null);
    const parsed = updatePaymentMethodSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    await prisma.publisher.update({
      where: { userId: user.id },
      data: {
        paymentMethod: parsed.data.paymentMethod,
        paymentDetails: parsed.data.paymentDetails,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[PATCH /api/publisher/payment-method]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
