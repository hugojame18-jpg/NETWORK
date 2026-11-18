import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * The headline block of the affiliate home: what they earned, stated plainly,
 * with the split spelled out so nobody has to ask why the figure differs from
 * the gross they saw on the offer.
 */
export function EarningsHero({
  month,
  today,
  total,
  balance,
  rate,
  formatValue,
}: {
  month: number;
  today: number;
  total: number;
  /** What is still to be paid out: earned so far, less what was already sent. */
  balance: number;
  rate: number;
  formatValue: (value: number) => string;
}) {
  return (
    <div className="surface-brand relative overflow-hidden p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow">Tes gains ce mois-ci</p>
          <p className="num mt-2.5 text-[42px] leading-none font-semibold sm:text-[48px]">
            {formatValue(month)}
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
          {Math.round(rate * 100)} % de chaque conversion
        </span>
      </div>

      <div className="rule-fade my-6" />

      <div className="grid grid-cols-2 gap-6 sm:max-w-2xl sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">Aujourd&apos;hui</p>
          <p className="num mt-1 text-xl font-semibold">{formatValue(today)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Depuis le début</p>
          <p className="num mt-1 text-xl font-semibold">{formatValue(total)}</p>
        </div>
        {/* Earnings answer "how am I doing"; this answers "what am I owed". */}
        <Link href="/dashboard/payments" className="group col-span-2 sm:col-span-1">
          <p className="text-xs text-muted-foreground">Solde à recevoir</p>
          <p className="num mt-1 inline-flex items-center gap-1.5 text-xl font-semibold text-primary">
            {formatValue(balance)}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </p>
        </Link>
      </div>
    </div>
  );
}
