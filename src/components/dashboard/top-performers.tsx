import type { LeaderboardEntry } from "@/lib/data/publisher";
import { Section } from "@/components/dashboard/kit";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";

interface TopPerformersProps {
  periodLabel: string;
  top: LeaderboardEntry[];
  /** Present only when the current publisher ranks outside `top`. */
  me: LeaderboardEntry | null;
  totalRanked: number;
}

function Row({ entry, max }: { entry: LeaderboardEntry; max: number }) {
  const share = max > 0 ? entry.conversions / max : 0;
  return (
    <li
      className={cn(
        "flex items-center gap-4 px-5 py-3",
        entry.isCurrent && "bg-primary/5",
      )}
    >
      <span
        className={cn(
          "num flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          entry.rank === 1
            ? "bg-primary text-primary-foreground"
            : entry.rank <= 3
              ? "bg-primary/12 text-primary"
              : "bg-muted text-muted-foreground",
        )}
      >
        {entry.rank}
      </span>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate text-sm font-medium">
          {entry.isCurrent ? "Toi" : entry.displayName}
          {entry.isCurrent && (
            <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-primary uppercase">
              c&apos;est toi
            </span>
          )}
        </p>
        {/* The bar is the ranking: how far each one is from the leader reads
            at a glance, without comparing four numbers. */}
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full",
              entry.isCurrent ? "bg-primary" : "bg-primary/45",
            )}
            style={{ width: `${Math.max(2, share * 100)}%` }}
          />
        </div>
      </div>

      <p className="shrink-0 text-right">
        <span className="num block text-sm font-semibold">
          {formatNumber(entry.conversions)}
        </span>
        <span className="block text-[11px] text-muted-foreground">
          conversions
        </span>
      </p>
    </li>
  );
}

/**
 * The month's ranking, by conversions.
 *
 * Other affiliates appear under a masked name and with their conversion count
 * only — what each of them earned is their own business and is not shown to
 * the rest of the network.
 */
export function TopPerformers({
  periodLabel,
  top,
  me,
  totalRanked,
}: TopPerformersProps) {
  const max = Math.max(1, ...top.map((entry) => entry.conversions));

  return (
    <Section
      title="Classement du mois"
      description={`${periodLabel.charAt(0).toUpperCase()}${periodLabel.slice(1)} · ${formatNumber(totalRanked)} affiliés classés`}
      flush
    >
      <ul className="divide-y divide-border pb-1">
        {top.map((entry) => (
          <Row key={entry.publisherId} entry={entry} max={max} />
        ))}
        {me && <Row entry={me} max={max} />}
      </ul>
    </Section>
  );
}
