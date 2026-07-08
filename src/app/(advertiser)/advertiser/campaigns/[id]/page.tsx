import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { getAdvertiserByUserId, getCampaignById } from "@/lib/data/advertiser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

interface CampaignDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CampaignDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Campagne ${id}` };
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  ACTIVE: "default",
  PENDING: "secondary",
  DRAFT: "secondary",
  PAUSED: "secondary",
  ARCHIVED: "destructive",
};

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const user = await requireRole("ADVERTISER");
  const advertiser = await getAdvertiserByUserId(user.id);
  const { id } = await params;

  const campaign = await getCampaignById(advertiser.id, id);
  if (!campaign) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/advertiser/campaigns" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour aux campagnes
      </Link>

      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle className="text-xl">{campaign.name}</CardTitle>
          {campaign.description && <p className="text-sm text-muted-foreground">{campaign.description}</p>}
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Statut</p>
            <Badge className="mt-1">{campaign.status}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Budget</p>
            <p className="mt-1 font-semibold">{campaign.budget ? formatCurrency(campaign.budget) : "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Dépensé</p>
            <p className="mt-1 font-semibold">{formatCurrency(campaign.spent)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle>Offres rattachées</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {campaign.offers.map((offer) => (
            <Link
              key={offer.id}
              href={`/advertiser/offers/${offer.id}`}
              className="flex items-center justify-between rounded-lg px-2 py-3 not-last:border-b border-border/60 hover:bg-muted/40"
            >
              <span className="text-sm font-medium">{offer.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{formatCurrency(offer.payout)}</span>
                <Badge variant={STATUS_VARIANT[offer.status]}>{offer.status}</Badge>
              </div>
            </Link>
          ))}
          {campaign.offers.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">Aucune offre rattachée à cette campagne.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
