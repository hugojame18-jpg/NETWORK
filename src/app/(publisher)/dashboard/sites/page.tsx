import type { Metadata } from "next";
import { MonitorSmartphone } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { getPublisherByUserId } from "@/lib/data/publisher";
import { prisma } from "@/lib/prisma";
import { PROMO_SITES } from "@/lib/promo-sites";
import { PromoSiteCard } from "@/components/dashboard/promo-site-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";

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
      <PageHeader
        title="Sites à promouvoir"
        description="Clique sur un aperçu pour l'ouvrir en grand, puis demande le site : on te répond et on te transmet ton lien."
      />

      {PROMO_SITES.length === 0 ? (
        <div className="surface">
          <EmptyState
            icon={<MonitorSmartphone />}
            title="Aucun site disponible"
            description="De nouveaux sites sont ajoutés régulièrement. Reviens voir d'ici peu."
          />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {PROMO_SITES.map((site) => (
            <PromoSiteCard
              key={site.slug}
              site={site}
              initialStatus={statusBySlug.get(site.slug) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
