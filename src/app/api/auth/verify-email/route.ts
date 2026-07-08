import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

  if (!token) {
    return NextResponse.redirect(`${appUrl}/sign-in?verified=missing`);
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) {
    return NextResponse.redirect(`${appUrl}/sign-in?verified=expired`);
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: new Date() } }),
    prisma.verificationToken.delete({ where: { id: record.id } }),
  ]);

  return NextResponse.redirect(`${appUrl}/sign-in?verified=success`);
}
