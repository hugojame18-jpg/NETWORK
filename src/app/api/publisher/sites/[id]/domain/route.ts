import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { siteDomainSchema } from "@/lib/validations/publisher";
import { apiError, ownedSite } from "@/lib/sites/api";
import { attachDomain, netlifyConfigured } from "@/lib/sites/netlify";

type Ctx = { params: Promise<{ id: string }> };

/** Attaches a domain the affiliate bought, to the site that is online. */
export async function PUT(request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const { site } = await ownedSite(id, { mutation: true });
    const parsed = siteDomainSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Domaine invalide" },
        { status: 400 },
      );
    }
    if (!netlifyConfigured() || !site!.netlifySiteId) {
      return NextResponse.json(
        { error: "Mets d'abord ton site en ligne, puis ajoute ton domaine." },
        { status: 409 },
      );
    }
    const taken = await prisma.affiliateSite.findFirst({
      where: { domain: parsed.data.domain, NOT: { id: site!.id } },
      select: { id: true },
    });
    if (taken) {
      return NextResponse.json(
        { error: "Ce domaine est déjà utilisé." },
        { status: 409 },
      );
    }
    await attachDomain(site!.netlifySiteId, parsed.data.domain);
    await prisma.affiliateSite.update({
      where: { id: site!.id },
      data: { domain: parsed.data.domain },
    });
    return NextResponse.json({ domain: parsed.data.domain });
  } catch (error) {
    return apiError(error, "[PUT /api/publisher/sites/:id/domain]");
  }
}
