import type { Metadata } from "next";
import { getPublishersAdminList } from "@/lib/data/admin";
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
import { UserStatusMenu } from "@/components/dashboard/admin/user-status-menu";
import { ApplicationStatusActions } from "@/components/dashboard/admin/application-status-actions";
import { ApplicationDetails } from "@/components/dashboard/admin/application-details";
import { formatCurrency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Users } from "lucide-react";

export const metadata: Metadata = { title: "Affiliés" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> =
  {
    ACTIVE: "default",
    PENDING: "secondary",
    SUSPENDED: "secondary",
    BANNED: "destructive",
  };

const APPLICATION_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive"
> = {
  APPROVED: "default",
  PENDING: "secondary",
  REJECTED: "destructive",
};

export default async function AdminAffiliatesPage() {
  const publishers = await getPublishersAdminList();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes affiliés"
        description="Tous les comptes affiliés, leur activité et leur statut."
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
                  <TableHead>Candidature</TableHead>
                  <TableHead>Statut compte</TableHead>
                  <TableHead className="text-right">Conv. totales</TableHead>
                  <TableHead className="text-right">Revenu total</TableHead>
                  <TableHead className="text-right">Solde</TableHead>
                  <TableHead className="text-right">Total gagné</TableHead>
                  <TableHead>Inscrit le</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {publishers.map((publisher) => (
                  <TableRow key={publisher.id}>
                    <TableCell className="font-mono text-sm font-medium text-muted-foreground">
                      #{publisher.memberId}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{publisher.user.name}</p>
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
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            APPLICATION_VARIANT[publisher.applicationStatus]
                          }
                        >
                          {publisher.applicationStatus}
                        </Badge>
                        {/* Always available: a decision can be reversed, and access
                          to an approved account can be revoked. */}
                        <ApplicationStatusActions publisherId={publisher.id} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[publisher.user.status]}>
                        {publisher.user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {publisher.totals.conversions}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(publisher.totals.revenue)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(publisher.balance)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(publisher.totalEarned)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(publisher.createdAt)}
                    </TableCell>
                    <TableCell>
                      <UserStatusMenu
                        userId={publisher.userId}
                        currentStatus={publisher.user.status}
                        userLabel={publisher.user.name}
                      />
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
