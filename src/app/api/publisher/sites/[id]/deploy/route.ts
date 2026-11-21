import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ownedSite } from "@/lib/sites/api";
import { getSiteOffer } from "@/lib/sites/store";
import { buildSiteZip } from "@/lib/sites/package";
import {
  createNetlifySite,
  deployZip,
  netlifyConfigured,
} from "@/lib/sites/netlify";

type Ctx = { params: Promise<{ id: string }> };

/** Puts the site online on Netlify; run again to publish a changed heading. */
export async function POST(_request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const { site } = await ownedSite(id, { mutation: true });

    if (!netlifyConfigured()) {
      return NextResponse.json(
        {
          error:
            "La mise en ligne automatique n'est pas activée. Télécharge le site et dépose-le sur app.netlify.com/drop.",
        },
        { status: 409 },
      );
    }
    const offer = await getSiteOffer();
    if (!offer) {
      return NextResponse.json(
        { error: "L'offre n'est pas renseignée." },
        { status: 409 },
      );
    }

    let { netlifySiteId, netlifyHost } = site!;
    if (!netlifySiteId) {
      const created = await createNetlifySite();
      netlifySiteId = created.id;
      netlifyHost = created.host;
      // Saved before the deploy: a failed upload must not orphan the Netlify site.
      await prisma.affiliateSite.update({
        where: { id: site!.id },
        data: { netlifySiteId, netlifyHost },
      });
    }

    await deployZip(
      netlifySiteId,
      buildSiteZip(
        { headline: site!.headline, sub3: site!.sub3, offerUrl: site!.offerUrl },
        offer,
      ),
    );
    await prisma.affiliateSite.update({
      where: { id: site!.id },
      data: { deployedAt: new Date() },
    });
    return NextResponse.json({ host: netlifyHost });
  } catch (error) {
    return apiError(error, "[POST /api/publisher/sites/:id/deploy]");
  }
}
