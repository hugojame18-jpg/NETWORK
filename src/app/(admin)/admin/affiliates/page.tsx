import type { Metadata } from "next";
import { Users } from "lucide-react";
import { getAffiliateSparks, getPublishersAdminList } from "@/lib/data/admin";
import { getAffiliateLedgers, emptyLedger } from "@/lib/data/ledger";
import { conversionRate } from "@/lib/trend";
import {
  AffiliatesTable,
  type AffiliateRow,
} from "@/components/dashboard/admin/affiliates-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Money, Section, StatTile } from "@/components/dashboard/kit";
import { formatCurrency, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Affiliés" };

// Balances move as payouts are recorded; this list must never be served stale.
export const dynamic = "force-dynamic";

export default async function AdminAffiliatesPage() {
  const [publishers, ledgers, sparks] = await Promise.all([
    getPublishersAdminList(),
    getAffiliateLedgers(),
    getAffiliateSparks(14),
  ]);

  const rows: AffiliateRow[] = publishers.map((publisher) => {
    const ledger = ledgers.get(publisher.id) ?? emptyLedger(publisher.id);
    return {
      id: publisher.id,
      userId: publisher.userId,
      memberId: publisher.memberId,
      name: publisher.user.name,
      email: publisher.user.email,
      status: publisher.user.status,
      clicks: publisher.totals.clicks,
      conversions: publisher.totals.conversions,
      rate: conversionRate(publisher.totals.conversions, publisher.totals.clicks),
      earned: ledger.earned,
      paid: ledger.paid,
      balance: ledger.balance,
      spark: sparks.get(publisher.id) ?? new Array<number>(14).fill(0),
    };
  });

  const owed = rows.reduce((sum, row) => sum + Math.max(0, row.balance), 0);
  const owedCount = rows.filter((row) => row.balance > 0.005).length;
  const earned = rows.reduce((sum, row) => sum + row.earned, 0);
  const paid = rows.reduce((sum, row) => sum + row.paid, 0);
  const active = rows.filter((row) => row.spark.some((value) => value > 0)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes affiliés"
        description="Ce que chacun a gagné pour lui, ce qui lui a été payé, et ce qu'il reste à lui envoyer."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Affiliés"
          value={<span className="num">{formatNumber(rows.length)}</span>}
          hint={`${formatNumber(active)} actif${active > 1 ? "s" : ""} sur 14 jours`}
        />
        <StatTile
          label="À payer"
          value={<Money value={owed} />}
          hint={
            owedCount === 0
              ? "personne n'attend d'argent"
              : `à ${formatNumber(owedCount)} affilié${owedCount > 1 ? "s" : ""}`
          }
        />
        <StatTile
          label="Gagné par les affiliés"
          value={<Money value={earned} />}
          hint="leur part, depuis le début"
        />
        <StatTile
          label="Déjà versé"
          value={<Money value={paid} />}
          hint={`sur ${formatCurrency(earned)} gagnés`}
        />
      </div>

      <Section
        title="Tous les comptes"
        description="Trié par solde : ceux à payer en premier. Clique sur un nom pour sa fiche."
        flush
      >
        {rows.length === 0 ? (
          <EmptyState
            icon={<Users />}
            title="Aucun affilié inscrit"
            description="Dès qu'une inscription arrive, le compte apparaît ici avec ses chiffres."
          />
        ) : (
          <AffiliatesTable rows={rows} />
        )}
      </Section>
    </div>
  );
}
