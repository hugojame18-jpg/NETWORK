import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { logAction } from "@/lib/audit";
import { checkMutationRateLimit } from "@/lib/rate-limit";
import { dailyStatSchema } from "@/lib/validations/admin";

/**
 * Publisher-facing numbers are never computed from the tracking tables —
 * the admin enters one row per publisher per day here, and that row is the
 * only thing the publisher dashboard reads. Creating a row for a date that
 * already has one just overwrites it (upsert), since "create a new day" and
 * "fix yesterday's numbers" are the same action from the admin's point of view.
 */
export async function POST(request: Request) {
  try {
    const admin = await requireApiRole("ADMIN");
    if (!(await checkMutationRateLimit(admin.id))) {
      return NextResponse.json({ error: "Trop de requêtes, réessayez plus tard." }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    const parsed = dailyStatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", issues: parsed.error.flatten() }, { status: 400 });
    }

    const { publisherId, date, clicks, hosts, conversions, revenue } = parsed.data;
    const day = new Date(`${date}T00:00:00.000Z`);

    const stat = await prisma.publisherDailyStat.upsert({
      where: { publisherId_date: { publisherId, date: day } },
      create: { publisherId, date: day, clicks, hosts, conversions, revenue, enteredById: admin.id },
      update: { clicks, hosts, conversions, revenue, enteredById: admin.id },
    });

    await logAction({
      actorId: admin.id,
      action: "publisher.daily_stat.upsert",
      targetType: "PublisherDailyStat",
      targetId: stat.id,
      metadata: { publisherId, date, clicks, hosts, conversions, revenue },
    });

    return NextResponse.json({ success: true, stat });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[POST /api/admin/daily-stats]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
