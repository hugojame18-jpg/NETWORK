import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { sendEmail, passwordResetEmailHtml } from "@/lib/email";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const limit = await rateLimit(`auth:forgot-password:${ip}`, { limit: 5, windowSeconds: 60 * 15 });
  if (!limit.success) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Adresse email invalide" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  // Always respond with success, whether or not the account exists — this
  // prevents leaking which email addresses are registered on the platform.
  if (user) {
    const token = crypto.randomUUID();
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: "Réinitialisation de votre mot de passe — RevNetwork",
      html: passwordResetEmailHtml(user.name, resetUrl),
    });
  }

  return NextResponse.json({ success: true });
}
