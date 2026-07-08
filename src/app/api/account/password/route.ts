import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { changePasswordSchema } from "@/lib/validations/publisher";

export async function PATCH(request: Request) {
  try {
    const user = await requireApiRole("PUBLISHER", "ADVERTISER", "ADMIN");

    const ip = getClientIp(request.headers);
    const limit = await rateLimit(`account:password:${user.id}:${ip}`, { limit: 5, windowSeconds: 60 * 15 });
    if (!limit.success) {
      return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    const validCurrent = await bcrypt.compare(parsed.data.currentPassword, dbUser.passwordHash);
    if (!validCurrent) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[PATCH /api/account/password]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
