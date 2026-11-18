import type { Metadata } from "next";
import { getLinkRequestsAdminList } from "@/lib/data/admin";
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
import { DeliverLinkForm } from "@/components/dashboard/admin/deliver-link-form";
import { formatDate } from "@/lib/format";
import { verticalIcon } from "@/lib/verticals";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Link2 } from "lucide-react";

export const metadata: Metadata = { title: "Demandes de liens" };

export default async function AdminLinkRequestsPage() {
  const links = await getLinkRequestsAdminList();
  const pending = links.filter((l) => l.status === "REQUESTED").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demandes de liens"
        description="Tant que tu n'as pas renvoyé son lien, un affilié ne peut rien lancer. C'est la file à vider en premier."
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

      <Card>
        <CardContent className="px-0">
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
                  <TableCell className="text-muted-foreground">
                    {formatDate(link.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        link.status === "DELIVERED" ? "default" : "secondary"
                      }
                    >
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
            <EmptyState
              icon={<Link2 />}
              title="Aucune demande"
              description="Quand un affilié demande son lien sur une offre, la demande arrive ici."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
