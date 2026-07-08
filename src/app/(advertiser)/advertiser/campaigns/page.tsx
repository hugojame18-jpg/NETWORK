import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { getAdvertiserByUserId, getCampaigns } from "@/lib/data/advertiser";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CampaignFormDialog } from "@/components/dashboard/campaign-form-dialog";
import { formatCurrency, formatDate, toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Campagnes" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  ACTIVE: "default",
  DRAFT: "secondary",
  PAUSED: "secondary",
  ENDED: "destructive",
};

export default async function CampaignsPage() {
  const user = await requireRole("ADVERTISER");
  const advertiser = await getAdvertiserByUserId(user.id);
  const campaigns = await getCampaigns(advertiser.id);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CampaignFormDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="hover-lift shadow-premium">
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <Link href={`/advertiser/campaigns/${campaign.id}`} className="font-medium hover:underline">
                    {campaign.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">{campaign._count.offers} offre(s)</p>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={STATUS_VARIANT[campaign.status]}>{campaign.status}</Badge>
                  <CampaignFormDialog
                    campaign={{
                      id: campaign.id,
                      name: campaign.name,
                      description: campaign.description,
                      budget: campaign.budget ? toNumber(campaign.budget).toString() : null,
                      status: campaign.status,
                    }}
                  />
                </div>
              </div>
              {campaign.description && <p className="line-clamp-2 text-sm text-muted-foreground">{campaign.description}</p>}
              <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                <span>Budget : {campaign.budget ? formatCurrency(campaign.budget) : "—"}</span>
                <span>{formatDate(campaign.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {campaigns.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Vous n&apos;avez pas encore de campagne. Créez-en une pour commencer à y rattacher des offres.
        </p>
      )}
    </div>
  );
}
