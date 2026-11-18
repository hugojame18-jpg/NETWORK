import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { logAction } from "@/lib/audit";
import { checkMutationRateLimit } from "@/lib/rate-limit";
import { trainingVideoSchema } from "@/lib/validations/admin";

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
    const parsed = trainingVideoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides" },
        { status: 400 },
      );
    }

    // Default to the end of the list so a new lesson doesn't jump the queue.
    const position =
      parsed.data.position ??
      ((await prisma.trainingVideo.aggregate({ _max: { position: true } }))._max
        .position ?? 0) + 1;

    const video = await prisma.trainingVideo.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        url: parsed.data.url,
        position,
        authorId: admin.id,
      },
    });

    await logAction({
      actorId: admin.id,
      action: "training.create",
      targetType: "TrainingVideo",
      targetId: video.id,
    });

    return NextResponse.json({ video });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("[POST /api/admin/training]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
