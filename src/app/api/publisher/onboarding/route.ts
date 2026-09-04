import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";

/** Marks the guided tour as done, so it never shows again for this account. */
export async function POST() {
  try {
    const user = await requireApiRole("PUBLISHER");

    await prisma.publisher.update({
      where: { userId: user.id },
      data: { onboardingSeenAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[POST /api/publisher/onboarding]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** Replays the tour: it shows again on the next dashboard visit. */
export async function DELETE() {
  try {
    const user = await requireApiRole("PUBLISHER");

    await prisma.publisher.update({
      where: { userId: user.id },
      data: { onboardingSeenAt: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[DELETE /api/publisher/onboarding]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
