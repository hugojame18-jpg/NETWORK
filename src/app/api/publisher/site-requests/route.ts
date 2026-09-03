import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { getPromoSite } from "@/lib/promo-sites";
import { requestSiteSchema } from "@/lib/validations/publisher";

export async function POST(request: Request) {
  try {
    const user = await requireApiRole("PUBLISHER");
    const publisher = await prisma.publisher.findUniqueOrThrow({ where: { userId: user.id } });

    const body = await request.json().catch(() => null);
    const parsed = requestSiteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const site = getPromoSite(parsed.data.siteSlug);
    if (!site) {
      return NextResponse.json({ error: "Ce site n'est pas disponible." }, { status: 404 });
    }

    // One request per publisher/site: asking twice just returns the first one.
    const existing = await prisma.siteRequest.findFirst({
      where: { publisherId: publisher.id, siteSlug: site.slug },
    });
    if (existing) {
      return NextResponse.json({ request: existing });
    }

    const created = await prisma.siteRequest.create({
      data: { publisherId: publisher.id, siteSlug: site.slug },
    });

    // Surface the request to every admin, so it isn't missed if they don't
    // happen to open the requests page.
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: "INFO" as const,
          title: "Nouvelle demande de site",
          body: `${user.name ?? user.email} demande à promouvoir "${site.name}".`,
        })),
      });
    }

    return NextResponse.json({ request: created });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[POST /api/publisher/site-requests]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
