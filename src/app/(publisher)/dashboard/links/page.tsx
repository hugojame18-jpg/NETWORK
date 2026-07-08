import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { getPublisherByUserId, getPublisherLinks } from "@/lib/data/publisher";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CopyLinkCell } from "@/components/dashboard/copy-link-cell";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Mes liens" };

export default async function LinksPage() {
  const user = await requireRole("PUBLISHER");
  const publisher = await getPublisherByUserId(user.id);
  const links = await getPublisherLinks(publisher.id);

  return (
    <Card className="shadow-premium">
      <CardContent className="p-0">
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
                  <Link href={`/dashboard/offers/${link.offerId}`} className="font-medium hover:underline">
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
                <TableCell>{formatCurrency(link.offer.payout)}</TableCell>
                <TableCell className="text-right">{link.clickCount}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(link.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {links.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Vous n&apos;avez pas encore généré de lien. Rendez-vous dans les offres disponibles.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
