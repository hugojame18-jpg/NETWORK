import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, Link2, MonitorSmartphone, Users, Wallet } from "lucide-react";
import { getAdminPulse, getPlatformSeries } from "@/lib/data/admin";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Pilotage" };

/** A queue that blocks an affiliate until it is cleared. */
function Pending({
  href,
  label,
  count,
  icon: Icon,
}: {
  href: string;
  label: string;
  count: number;
  icon: typeof Link2;
}) {
  const waiting = count > 0;
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg border p-4 transition hover:border-primary/40 ${
        waiting ? "border-warning/40 bg-warning/5" : "border-border"
      }`}
    >
      <Icon className={`h-5 w-5 shrink-0 ${waiting ? "text-warning" : "text-muted-foreground"}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{waiting ? "en attente de toi" : "rien à traiter"}</p>
      </div>
      <span className={`text-xl font-semibold ${waiting ? "text-warning" : "text-muted-foreground"}`}>{count}</span>
    </Link>
  );
}

export default async function AdminHomePage() {
  const [pulse, series] = await Promise.all([getAdminPulse(), getPlatformSeries(30)]);

  const toDo = pulse.pendingLinks + pulse.pendingSites + pulse.pendingPayments;

  return (
    <div className="space-y-6">
      {/* Money first: the two figures that say whether today went well. */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-premium border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Ta marge ce mois-ci</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight">{formatCurrency(pulse.month.margin)}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              sur {formatCurrency(pulse.month.revenue)} de CA brut —{" "}
              {formatCurrency(pulse.month.affiliateShare)} reversés aux affiliés
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-premium">
          <CardContent className="grid grid-cols-2 gap-4 pt-6 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">CA aujourd&apos;hui</p>
              <p className="mt-0.5 text-lg font-semibold">{formatCurrency(pulse.today.revenue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ta marge</p>
              <p className="mt-0.5 text-lg font-semibold text-success">{formatCurrency(pulse.today.margin)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Conversions</p>
              <p className="mt-0.5 text-lg font-semibold">{formatNumber(pulse.today.conversions)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Affiliés</p>
              <p className="mt-0.5 text-lg font-semibold">{formatNumber(pulse.publisherCount)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-premium">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>À traiter</CardTitle>
            <p className="text-xs text-muted-foreground">
              {toDo === 0 ? "Tout est à jour 👌" : `${toDo} demande${toDo > 1 ? "s" : ""} en attente`}
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Pending href="/admin/link-requests" label="Demandes de liens" count={pulse.pendingLinks} icon={Link2} />
          <Pending
            href="/admin/site-requests"
            label="Demandes de sites"
            count={pulse.pendingSites}
            icon={MonitorSmartphone}
          />
          <Pending href="/admin/payments" label="Paiements" count={pulse.pendingPayments} icon={Wallet} />
        </CardContent>
      </Card>

      {/* The evening ritual, surfaced where it is actually remembered. */}
      <Card className="shadow-premium">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium">Saisie du jour</p>
              <p className="text-sm text-muted-foreground">
                {pulse.statsEnteredToday > 0
                  ? `${pulse.statsEnteredToday} affilié${pulse.statsEnteredToday > 1 ? "s" : ""} renseigné${pulse.statsEnteredToday > 1 ? "s" : ""} aujourd'hui.`
                  : "Aucun chiffre saisi aujourd'hui."}
              </p>
            </div>
          </div>
          <Link
            href="/admin/stats"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Saisir les stats
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>

      <Card className="shadow-premium">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Activité du réseau — 30 jours</CardTitle>
            <Link href="/admin/revenue" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              Chiffre d&apos;affaires
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <PerformanceChart data={series} />
        </CardContent>
      </Card>

      <Link
        href="/admin/affiliates"
        className="flex items-center gap-3 rounded-lg border border-border p-4 transition hover:border-primary/40"
      >
        <Users className="h-5 w-5 text-muted-foreground" />
        <p className="flex-1 text-sm font-medium">Gérer mes affiliés</p>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    </div>
  );
}
