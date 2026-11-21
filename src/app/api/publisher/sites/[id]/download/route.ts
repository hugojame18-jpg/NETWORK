import { NextResponse } from "next/server";
import { apiError, ownedSite } from "@/lib/sites/api";
import { getSiteOffer } from "@/lib/sites/store";
import { buildSiteZip } from "@/lib/sites/package";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const { site } = await ownedSite(id);
    const offer = await getSiteOffer();
    if (!offer) {
      return NextResponse.json(
        { error: "L'offre n'est pas renseignée." },
        { status: 409 },
      );
    }
    const zip = buildSiteZip(
      { headline: site!.headline, sub3: site!.sub3, offerUrl: site!.offerUrl },
      offer,
    );
    return new NextResponse(zip as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="site-${site!.sub3}.zip"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return apiError(error, "[GET /api/publisher/sites/:id/download]");
  }
}
