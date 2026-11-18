import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { logAction } from "@/lib/audit";
import { checkMutationRateLimit } from "@/lib/rate-limit";
import { announcementSchema } from "@/lib/validations/admin";

export async function POST(request: Request) {
  try {
    const admin = await requireApiRole("ADMIN");
    if (!(await checkMutationRateLimit(admin.id))) {
      return NextResponse.json(
        { error: "Trop de requêtes, réessayez plus tard." },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = announcementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides" },
        { status: 400 },
      );
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: parsed.data.title,
        body: parsed.data.body,
        authorId: admin.id,
      },
    });

    // The banner only shows to publishers who open their dashboard, so also
    // drop a notification: the bell and the notifications page catch the rest.
    const publishers = await prisma.user.findMany({
      where: { role: "PUBLISHER", status: { notIn: ["BANNED", "SUSPENDED"] } },
      select: { id: true },
    });
    if (publishers.length > 0) {
      await prisma.notification.createMany({
        data: publishers.map((publisher) => ({
          userId: publisher.id,
          type: "INFO" as const,
          title: parsed.data.title,
          body: parsed.data.body.slice(0, 500),
        })),
      });
    }

    await logAction({
      actorId: admin.id,
      action: "announcement.create",
      targetType: "Announcement",
      targetId: announcement.id,
    });

    return NextResponse.json({ announcement, recipients: publishers.length });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("[POST /api/admin/announcements]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
