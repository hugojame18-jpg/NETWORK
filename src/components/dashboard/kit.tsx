import { useId, type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { moneyParts } from "@/lib/format";

/**
 * The small set of pieces both dashboards are built from.
 *
 * Everything here is a server component with no state: a figure, a trend, a
 * status, a person. Pages compose these instead of each styling its own
 * number, which is how two screens end up showing the same amount in two
 * sizes and two colours.
 */

// ---------------------------------------------------------------------------
// Money
// ---------------------------------------------------------------------------

/**
 * An amount, with the cents set back.
 *
 * The eye reads "3 975" and only checks ",00" when reconciling, so the cents
 * and the symbol are drawn lighter and smaller.
 *
 * For headline figures only. In a table or a feed the text is already small,
 * and cents at two-thirds of that are no longer readable — use
 * `formatCurrency` there.
 */
export function Money({
  value,
  className,
  sign = false,
}: {
  value: number;
  className?: string;
  /** Prefix a "+" on positive amounts — for a feed of gains. */
  sign?: boolean;
}) {
  const { negative, whole, cents } = moneyParts(value);
  return (
    <span className={cn("num whitespace-nowrap", className)}>
      {negative ? "−" : sign && value > 0 ? "+" : ""}
      {whole}
      <span className="text-[0.62em] font-medium opacity-55">
        {cents}&nbsp;$
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Trend
// ---------------------------------------------------------------------------

/**
 * A change against the previous period.
 *
 * Renders nothing when there is nothing to compare with (`null`): an invented
 * "+100 %" on an affiliate's first week teaches people to ignore the pill.
 */
export function Delta({
  value,
  className,
  /** For metrics where a rise is bad news. */
  invert = false,
}: {
  value: number | null | undefined;
  className?: string;
  invert?: boolean;
}) {
  if (value === null || value === undefined || !Number.isFinite(value))
    return null;

  const flat = Math.abs(value) < 0.05;
  const good = invert ? value < 0 : value > 0;
  const Icon = flat ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={cn(
        "num inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
        flat
          ? "bg-muted text-muted-foreground"
          : good
            ? "bg-success/12 text-success"
            : "bg-destructive/10 text-destructive",
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(value).toLocaleString("fr-FR", {
        maximumFractionDigits: Math.abs(value) >= 100 ? 0 : 1,
      })}
      &nbsp;%
    </span>
  );
}

/**
 * A tiny line of a series, with no axes: the shape of the last weeks, not a
 * chart to read values from.
 *
 * Plain SVG so it renders on the server and costs nothing on a page with a
 * dozen of them. A flat or empty series draws a quiet baseline instead of
 * disappearing, so a row of tiles keeps its rhythm.
 */
export function Sparkline({
  data,
  className,
  tone = "primary",
  height = 36,
}: {
  data: number[];
  className?: string;
  tone?: "primary" | "muted";
  height?: number;
}) {
  const width = 120;
  const pad = 2;
  const values = data.length > 1 ? data : [0, 0];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const step = (width - pad * 2) / (values.length - 1);

  const points = values.map((value, index) => {
    const x = pad + index * step;
    // A series with no variation sits on the baseline rather than mid-air.
    const ratio = max === min ? 0 : (value - min) / span;
    const y = height - pad - ratio * (height - pad * 2);
    return [x, y] as const;
  });

  const line = points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${points[points.length - 1][0].toFixed(1)} ${height} L${points[0][0].toFixed(1)} ${height} Z`;
  const stroke = tone === "primary" ? "var(--primary)" : "var(--muted-foreground)";
  const id = `spark-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn("h-9 w-full overflow-visible", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.18} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Tile
// ---------------------------------------------------------------------------

/**
 * One figure with its context: what it is, how it moved, what it looked like
 * getting here. The label sits on top so a row of tiles scans like a table of
 * contents; the sparkline sits at the bottom edge so it never competes with
 * the number.
 */
export function StatTile({
  label,
  value,
  delta,
  hint,
  spark,
  icon,
  className,
}: {
  label: string;
  /** Already rendered — a `<Money />`, a formatted count. */
  value: ReactNode;
  delta?: number | null;
  /** What the delta compares with, or a plain qualifier. */
  hint?: ReactNode;
  spark?: number[];
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("surface flex flex-col p-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow truncate">{label}</p>
        {icon && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:h-3.5 [&_svg]:w-3.5">
            {icon}
          </span>
        )}
      </div>

      <p className="mt-3 text-[28px] leading-none font-semibold tracking-tight">
        {value}
      </p>

      <div className="mt-2.5 flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1">
        <Delta value={delta} />
        {hint && (
          <span className="truncate text-xs text-muted-foreground">{hint}</span>
        )}
      </div>

      {spark && <Sparkline data={spark} className="mt-4" />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

/**
 * A titled block of a page. One header shape everywhere — title, the sentence
 * that says what the block answers, and at most one action on the right — so
 * the eye learns where to look once.
 */
export function Section({
  title,
  description,
  action,
  children,
  className,
  flush = false,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Lets a table or a list run edge to edge inside the card. */
  flush?: boolean;
}) {
  return (
    <section className={cn("surface flex flex-col overflow-hidden", className)}>
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-5 pt-5 pb-4">
        <div className="min-w-0">
          <h2 className="text-[15px] leading-snug font-semibold tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      <div className={cn("flex-1", flush ? "" : "px-5 pb-5")}>{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_DOT: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  info: "bg-primary",
  neutral: "bg-muted-foreground/50",
};

const TONE_TEXT: Record<Tone, string> = {
  success: "text-foreground",
  warning: "text-foreground",
  danger: "text-destructive",
  info: "text-foreground",
  neutral: "text-muted-foreground",
};

/**
 * A state, said in a word with a dot. A coloured dot beside plain text reads
 * as a status; a row of filled badges shouting ACTIVE in capitals reads as a
 * warning on every line.
 */
export function Status({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[13px] whitespace-nowrap",
        TONE_TEXT[tone],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", TONE_DOT[tone])} aria-hidden />
      {children}
    </span>
  );
}

const ACCOUNT_STATUS: Record<string, { label: string; tone: Tone }> = {
  ACTIVE: { label: "Actif", tone: "success" },
  PENDING: { label: "En attente", tone: "warning" },
  SUSPENDED: { label: "Suspendu", tone: "warning" },
  BANNED: { label: "Banni", tone: "danger" },
};

export function AccountStatus({ status }: { status: string }) {
  const entry = ACCOUNT_STATUS[status] ?? { label: status, tone: "neutral" as Tone };
  return <Status tone={entry.tone}>{entry.label}</Status>;
}

const PAYMENT_STATUS: Record<string, { label: string; tone: Tone }> = {
  PENDING: { label: "En attente", tone: "warning" },
  APPROVED: { label: "Validé", tone: "info" },
  PAID: { label: "Payé", tone: "success" },
  REJECTED: { label: "Refusé", tone: "danger" },
};

export function PaymentStatus({ status }: { status: string }) {
  const entry = PAYMENT_STATUS[status] ?? { label: status, tone: "neutral" as Tone };
  return <Status tone={entry.tone}>{entry.label}</Status>;
}

// ---------------------------------------------------------------------------
// Person
// ---------------------------------------------------------------------------

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

/* Five tints from the chart family. Which one a person gets depends only on
   their name, so the same affiliate is the same colour on every screen. */
const AVATAR_TINTS = [
  "bg-[color-mix(in_oklch,var(--chart-1)_16%,var(--card))] text-[var(--chart-1)]",
  "bg-[color-mix(in_oklch,var(--chart-2)_18%,var(--card))] text-[var(--chart-2)]",
  "bg-[color-mix(in_oklch,var(--chart-3)_22%,var(--card))] text-[color-mix(in_oklch,var(--chart-3)_70%,var(--foreground))]",
  "bg-[color-mix(in_oklch,var(--chart-4)_22%,var(--card))] text-[color-mix(in_oklch,var(--chart-4)_65%,var(--foreground))]",
  "bg-[color-mix(in_oklch,var(--chart-5)_26%,var(--card))] text-[color-mix(in_oklch,var(--chart-5)_55%,var(--foreground))]",
];

function tintFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
}

export function Initials({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
        tintFor(name),
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

/** A name with its avatar and one line of context under it. */
export function Person({
  name,
  detail,
  className,
}: {
  name: string;
  detail?: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("flex min-w-0 items-center gap-3", className)}>
      <Initials name={name} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{name}</span>
        {detail && (
          <span className="block truncate text-xs text-muted-foreground">
            {detail}
          </span>
        )}
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

/** A thin bar from 0 to 1. Full is drawn in the success colour. */
export function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500",
          clamped >= 1 ? "bg-success" : "bg-primary",
        )}
        style={{ width: `${clamped * 100}%` }}
      />
    </div>
  );
}
