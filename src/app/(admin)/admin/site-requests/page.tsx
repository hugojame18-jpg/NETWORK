import type { Metadata } from "next";
import { getSiteRequestsAdminList } from "@/lib/data/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SiteRequestActions } from "@/components/dashboard/admin/site-request-actions";
import { formatDate } from "@/lib/format";
import { getPromoSite, promoSiteName } from "@/lib/promo-sites";

export const metadata: Metadata = { title: "Demandes de sites" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
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
    <div className="space-y-4">
      {pending > 0 && (
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{pending}</span> demande{pending > 1 ? "s" : ""} de site en
          attente.
        </p>
      )}

      <Card className="shadow-premium">
        <CardContent className="p-0">
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
                      <p className="font-medium">{request.publisher.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        #{request.publisher.memberId} · {request.publisher.user.email}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{promoSiteName(request.siteSlug)}</p>
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
                    <TableCell className="text-muted-foreground">{formatDate(request.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[request.status]}>{STATUS_LABEL[request.status]}</Badge>
                    </TableCell>
                    <TableCell>
                      {request.status === "PENDING" && <SiteRequestActions requestId={request.id} />}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {requests.length === 0 && (
            <p className="py-16 text-center text-sm text-muted-foreground">Aucune demande de site pour le moment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
