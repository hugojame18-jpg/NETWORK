import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateSiteSchema } from "@/lib/validations/publisher";
import { apiError, ownedSite } from "@/lib/sites/api";

type Ctx = { params: Promise<{ id: string }> };

/** Changes the heading and the button's link. The conditions block is not the affiliate's to edit. */
export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const { site } = await ownedSite(id, { mutation: true });
    const parsed = updateSiteSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides" },
        { status: 400 },
      );
    }
    await prisma.affiliateSite.update({
      where: { id: site!.id },
      data: {
        ...(parsed.data.headline !== undefined && { headline: parsed.data.headline }),
        ...(parsed.data.offerUrl !== undefined && { offerUrl: parsed.data.offerUrl || null }),
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, "[PATCH /api/publisher/sites/:id]");
  }
}
