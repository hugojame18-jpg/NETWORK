"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCalendarDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface PerformancePoint {
  date: string;
  clicks: number;
  leads: number;
  conversions: number;
  commissions: number;
}

export interface ChartSeriesConfig {
  key: string;
  label: string;
  color: string;
  /**
   * Which vertical scale to read against. Money and counts differ by two orders
   * of magnitude, so sharing one axis flattens the smaller series onto the
   * baseline — it looks like nothing happened all month.
   */
  axis?: "left" | "right";
}

/* Series colours come from the theme's chart ramp, so the graph belongs to the
   same room as the rest of the page instead of importing a stock palette. */
const DEFAULT_SERIES: ChartSeriesConfig[] = [
  { key: "clicks", label: "Clics", color: "var(--chart-1)" },
  { key: "leads", label: "Leads", color: "var(--chart-2)" },
  { key: "conversions", label: "Conversions", color: "var(--chart-4)" },
  {
    key: "commissions",
    label: "Commissions ($)",
    color: "var(--chart-5)",
    axis: "right",
  },
];

const RANGES = [
  { value: "7", label: "7 j" },
  { value: "30", label: "30 j" },
  { value: "90", label: "90 j" },
];

interface TooltipEntry {
  name?: string;
  value?: number | string;
  color?: string;
}

/** Recharts' default tooltip is a white box with a border; this one is ours. */
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-border bg-popover/95 px-3 py-2 shadow-lg backdrop-blur-sm">
      <p className="mb-1.5 text-xs font-medium">
        {typeof label === "string" ? formatCalendarDate(label) : ""}
      </p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: entry.color }}
              aria-hidden
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="num ml-auto font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PerformanceChartProps {
  data: Record<string, string | number>[];
  series?: ChartSeriesConfig[];
  /** Hides the 7/30/90 switch when the page already scopes the period. */
  showRange?: boolean;
  height?: number;
  className?: string;
}

/**
 * Renders only the chart — the surrounding card belongs to the page, which used
 * to nest a card inside a card wherever this was dropped into a `CardContent`.
 */
export function PerformanceChart({
  data,
  series = DEFAULT_SERIES,
  showRange = true,
  height = 300,
  className,
}: PerformanceChartProps) {
  const [range, setRange] = useState("30");
  const hasRightAxis = series.some((s) => s.axis === "right");
  const filtered = useMemo(
    () => (showRange ? data.slice(-Number(range)) : data),
    [data, range, showRange],
  );

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* A legend we draw ourselves: aligned left, same type scale as the page. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {series.map((s) => (
            <span
              key={s.key}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: s.color }}
                aria-hidden
              />
              {s.label}
            </span>
          ))}
        </div>

        {showRange && (
          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRange(r.value)}
                className={cn(
                  "rounded-[6px] px-2.5 py-1 text-xs font-medium transition-colors",
                  range === r.value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={filtered}
          margin={{ top: 4, right: 4, left: -18, bottom: 0 }}
        >
          <defs>
            {series.map((s) => (
              <linearGradient
                key={s.key}
                id={`fill-${s.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            stroke="var(--border)"
            strokeDasharray="4 4"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) =>
              formatCalendarDate(value).slice(0, 5)
            }
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
            dy={6}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          {hasRightAxis && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
          )}
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
          />
          {series.map((s) => (
            <Area
              key={s.key}
              yAxisId={s.axis ?? "left"}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              fill={`url(#fill-${s.key})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3.5, strokeWidth: 2, stroke: "var(--card)" }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
