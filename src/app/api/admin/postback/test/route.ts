import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { logAction } from "@/lib/audit";
import { checkMutationRateLimit } from "@/lib/rate-limit";
import { affisePostbackUrl, postbackSecret } from "@/lib/postback";

/**
 * Fires one real postback at our own endpoint, standing in for the network.
 *
 * The point is that the admin never has to put the secret in a URL bar to
 * prove the accepted path works: the server already holds it. The call goes
 * out over HTTP rather than straight to the handler so that everything the
 * network would hit is exercised — routing, the key check, the sub3 lookup,
 * the daily-stat write and the hit log.
 *
 * It books a genuine conversion, which is the only way to verify it. The
 * amount is the caller's, and the returned transaction id makes it easy to
 * find again.
 */
export async function POST(request: Request) {
  try {
    const admin = await requireApiRole("ADMIN");
    if (!(await checkMutationRateLimit(admin.id))) {
      return NextResponse.json(
        { error: "Trop de requêtes, réessayez plus tard." },
        { status: 429 },
      );
    }

    const body = (await request.json().catch(() => null)) as {
      publisherId?: unknown;
      amount?: unknown;
    } | null;

    const publisherId =
      typeof body?.publisherId === "string" ? body.publisherId : "";
    if (!publisherId) {
      return NextResponse.json({ error: "Affilié manquant." }, { status: 400 });
    }

    const amount = Number(body?.amount);
    if (!Number.isFinite(amount) || amount < 0 || amount > 10_000) {
      return NextResponse.json({ error: "Montant invalide." }, { status: 400 });
    }

    const publisher = await prisma.publisher.findUnique({
      where: { id: publisherId },
      select: { postbackToken: true, user: { select: { name: true } } },
    });
    if (!publisher?.postbackToken) {
      return NextResponse.json(
        { error: "Cet affilié n'a pas encore de sub3." },
        { status: 400 },
      );
    }

    const transactionId = `test-${Date.now()}`;
    const secret = await postbackSecret();
    const url = affisePostbackUrl(secret)
      .replace("{sub3}", encodeURIComponent(publisher.postbackToken))
      .replace("{sum}", String(amount))
      .replace("{transactionid}", transactionId)
      .replace("{offer_name}", encodeURIComponent("Appel de test"));

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: { "user-agent": "RevNetwork/postback-test" },
    });
    const text = (await response.text()).slice(0, 200);

    await logAction({
      actorId: admin.id,
      action: "postback.test",
      targetType: "Publisher",
      targetId: publisherId,
    });

    return NextResponse.json({
      ok: response.ok && text === "OK",
      status: response.status,
      body: text,
      transactionId,
      publisher: publisher.user.name,
    });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("[POST /api/admin/postback/test]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
