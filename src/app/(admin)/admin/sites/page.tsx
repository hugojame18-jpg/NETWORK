import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { SiteOfferForm } from "@/components/dashboard/admin/site-offer-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { netlifyConfigured } from "@/lib/sites/netlify";
import { getSiteOffer, getSiteOfferDraft } from "@/lib/sites/store";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Sites des affiliés" };
export const dynamic = "force-dynamic";

export default async function AdminSitesPage() {
  const [draft, complete, sites] = await Promise.all([
    getSiteOfferDraft(),
    getSiteOffer(),
    prisma.affiliateSite.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { publisher: { select: { memberId: true, companyName: true } } },
    }),
  ]);
  const hosting = netlifyConfigured();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sites des affiliés"
        description="Ce que disent les pages que les affiliés génèrent. Tant que tout n'est pas rempli, personne ne peut en générer."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5 text-sm">
            <p className="font-medium">
              {complete ? "Ouvert aux affiliés" : "Fermé : conditions incomplètes"}
            </p>
            <p className="mt-1 text-muted-foreground">
              {complete
                ? "Chaque affilié peut générer jusqu'à 10 sites."
                : "Remplis tous les champs ci-dessous."}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-sm">
            <p className="font-medium">
              {hosting ? "Mise en ligne automatique active" : "Mise en ligne automatique inactive"}
            </p>
            <p className="mt-1 text-muted-foreground">
              {hosting
                ? "Les sites partent sur ton compte Netlify."
                : "Sans le jeton Netlify, les affiliés téléchargent le site et le déposent eux-mêmes."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conditions de l&apos;offre</CardTitle>
        </CardHeader>
        <CardContent>
          <SiteOfferForm initial={draft} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sites générés ({sites.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {sites.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun pour l&apos;instant.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {sites.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <span>
                    <span className="font-medium">{s.name}</span>{" "}
                    <span className="text-muted-foreground">
                      · {s.publisher.companyName ?? s.publisher.memberId} · sub3 {s.sub3}
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    {s.domain ?? s.netlifyHost ?? "pas en ligne"}
                    {s.deployedAt ? ` · ${formatDateTime(s.deployedAt)}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
