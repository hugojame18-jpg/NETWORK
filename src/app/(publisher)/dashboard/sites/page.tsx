import type { Metadata } from "next";
import { requireRole } from "@/lib/rbac";
import { getPublisherByUserId } from "@/lib/data/publisher";
import { prisma } from "@/lib/prisma";
import { PROMO_SITES } from "@/lib/promo-sites";
import { PromoSiteCard } from "@/components/dashboard/promo-site-card";

export const metadata: Metadata = { title: "Sites à promouvoir" };

export default async function SitesPage() {
  const user = await requireRole("PUBLISHER");
  const publisher = await getPublisherByUserId(user.id);

  const requests = await prisma.siteRequest.findMany({
    where: { publisherId: publisher.id },
    select: { siteSlug: true, status: true },
  });
  const statusBySlug = new Map(requests.map((r) => [r.siteSlug, r.status]));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Sites à promouvoir</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choisis le site que tu veux promouvoir. Clique sur l&apos;aperçu pour l&apos;ouvrir en grand, puis
          demande-le&nbsp;: on te répond et on te transmet ton lien.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {PROMO_SITES.map((site) => (
          <PromoSiteCard key={site.slug} site={site} initialStatus={statusBySlug.get(site.slug) ?? null} />
        ))}
      </div>

      {PROMO_SITES.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">Aucun site disponible pour le moment.</p>
      )}
    </div>
  );
}
