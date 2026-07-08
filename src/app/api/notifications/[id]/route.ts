import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** Marks a single notification as read — scoped to the current user, so IDs can't be guessed to read others' data. */
export async function PATCH(_request: Request, { params }: RouteParams) {
  try {
    const user = await requireApiRole("PUBLISHER", "ADVERTISER", "ADMIN");
    const { id } = await params;

    const result = await prisma.notification.updateMany({
      where: { id, userId: user.id },
      data: { read: true },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[PATCH /api/notifications/:id]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
