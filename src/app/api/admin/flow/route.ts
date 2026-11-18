import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { logAction } from "@/lib/audit";
import { checkMutationRateLimit } from "@/lib/rate-limit";
import { saveFlowConfig, syncFlowTraffic } from "@/lib/flow";

export const dynamic = "force-dynamic";

const configSchema = z.object({
  apiKey: z.string().trim().min(8, "Cette clé semble trop courte"),
  apiUrl: z
    .string()
    .trim()
    .url("URL invalide")
    .max(300)
    .optional()
    .or(z.literal("")),
});

/** Stores the API key. It lives in the database, like the postback secret, so
 *  it can be replaced from the admin without a deploy. */
export async function PATCH(request: Request) {
  try {
    const admin = await requireApiRole("ADMIN");
    if (!(await checkMutationRateLimit(admin.id))) {
      return NextResponse.json(
        { error: "Trop de requêtes, réessayez plus tard." },
        { status: 429 },
      );
    }

    const parsed = configSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides" },
        { status: 400 },
      );
    }

    await saveFlowConfig(parsed.data.apiKey, parsed.data.apiUrl || undefined);

    // The key itself is never logged — only that it changed, and by whom.
    await logAction({
      actorId: admin.id,
      action: "flow.key.changed",
      targetType: "Setting",
      targetId: "flow.apiKey",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("[PATCH /api/admin/flow]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** Runs the sync now, so the admin never has to wait for the schedule to
 *  find out whether the key works. */
export async function POST() {
  try {
    const admin = await requireApiRole("ADMIN");
    if (!(await checkMutationRateLimit(admin.id))) {
      return NextResponse.json(
        { error: "Trop de requêtes, réessayez plus tard." },
        { status: 429 },
      );
    }

    const summary = await syncFlowTraffic();

    await logAction({
      actorId: admin.id,
      action: "flow.sync.manual",
      targetType: "Setting",
      targetId: "flow.lastSync",
    });

    return NextResponse.json(summary);
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("[POST /api/admin/flow]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
