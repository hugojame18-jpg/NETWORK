import type { Metadata } from "next";
import { Target } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import {
  getConversionJournal,
  getPerformanceSeries,
  getPublisherByUserId,
} from "@/lib/data/publisher";
import { compareWindows, sumWindow, tail } from "@/lib/trend";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatTile } from "@/components/dashboard/kit";
import { formatCalendarDate, formatCurrency, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Conversions" };

// A conversion that just landed has to be here on the next refresh.
export const dynamic = "force-dynamic";

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Every conversion, one line each, newest first.
 *
 * This screen used to list clicks and leads from the old tracking tables,
 * which nothing fills any more — it was an empty page with two tabs. What an
 * affiliate actually wants from a "history" is the answer to "what converted,
 * and when", so that is what it shows.
 */
export default async function ConversionsPage() {
  const user = await requireRole("PUBLISHER");
  const publisher = await getPublisherByUserId(user.id);

  const [journal, series] = await Promise.all([
    getConversionJournal(publisher.id),
    getPerformanceSeries(publisher.id, 60),
  ]);

  const count = (day: (typeof series)[number]) => day.conversions;
  const today = sumWindow(series, count, 1);
  const yesterday = sumWindow(series, count, 1, 1);
  const week = compareWindows(series, count, 7);
  const month = compareWindows(series, count, 30);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conversions"
        description="Chaque conversion validée, une par une, avec ce qu'elle t'a rapporté."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Aujourd'hui"
          value={<span className="num">{formatNumber(today)}</span>}
          hint={`hier : ${formatNumber(yesterday)}`}
          spark={tail(series, 14).map(count)}
        />
        <StatTile
          label="7 derniers jours"
          value={<span className="num">{formatNumber(week.current)}</span>}
          delta={week.delta}
          hint="vs les 7 jours d'avant"
          spark={tail(series, 30).map(count)}
        />
        <StatTile
          label="30 derniers jours"
          value={<span className="num">{formatNumber(month.current)}</span>}
          delta={month.delta}
          hint="vs les 30 jours d'avant"
          spark={tail(series, 60).map(count)}
        />
      </div>

      {journal.length === 0 ? (
        <div className="surface">
          <EmptyState
            icon={<Target />}
            title="Aucune conversion pour l'instant"
            description="Dès qu'une conversion est validée par l'annonceur, elle apparaît ici avec son heure et son montant."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {journal.map((day) => (
            <section key={day.day} className="surface overflow-hidden">
              <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border bg-muted/30 px-5 py-3">
                <h2 className="text-sm font-semibold">
                  {formatCalendarDate(day.day)}
                </h2>
                <p className="text-[13px] text-muted-foreground">
                  <span className="num font-medium text-foreground">
                    {formatNumber(day.count)}
                  </span>{" "}
                  conversion{day.count > 1 ? "s" : ""} ·{" "}
                  <span className="num font-semibold text-foreground">
                    {formatCurrency(day.total)}
                  </span>
                </p>
              </header>
              <ul className="divide-y divide-border">
                {day.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-4 px-5 py-2.5"
                  >
                    <span className="num w-12 shrink-0 text-[13px] text-muted-foreground">
                      {timeFormatter.format(item.at)}
                    </span>
                    <span
                      className={
                        item.reversed
                          ? "h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40"
                          : "h-1.5 w-1.5 shrink-0 rounded-full bg-success"
                      }
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {item.offer}
                      {item.reversed && (
                        <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                          Annulée par l&apos;annonceur
                        </span>
                      )}
                    </span>
                    <span
                      className={
                        item.reversed
                          ? "num text-sm text-muted-foreground line-through"
                          : "num text-sm font-semibold"
                      }
                    >
                      {!item.reversed && "+"}
                      {formatCurrency(item.earnings)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <p className="text-center text-xs text-muted-foreground">
            Les 200 dernières conversions sont affichées. Pour une période plus
            ancienne, les totaux par jour sont dans Statistiques.
          </p>
        </div>
      )}
    </div>
  );
}
