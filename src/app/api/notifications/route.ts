import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";

/** Marks every unread notification for the current user as read. */
export async function PATCH() {
  try {
    const user = await requireApiRole("PUBLISHER", "ADVERTISER", "ADMIN");
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[PATCH /api/notifications]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
