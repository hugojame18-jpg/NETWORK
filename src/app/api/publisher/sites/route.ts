import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSiteSchema } from "@/lib/validations/publisher";
import { apiError, ownedSite } from "@/lib/sites/api";
import {
  MAX_SITES_PER_AFFILIATE,
  createAffiliateSite,
  getSiteOffer,
} from "@/lib/sites/store";

/** Generates a site with a sub3 of its own. */
export async function POST(request: Request) {
  try {
    const { publisher } = await ownedSite(undefined, { mutation: true });

    const parsed = createSiteSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides" },
        { status: 400 },
      );
    }

    if (!(await getSiteOffer())) {
      return NextResponse.json(
        {
          error:
            "Les sites ne sont pas encore ouverts : l'offre n'est pas renseignée.",
        },
        { status: 409 },
      );
    }

    const count = await prisma.affiliateSite.count({
      where: { publisherId: publisher.id },
    });
    if (count >= MAX_SITES_PER_AFFILIATE) {
      return NextResponse.json(
        { error: `${MAX_SITES_PER_AFFILIATE} sites au maximum.` },
        { status: 409 },
      );
    }

    const site = await createAffiliateSite({
      publisherId: publisher.id,
      ...parsed.data,
    });
    return NextResponse.json({ site: { id: site.id } });
  } catch (error) {
    return apiError(error, "[POST /api/publisher/sites]");
  }
}
