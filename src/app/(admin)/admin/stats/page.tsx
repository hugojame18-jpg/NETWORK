import type { Metadata } from "next";
import { getDailyStatsAdminList, getPublishersForSelect } from "@/lib/data/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DailyStatFormDialog } from "@/components/dashboard/admin/daily-stat-form-dialog";
import { DeleteDailyStatButton } from "@/components/dashboard/admin/delete-daily-stat-button";
import { formatCurrency, formatCalendarDate, formatNumber } from "@/lib/format";
import { toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Statistiques quotidiennes" };

export default async function AdminDailyStatsPage() {
  const [stats, publishers] = await Promise.all([getDailyStatsAdminList(), getPublishersForSelect()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Statistiques quotidiennes des publishers</h2>
          <p className="text-sm text-muted-foreground">
            Ces chiffres sont saisis manuellement chaque jour et sont les seules statistiques affichées côté publisher — aucun
            calcul automatique n&apos;est effectué.
          </p>
        </div>
        <DailyStatFormDialog publishers={publishers} />
      </div>

      <Card className="shadow-premium">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Publisher</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Clics</TableHead>
                <TableHead className="text-right">Hosts</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="text-right">Revenus</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((stat) => (
                <TableRow key={stat.id}>
                  <TableCell className="font-medium">
                    {stat.publisher.user.name || stat.publisher.user.email}
                    {stat.publisher.companyName && (
                      <span className="ml-1.5 text-xs text-muted-foreground">({stat.publisher.companyName})</span>
                    )}
                  </TableCell>
                  <TableCell>{formatCalendarDate(stat.date)}</TableCell>
                  <TableCell className="text-right">{formatNumber(stat.clicks)}</TableCell>
                  <TableCell className="text-right">{formatNumber(stat.hosts)}</TableCell>
                  <TableCell className="text-right">{formatNumber(stat.conversions)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(toNumber(stat.revenue))}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <DailyStatFormDialog
                        publishers={publishers}
                        stat={{
                          id: stat.id,
                          publisherId: stat.publisherId,
                          date: stat.date.toISOString().slice(0, 10),
                          clicks: String(stat.clicks),
                          hosts: String(stat.hosts),
                          conversions: String(stat.conversions),
                          revenue: String(toNumber(stat.revenue)),
                        }}
                      />
                      <DeleteDailyStatButton id={stat.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {stats.length === 0 && (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Aucune statistique saisie pour le moment. Cliquez sur « Nouvelle journée » pour commencer.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
