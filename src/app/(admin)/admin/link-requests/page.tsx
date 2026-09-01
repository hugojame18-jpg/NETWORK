import type { Metadata } from "next";
import { getLinkRequestsAdminList } from "@/lib/data/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DeliverLinkForm } from "@/components/dashboard/admin/deliver-link-form";
import { formatDate } from "@/lib/format";
import { verticalIcon } from "@/lib/verticals";

export const metadata: Metadata = { title: "Demandes de liens" };

export default async function AdminLinkRequestsPage() {
  const links = await getLinkRequestsAdminList();
  const pending = links.filter((l) => l.status === "REQUESTED").length;

  return (
    <div className="space-y-4">
      {pending > 0 && (
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{pending}</span> demande{pending > 1 ? "s" : ""} en attente de ton lien.
        </p>
      )}

      <Card className="shadow-premium">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Affilié</TableHead>
                <TableHead>Offre</TableHead>
                <TableHead>Demandé le</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Lien d&apos;affiliation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>
                    <p className="font-medium">{link.publisher.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      #{link.publisher.memberId} · {link.publisher.user.email}
                    </p>
                  </TableCell>
                  <TableCell>
                    {verticalIcon(link.offer.category)} {link.offer.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(link.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={link.status === "DELIVERED" ? "default" : "secondary"}>
                      {link.status === "DELIVERED" ? "Envoyé" : "En attente"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DeliverLinkForm
                      linkId={link.id}
                      currentUrl={link.targetUrl}
                      delivered={link.status === "DELIVERED"}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {links.length === 0 && (
            <p className="py-16 text-center text-sm text-muted-foreground">Aucune demande de lien pour le moment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
