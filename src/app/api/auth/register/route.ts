import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { sendEmail, verificationEmail } from "@/lib/email";
import { appUrl } from "@/lib/app-url";
import { generateReferralCode, resolveReferrer } from "@/lib/data/publisher";
import { signUpSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const limit = await rateLimit(`auth:register:${ip}`, {
    limit: 5,
    windowSeconds: 60 * 15,
  });
  if (!limit.success) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez plus tard." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = signUpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const {
    name,
    email,
    password,
    role,
    companyName,
    website,
    referralCode,
    workedWithNetworks,
    previousNetworks,
    affiliateExperience,
    tiktokLinks,
  } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Un compte existe déjà avec cette adresse email." },
      { status: 409 },
    );
  }

  // Referral attribution: resolve the code to the referring publisher (only
  // publishers can be referred). Unknown codes are silently ignored so a stale
  // link never blocks a sign-up.
  const referredById =
    role === "PUBLISHER" && referralCode
      ? await resolveReferrer(referralCode)
      : null;

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      status: "ACTIVE",
      ...(role === "PUBLISHER"
        ? {
            publisher: {
              create: {
                companyName: companyName || null,
                website: website || null,
                // Sign-up is open: publishers get their dashboard immediately.
                // The status stays on the model so an admin can still revoke
                // access later from the affiliates page.
                applicationStatus: "APPROVED",
                workedWithNetworks: workedWithNetworks ?? false,
                previousNetworks: previousNetworks || null,
                affiliateExperience: affiliateExperience || null,
                tiktokLinks: tiktokLinks || null,
                referralCode: generateReferralCode(),
                referredById,
              },
            },
          }
        : {
            advertiser: {
              create: {
                companyName: companyName || name,
                website: website || null,
              },
            },
          }),
    },
    select: { id: true, email: true, name: true },
  });

  // No review to do any more, but a new affiliate joining is still worth
  // knowing about.
  if (role === "PUBLISHER") {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: "INFO" as const,
          title: "Nouvel affilié inscrit",
          body: `${user.name} (${user.email}) vient de rejoindre le réseau.`,
        })),
      });
    }
  }

  const token = crypto.randomUUID();
  await prisma.verificationToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const verifyUrl = `${appUrl()}/api/auth/verify-email?token=${token}`;
  await sendEmail(user.email, verificationEmail(user.name, verifyUrl));

  return NextResponse.json({ success: true });
}
