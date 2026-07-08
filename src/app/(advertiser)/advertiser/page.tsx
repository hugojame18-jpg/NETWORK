import type { Metadata } from "next";
import { CalendarRange, Layers, TrendingUp, Users } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { getAdvertiserByUserId, getSpendSummary, getSpendSeries, getTopPublishers } from "@/lib/data/advertiser";
import { StatCard } from "@/components/dashboard/stat-card";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = { title: "Overview" };

export default async function AdvertiserOverviewPage() {
  const user = await requireRole("ADVERTISER");
  const advertiser = await getAdvertiserByUserId(user.id);

  const [summary, series, topPublishers] = await Promise.all([
    getSpendSummary(advertiser.id),
    getSpendSeries(advertiser.id, 90),
    getTopPublishers(advertiser.id),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Dépenses aujourd'hui" value={summary.today} prefix="$" decimals={2} icon={<TrendingUp />} index={0} />
        <StatCard label="Dépenses du mois" value={summary.month} prefix="$" decimals={2} icon={<CalendarRange />} index={1} />
        <StatCard label="Dépenses totales" value={summary.total} prefix="$" decimals={2} icon={<TrendingUp />} index={2} />
        <StatCard label="Offres actives" value={summary.activeOffers} icon={<Layers />} index={3} />
      </div>

      <PerformanceChart data={series} />

      <Card className="shadow-premium">
        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
          <Users className="h-4 w-4 text-muted-foreground" />
          <CardTitle>Top publishers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {topPublishers.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Aucune conversion enregistrée pour le moment.
            </p>
          )}
          {topPublishers.map((publisher) => (
            <div key={publisher.publisherId} className="flex items-center justify-between rounded-lg px-2 py-3 not-last:border-b border-border/60">
              <div>
                <p className="text-sm font-medium">{publisher.name}</p>
                <p className="text-xs text-muted-foreground">{publisher.conversions} conversions</p>
              </div>
              <span className="text-sm font-semibold">{formatCurrency(publisher.spend)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
