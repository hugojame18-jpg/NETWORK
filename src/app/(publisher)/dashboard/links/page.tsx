import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Link2 } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { getPublisherByUserId, getPublisherLinks } from "@/lib/data/publisher";
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
import { CopyLinkCell } from "@/components/dashboard/copy-link-cell";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Mes liens" };

export default async function LinksPage() {
  const user = await requireRole("PUBLISHER");
  const publisher = await getPublisherByUserId(user.id);
  const links = await getPublisherLinks(publisher.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes liens"
        description="Un lien par offre, rien qu'à toi. Copie-le et envoie ton trafic dessus : chaque clic est compté."
        action={
          <Link
            href="/dashboard/offers"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition hover:brightness-110"
          >
            Demander un lien
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      <Card>
        <CardContent className="px-0">
          {links.length === 0 ? (
            <EmptyState
              icon={<Link2 />}
              title="Pas encore de lien"
              description="Choisis une offre et demande ton lien : on te le transmet, et tes statistiques démarrent dès le premier clic."
              action={
                <Link
                  href="/dashboard/offers"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:brightness-110"
                >
                  Voir les offres
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Offre</TableHead>
                  <TableHead>Lien</TableHead>
                  <TableHead>Payout</TableHead>
                  <TableHead className="text-right">Clics</TableHead>
                  <TableHead>Créé le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/offers/${link.offerId}`}
                        className="font-medium hover:underline"
                      >
                        {link.offer.name}
                      </Link>
                      {link.offer.status !== "ACTIVE" && (
                        <Badge variant="secondary" className="ml-2">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <CopyLinkCell token={link.token} />
                    </TableCell>
                    <TableCell className="num">
                      {formatCurrency(link.offer.payout)}
                    </TableCell>
                    <TableCell className="num text-right">
                      {link.clickCount}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(link.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
