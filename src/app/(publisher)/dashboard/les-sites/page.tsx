import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MonitorSmartphone } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { getPublisherByUserId } from "@/lib/data/publisher";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { CreateSiteForm, SiteCard } from "@/components/dashboard/sites-manager";
import { netlifyConfigured } from "@/lib/sites/netlify";
import { getSiteOffer } from "@/lib/sites/store";

export const metadata: Metadata = { title: "Les sites" };
export const dynamic = "force-dynamic";

export default async function LesSitesPage() {
  // Section withdrawn: hidden, code kept.
  notFound();
  const user = await requireRole("PUBLISHER");
  const publisher = await getPublisherByUserId(user.id);

  const [sites, offer] = await Promise.all([
    prisma.affiliateSite.findMany({
      where: { publisherId: publisher.id },
      orderBy: { createdAt: "desc" },
    }),
    getSiteOffer(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Les sites"
        description="Génère ta page : elle porte un sub3 à elle, tu la mets en ligne en quelques clics, puis tu lui donnes ton nom de domaine."
      />

      <CreateSiteForm open={offer !== null} />

      {sites.length === 0 ? (
        <div className="surface">
          <EmptyState
            icon={<MonitorSmartphone />}
            title="Aucun site pour l'instant"
            description="Donne-lui un nom et un titre, puis clique sur « Générer le mien »."
          />
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {sites.map((s) => (
            <SiteCard
              key={s.id}
              hosting={netlifyConfigured()}
              site={{
                id: s.id,
                name: s.name,
                headline: s.headline,
                offerUrl: s.offerUrl,
                sub3: s.sub3,
                netlifySiteId: s.netlifySiteId,
                netlifyHost: s.netlifyHost,
                domain: s.domain,
                deployed: s.deployedAt !== null,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
