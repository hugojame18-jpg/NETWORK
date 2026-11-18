import type { Metadata } from "next";
import { getSiteRequestsAdminList } from "@/lib/data/admin";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SiteRequestActions } from "@/components/dashboard/admin/site-request-actions";
import { formatDate } from "@/lib/format";
import { PROMO_SITES, getPromoSite, promoSiteName } from "@/lib/promo-sites";
import { PromoSiteCard } from "@/components/dashboard/promo-site-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { MonitorSmartphone } from "lucide-react";

export const metadata: Metadata = { title: "Demandes de sites" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> =
  {
    APPROVED: "default",
    PENDING: "secondary",
    REJECTED: "destructive",
  };

const STATUS_LABEL: Record<string, string> = {
  APPROVED: "Acceptée",
  PENDING: "En attente",
  REJECTED: "Refusée",
};

export default async function AdminSiteRequestsPage() {
  const requests = await getSiteRequestsAdminList();
  const pending = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Demandes de sites"
        description="Le catalogue que voient tes affiliés, et les demandes qu'ils t'adressent dessus."
        action={
          pending > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-warning/40 bg-warning/10 px-3 py-1.5 text-sm font-medium text-warning">
              {pending} en attente
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground">
              Tout est à jour
            </span>
          )
        }
      />

      <section className="space-y-4">
        <h2 className="eyebrow">Catalogue des sites</h2>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {PROMO_SITES.map((site) => (
            <PromoSiteCard key={site.slug} site={site} readOnly />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="eyebrow">Demandes reçues</h2>

        <Card>
          <CardContent className="px-0">
            {requests.length === 0 ? (
              <EmptyState
                icon={<MonitorSmartphone />}
                title="Aucune demande"
                description="Quand un affilié demande un site du catalogue, sa demande arrive ici."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Affilié</TableHead>
                    <TableHead>Site demandé</TableHead>
                    <TableHead>Demandé le</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => {
                    const site = getPromoSite(request.siteSlug);
                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          <p className="font-medium">
                            {request.publisher.user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            #{request.publisher.memberId} ·{" "}
                            {request.publisher.user.email}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">
                            {promoSiteName(request.siteSlug)}
                          </p>
                          {site && (
                            <a
                              href={site.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              {site.url}
                            </a>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(request.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANT[request.status]}>
                            {STATUS_LABEL[request.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.status === "PENDING" && (
                            <SiteRequestActions requestId={request.id} />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
