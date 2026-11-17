import type { Metadata } from "next";
import { requireRole } from "@/lib/rbac";
import { getPublisherByUserId, getRewardsOverview } from "@/lib/data/publisher";
import { RewardsPanel } from "@/components/dashboard/rewards-panel";
import { RewardLadder } from "@/components/dashboard/reward-ladder";
import { computePrizes } from "@/lib/loyalty";

export const metadata: Metadata = { title: "Récompenses" };

import { appUrl } from "@/lib/app-url";

export default async function RewardsPage() {
  const user = await requireRole("PUBLISHER");
  const publisher = await getPublisherByUserId(user.id);
  const rewards = await getRewardsOverview(publisher.id);

  return (
    <div className="space-y-2">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Récompenses</h1>
        <p className="text-sm text-muted-foreground">
          Montez en palier, débloquez des badges et parrainez des affiliés pour gagner plus.
        </p>
      </div>
      <div className="pt-4">
        <RewardLadder prizes={computePrizes(rewards.lifetimeRevenue)} lifetimeRevenue={rewards.lifetimeRevenue} />
      </div>

      <div className="pt-4">
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
