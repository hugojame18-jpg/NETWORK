import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricProps {
  label: string;
  /** Already formatted — currency, percentage, plain count. */
  value: string;
  /** Short qualifier under the number, e.g. "sur 1 240 clics". */
  hint?: string;
  /** Percentage change against the previous period. Omit when there's nothing to compare. */
  delta?: number;
  /** A pre-rendered icon element, e.g. `<Wallet />` — sized by this component. */
  icon?: ReactNode;
  /** Pulls the brand tint in. Reserved for the single headline figure on a page. */
  accent?: boolean;
  className?: string;
}

/**
 * One number, stated plainly. The label sits above the figure rather than below
 * it, so a row of these scans top-to-bottom like a table of contents instead of
 * forcing the eye back up after every value.
 */
export function Metric({
  label,
  value,
  hint,
  delta,
  icon,
  accent = false,
  className,
}: MetricProps) {
  const up = (delta ?? 0) >= 0;

  return (
    <div className={cn(accent ? "surface-brand" : "surface", "p-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow truncate">{label}</p>
        {icon && (
          <span
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg [&_svg]:h-3.5 [&_svg]:w-3.5",
              accent
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground",
            )}
          >
            {icon}
          </span>
        )}
      </div>

      <p className="num mt-3 text-[28px] leading-none font-semibold">{value}</p>

      <div className="mt-2 flex items-center gap-2">
        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
              up
                ? "bg-success/12 text-success"
                : "bg-destructive/12 text-destructive",
            )}
          >
            {up ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(delta).toFixed(1)} %
          </span>
        )}
        {hint && (
          <p className="truncate text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    </div>
  );
}

/** Evenly spaced row of metrics — 2 up on phones, 4 on a desktop. */
export function MetricRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {children}
    </div>
  );
}
