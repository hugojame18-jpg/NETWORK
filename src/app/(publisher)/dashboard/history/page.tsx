import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import {
  getPublisherByUserId,
  getClickHistory,
  getConversionHistory,
} from "@/lib/data/publisher";
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
import { cn } from "@/lib/utils";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { History } from "lucide-react";

export const metadata: Metadata = { title: "Historique" };

const PAGE_SIZE = 15;

interface HistoryPageProps {
  searchParams: Promise<{ tab?: string; page?: string }>;
}

const CONVERSION_LABELS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  APPROVED: { label: "Approuvée", variant: "default" },
  PENDING: { label: "En attente", variant: "secondary" },
  REJECTED: { label: "Refusée", variant: "destructive" },
};

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const user = await requireRole("PUBLISHER");
  const publisher = await getPublisherByUserId(user.id);
  const { tab = "clicks", page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const isClicks = tab !== "conversions";

  const clickData = isClicks
    ? await getClickHistory(publisher.id, { page, pageSize: PAGE_SIZE })
    : null;
  const conversionData = !isClicks
    ? await getConversionHistory(publisher.id, { page, pageSize: PAGE_SIZE })
    : null;

  const total = clickData?.total ?? conversionData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historique"
        description="Le détail brut : chaque clic et chaque conversion, ligne par ligne."
      />

      {/* Segmented control rather than two buttons: it reads as one choice. */}
      <div className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5">
        {[
          { tab: "clicks", label: "Clics", on: isClicks },
          { tab: "conversions", label: "Conversions", on: !isClicks },
        ].map((entry) => (
          <Link
            key={entry.tab}
            href={`/dashboard/history?tab=${entry.tab}`}
            className={cn(
              "rounded-[6px] px-3.5 py-1.5 text-sm font-medium transition-colors",
              entry.on
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {entry.label}
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="px-0">
          {total > 0 && clickData && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Offre</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Pays</TableHead>
                  <TableHead>Référent</TableHead>
                  <TableHead className="text-right">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clickData.items.map((click) => (
                  <TableRow key={click.id}>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(click.createdAt)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {click.offer.name}
                    </TableCell>
                    <TableCell>{click.device}</TableCell>
                    <TableCell>{click.country ?? "—"}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {click.referrer ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {click.isFraud ? (
                        <Badge variant="destructive">Fraude</Badge>
                      ) : (
                        <Badge variant="secondary">Valide</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {total > 0 && conversionData && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Offre</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead className="text-right">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversionData.items.map((conversion) => (
                  <TableRow key={conversion.id}>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(conversion.createdAt)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {conversion.offer.name}
                    </TableCell>
                    <TableCell className="num">
                      {formatCurrency(conversion.payout)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={CONVERSION_LABELS[conversion.status].variant}
                      >
                        {CONVERSION_LABELS[conversion.status].label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {total === 0 && (
            <EmptyState
              icon={<History />}
              title={
                isClicks
                  ? "Aucun clic enregistré"
                  : "Aucune conversion enregistrée"
              }
              description="Dès que ton trafic démarre, chaque ligne apparaît ici en temps réel."
            />
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} sur {totalPages}
          </span>
          <div className="flex gap-2">
            <Link
              href={`/dashboard/history?tab=${tab}&page=${Math.max(1, page - 1)}`}
              className={cn(page <= 1 && "pointer-events-none opacity-50")}
            >
              <Button variant="outline" size="sm">
                Précédent
              </Button>
            </Link>
            <Link
              href={`/dashboard/history?tab=${tab}&page=${Math.min(totalPages, page + 1)}`}
              className={cn(
                page >= totalPages && "pointer-events-none opacity-50",
              )}
            >
              <Button variant="outline" size="sm">
                Suivant
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
