"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatCurrency,
  formatCurrencyWhole,
  formatCompact,
  formatNumber,
} from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * How a value is written. Named rather than passed as a function, because a
 * server component cannot hand a function to a client one.
 */
export type ValueKind = "money" | "count" | "percent";

export interface TrendSeries {
  key: string;
  label: string;
  kind: ValueKind;
}

export type TrendPoint = { date: string } & Record<string, string | number>;

interface TrendChartProps {
  data: TrendPoint[];
  /** The series the chart is about, drawn as one bar per day. */
  bars: TrendSeries;
  /** An optional second series in the same unit, drawn as a line on top. */
  line?: TrendSeries;
  /** Shown in the tooltip only — context for the day, never a third shape. */
  details?: TrendSeries[];
  /** Day counts offered as a switch. Omit to draw everything given. */
  ranges?: number[];
  defaultRange?: number;
  height?: number;
  className?: string;
}

function write(value: number, kind: ValueKind): string {
  if (kind === "money") return formatCurrency(value);
  if (kind === "percent")
    return `${value.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} %`;
  return formatNumber(value);
}

function writeAxis(value: number, kind: ValueKind): string {
  if (kind === "money")
    return Math.abs(value) >= 10_000
      ? `${formatCompact(value)} $`
      : formatCurrencyWhole(value);
  return formatCompact(value);
}

const dayFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const longDayFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

function asDate(day: string): Date {
  return new Date(`${day}T00:00:00.000Z`);
}

/**
 * Daily figures as bars.
 *
 * Bars, not a curve: each day is one measured number, and a smooth line
 * through thirty of them draws movement between days that never happened. A
 * second series is allowed only when it shares the bars' unit, so there is one
 * axis and no figure has to be read against the wrong scale.
 *
 * The last bar is today, which is still filling up — it is drawn lighter so a
 * half-finished day is not mistaken for a collapse.
 */
export function TrendChart({
  data,
  bars,
  line,
  details = [],
  ranges,
  defaultRange,
  height = 280,
  className,
}: TrendChartProps) {
  const [range, setRange] = useState(
    defaultRange ?? ranges?.[0] ?? data.length,
  );
  const visible = useMemo(
    () => (ranges ? data.slice(-range) : data),
    [data, range, ranges],
  );
  const [hovered, setHovered] = useState<number | null>(null);
  const lastIndex = visible.length - 1;

  const rows = [bars, ...(line ? [line] : []), ...details];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[3px] bg-[var(--chart-1)]" aria-hidden />
            {bars.label}
          </span>
          {line && (
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3.5 rounded-full bg-[var(--chart-4)]" aria-hidden />
              {line.label}
            </span>
          )}
        </div>

        {ranges && (
          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5">
            {ranges.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setRange(days)}
                className={cn(
                  "rounded-[6px] px-2.5 py-1 text-xs font-medium transition-colors",
                  range === days
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {days} j
              </button>
            ))}
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={visible}
          margin={{ top: 8, right: 4, left: -8, bottom: 0 }}
          onMouseMove={(state) => {
            const index = state?.activeTooltipIndex;
            setHovered(typeof index === "number" ? index : null);
          }}
          onMouseLeave={() => setHovered(null)}
        >
          <CartesianGrid
            stroke="var(--border)"
            strokeDasharray="3 5"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => dayFormatter.format(asDate(value))}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            minTickGap={28}
            dy={6}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(value: number) => writeAxis(value, bars.kind)}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.55 }}
            content={({ active, payload }) => {
              const point = payload?.[0]?.payload as TrendPoint | undefined;
              if (!active || !point) return null;
              return (
                <div className="min-w-[180px] rounded-xl border border-border bg-popover/95 px-3.5 py-3 shadow-lg backdrop-blur-sm">
                  <p className="mb-2 text-xs font-medium first-letter:uppercase">
                    {longDayFormatter.format(asDate(point.date))}
                  </p>
                  <div className="space-y-1.5">
                    {rows.map((row, index) => (
                      <div
                        key={row.key}
                        className="flex items-center justify-between gap-6 text-xs"
                      >
                        <span className="text-muted-foreground">
                          {row.label}
                        </span>
                        <span
                          className={cn(
                            "num",
                            index === 0 ? "font-semibold" : "font-medium",
                          )}
                        >
                          {write(Number(point[row.key] ?? 0), row.kind)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }}
          />
          <Bar
            dataKey={bars.key}
            name={bars.label}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
            isAnimationActive={false}
          >
            {visible.map((point, index) => (
              <Cell
                key={point.date}
                fill="var(--chart-1)"
                fillOpacity={
                  hovered !== null && hovered !== index
                    ? 0.35
                    : index === lastIndex
                      ? 0.5
                      : 1
                }
              />
            ))}
          </Bar>
          {line && (
            <Line
              type="monotone"
              dataKey={line.key}
              name={line.label}
              stroke="var(--chart-4)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3.5, strokeWidth: 2, stroke: "var(--card)" }}
              isAnimationActive={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
