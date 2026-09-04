import { Lock, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { PrizeProgress } from "@/lib/loyalty";

interface RewardLadderProps {
  prizes: PrizeProgress[];
  lifetimeRevenue: number;
}

/**
 * The prize ladder: every reward the network offers, in ascending order, with
 * the ones already earned highlighted and the next one showing exactly how
 * much revenue is left. Locked prizes stay visible on purpose — seeing the
 * MacBook two steps away is the whole point.
 */
export function RewardLadder({ prizes, lifetimeRevenue }: RewardLadderProps) {
  const next = prizes.find((prize) => !prize.unlocked);
  const unlockedCount = prizes.filter((prize) => prize.unlocked).length;

  return (
    <Card className="shadow-premium">
      <CardHeader>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <CardTitle>Récompenses à débloquer</CardTitle>
          <p className="text-xs text-muted-foreground">
            {unlockedCount} / {prizes.length} débloquée{unlockedCount > 1 ? "s" : ""}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {next
            ? `Encore ${formatCurrency(next.remaining)} de revenus pour débloquer ${next.label}.`
            : "Tu as débloqué toutes les récompenses. Chapeau."}
        </p>
      </CardHeader>

      <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {prizes.map((prize) => {
          const isNext = next?.key === prize.key;
          return (
            <div
              key={prize.key}
              className={`relative overflow-hidden rounded-xl border p-4 transition ${
                prize.unlocked
                  ? "border-primary/40 bg-primary/5"
                  : isNext
                    ? "border-primary/30 bg-muted/40"
                    : "border-border bg-muted/20"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xl ${prize.gradient} ${
                    prize.unlocked ? "" : "opacity-40 grayscale"
                  }`}
                  aria-hidden
                >
                  {prize.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className={`font-semibold ${prize.unlocked ? "" : "text-muted-foreground"}`}>{prize.label}</p>
                    {prize.unlocked ? (
                      <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                    ) : (
                      <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{prize.description}</p>
                </div>
              </div>

              <div className="mt-3">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className={`h-full rounded-full ${prize.unlocked ? "bg-primary" : "bg-primary/50"}`}
                    style={{ width: `${prize.progress}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {prize.unlocked
                    ? "Débloquée — contacte-nous pour la recevoir"
                    : `${formatCurrency(lifetimeRevenue)} / ${formatCurrency(prize.minRevenue)}`}
                </p>
              </div>

              {isNext && (
                <span className="absolute top-2 right-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                  Prochaine
                </span>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
