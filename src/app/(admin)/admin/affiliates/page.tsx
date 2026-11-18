import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";
import { getPublishersAdminList } from "@/lib/data/admin";
import { getAffiliateLedgers, emptyLedger } from "@/lib/data/ledger";
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
import { Button } from "@/components/ui/button";
import { UserStatusMenu } from "@/components/dashboard/admin/user-status-menu";
import { ApplicationDetails } from "@/components/dashboard/admin/application-details";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";

export const metadata: Metadata = { title: "Affiliés" };

// Balances move as payouts are recorded; this list must never be served stale.
export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> =
  {
    ACTIVE: "default",
    PENDING: "secondary",
    SUSPENDED: "secondary",
    BANNED: "destructive",
  };

export default async function AdminAffiliatesPage() {
  const [publishers, ledgers] = await Promise.all([
    getPublishersAdminList(),
    getAffiliateLedgers(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes affiliés"
        description="Ce que chacun a gagné pour lui, ce qui lui a déjà été payé, et ce qu'il reste à lui envoyer. Clique sur un affilié pour ses stats mois par mois."
      />

      <Card>
        <CardContent className="px-0">
          {publishers.length === 0 ? (
            <EmptyState
              icon={<Users />}
              title="Aucun affilié inscrit"
              description="Dès qu'une inscription arrive, le compte apparaît ici avec ses chiffres."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Publisher</TableHead>
                  <TableHead>Statut compte</TableHead>
                  <TableHead className="text-right">Clics</TableHead>
                  <TableHead className="text-right">Conv.</TableHead>
                  <TableHead className="text-right">Sa part</TableHead>
                  <TableHead className="text-right">Déjà payé</TableHead>
                  <TableHead className="text-right">Solde</TableHead>
                  <TableHead>Inscrit le</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {publishers.map((publisher) => {
                  const ledger =
                    ledgers.get(publisher.id) ?? emptyLedger(publisher.id);
                  return (
                    <TableRow key={publisher.id}>
                      <TableCell className="font-mono text-sm font-medium text-muted-foreground">
                        #{publisher.memberId}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/affiliates/${publisher.id}`}
                          className="font-medium hover:underline"
                        >
                          {publisher.user.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {publisher.user.email}
                        </p>
                        <ApplicationDetails
                          workedWithNetworks={publisher.workedWithNetworks}
                          previousNetworks={publisher.previousNetworks}
                          affiliateExperience={publisher.affiliateExperience}
                          tiktokLinks={publisher.tiktokLinks}
                          website={publisher.website}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[publisher.user.status]}>
                          {publisher.user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="num text-right text-muted-foreground">
                        {formatNumber(publisher.totals.clicks)}
                      </TableCell>
                      <TableCell className="num text-right font-medium">
                        {formatNumber(publisher.totals.conversions)}
                      </TableCell>
                      {/* His cut, not the gross the network bills. */}
                      <TableCell className="num text-right font-medium">
                        {formatCurrency(ledger.earned)}
                      </TableCell>
                      <TableCell className="num text-right text-muted-foreground">
                        {formatCurrency(ledger.paid)}
                      </TableCell>
                      <TableCell className="num text-right font-semibold">
                        {formatCurrency(ledger.balance)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(publisher.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Ouvrir la fiche de ${publisher.user.name}`}
                            render={
                              <Link
                                href={`/admin/affiliates/${publisher.id}`}
                              />
                            }
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <UserStatusMenu
                            userId={publisher.userId}
                            currentStatus={publisher.user.status}
                            userLabel={publisher.user.name}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
