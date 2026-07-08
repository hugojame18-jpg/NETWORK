import type { Metadata } from "next";
import Link from "next/link";
import { Users, Megaphone, Wallet, Coins, TrendingUp, Clock } from "lucide-react";
import { getPlatformStats, getPlatformSeries } from "@/lib/data/admin";
import { StatCard } from "@/components/dashboard/stat-card";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  const [stats, series] = await Promise.all([getPlatformStats(), getPlatformSeries(90)]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Publishers" value={stats.publisherCount} icon={<Users />} index={0} />
        <StatCard label="Annonceurs" value={stats.advertiserCount} icon={<Megaphone />} index={1} />
        <StatCard label="Revenus générés" value={stats.revenue} prefix="$" decimals={2} icon={<TrendingUp />} index={2} />
        <StatCard label="Commissions versées" value={stats.commissions} prefix="$" decimals={2} icon={<Coins />} index={3} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/offers">
          <Card className="hover-lift shadow-premium">
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Offres en attente de validation</p>
                <p className="mt-1 text-2xl font-semibold">{stats.pendingOffers}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/payments">
          <Card className="hover-lift shadow-premium">
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Paiements en attente</p>
                <p className="mt-1 text-2xl font-semibold">{stats.pendingPayments}</p>
              </div>
              <Wallet className="h-8 w-8 text-warning" />
            </CardContent>
          </Card>
        </Link>
      </div>

      <PerformanceChart data={series} />
    </div>
  );
}
