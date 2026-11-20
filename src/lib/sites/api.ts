import "server-only";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiRole } from "@/lib/rbac";
import { checkMutationRateLimit } from "@/lib/rate-limit";

/** The signed-in, approved affiliate, and one of their sites if an id is given. */
export async function ownedSite(
  siteId?: string,
  opts: { mutation?: boolean } = {},
) {
  const user = await requireApiRole("PUBLISHER");
  if (opts.mutation && !(await checkMutationRateLimit(user.id))) {
    throw new ApiAuthError(403, "Trop de requêtes, réessaie dans une minute.");
  }
  const publisher = await prisma.publisher.findUniqueOrThrow({
    where: { userId: user.id },
  });
  if (publisher.applicationStatus !== "APPROVED") {
    throw new ApiAuthError(403, "Ton compte n'est pas encore validé.");
  }
  if (!siteId) return { publisher, site: null };
  const site = await prisma.affiliateSite.findFirst({
    where: { id: siteId, publisherId: publisher.id },
  });
  if (!site) throw new ApiAuthError(403, "Site introuvable.");
  return { publisher, site };
}

export function apiError(error: unknown, label: string) {
  if (error instanceof ApiAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(label, error);
  const message =
    error instanceof Error && error.message.startsWith("Netlify")
      ? error.message
      : "Erreur serveur";
  return NextResponse.json({ error: message }, { status: 500 });
}
