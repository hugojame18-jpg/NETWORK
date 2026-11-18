"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "./performance-chart";
import { formatCalendarDate, formatCurrency, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface PeriodPoint {
  date: string;
  clicks: number;
  hosts: number;
  conversions: number;
  revenue: number;
}

/**
 * One metric at a time, over whatever period the page is scoped to.
 *
 * Plotting clicks, conversions and euros together never works: they differ by
 * two orders of magnitude, so two of the three flatten onto the baseline. A
 * switcher keeps every series readable at full height and leaves a single line
 * on screen, which is also simply easier to read.
 */
const METRICS = [
  { key: "clicks", label: "Clics", format: formatNumber },
  { key: "hosts", label: "Hosts", format: formatNumber },
  { key: "conversions", label: "Conversions", format: formatNumber },
  { key: "revenue", label: "Revenus", format: formatCurrency },
] as const;

type MetricKey = (typeof METRICS)[number]["key"];

export function PeriodChart({
  data,
  className,
}: {
  data: PeriodPoint[];
  className?: string;
}) {
  const [metric, setMetric] = useState<MetricKey>("conversions");
  const active = METRICS.find((m) => m.key === metric) ?? METRICS[2];

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex items-center gap-0.5 self-start rounded-lg border border-border bg-muted/50 p-0.5">
        {METRICS.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMetric(m.key)}
            className={cn(
              "rounded-[6px] px-3 py-1.5 text-xs font-medium transition-colors",
              metric === m.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
        >
          <defs>
            <linearGradient id="fill-period" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
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
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={64}
            tickFormatter={(value: number) => active.format(value)}
          />
          <Tooltip
            content={<ChartTooltip formatValue={active.format} />}
            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey={metric}
            name={active.label}
            stroke="var(--chart-1)"
            fill="url(#fill-period)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3.5, strokeWidth: 2, stroke: "var(--card)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
