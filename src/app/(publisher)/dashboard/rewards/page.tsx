import type { Metadata } from "next";
import { requireRole } from "@/lib/rbac";
import { getPublisherByUserId, getRewardsOverview } from "@/lib/data/publisher";
import { RewardsPanel } from "@/components/dashboard/rewards-panel";
import { RewardLadder } from "@/components/dashboard/reward-ladder";
import { computePrizes } from "@/lib/loyalty";
import { PageHeader } from "@/components/dashboard/page-header";
import { Mascot } from "@/components/brand/mascot";

export const metadata: Metadata = { title: "Récompenses" };

import { appUrl } from "@/lib/app-url";

export default async function RewardsPage() {
  const user = await requireRole("PUBLISHER");
  const publisher = await getPublisherByUserId(user.id);
  const rewards = await getRewardsOverview(publisher.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Récompenses"
        description="Monte en palier, débloque des badges et parraine des affiliés pour gagner plus."
        leading={<Mascot className="h-14 w-14 shrink-0" />}
      />
      <div>
        <RewardLadder
          prizes={computePrizes(rewards.lifetimeRevenue)}
          lifetimeRevenue={rewards.lifetimeRevenue}
        />
      </div>

      <div>
        <RewardsPanel
          appUrl={appUrl()}
          tier={rewards.tier}
          lifetimeRevenue={rewards.lifetimeRevenue}
          bonusLifetime={rewards.bonusLifetime}
          bonusThisMonth={rewards.bonusThisMonth}
          badges={rewards.badges}
          referralCode={rewards.referralCode}
          referrals={rewards.referrals}
          referralCount={rewards.referralCount}
          referralEarnings={rewards.referralEarnings}
        />
      </div>
    </div>
  );
}
