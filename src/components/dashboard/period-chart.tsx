"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

/* Axis labels get a compact form of their own: "2 365,88 $US" does not fit in
   the gutter and Recharts simply clips it, which left the axis reading
   ".00 $US" down the side. The tooltip still shows the exact figure. */
function compactNumber(value: number): string {
  if (Math.abs(value) >= 1000)
    return `${(value / 1000).toFixed(1).replace(".", ",")} k`;
  return formatNumber(value);
}

function compactMoney(value: number): string {
  if (Math.abs(value) >= 1000)
    return `${(value / 1000).toFixed(1).replace(".", ",")} k$`;
  return `${Math.round(value)} $`;
}

const METRICS = [
  {
    key: "clicks",
    label: "Clics",
    format: formatNumber,
    axisFormat: compactNumber,
  },
  {
    key: "hosts",
    label: "Visiteurs",
    format: formatNumber,
    axisFormat: compactNumber,
  },
  {
    key: "conversions",
    label: "Conversions",
    format: formatNumber,
    axisFormat: compactNumber,
  },
  {
    key: "revenue",
    label: "Tes gains",
    format: formatCurrency,
    axisFormat: compactMoney,
  },
] as const;

type MetricKey = (typeof METRICS)[number]["key"];

/**
 * Below this many days the period is drawn as bars rather than a curve. A line
 * needs two points to exist at all — "Hier" used to render one lonely dot in an
 * empty grid — and a monotone curve through a handful of points stretches each
 * segment into a smooth arc that invents movement between days that were simply
 * measured once. Bars state each day as the discrete figure it is.
 */
const BAR_THRESHOLD = 14;

export function PeriodChart({
  data,
  className,
}: {
  data: PeriodPoint[];
  className?: string;
}) {
  const [metric, setMetric] = useState<MetricKey>("conversions");
  const active = METRICS.find((m) => m.key === metric) ?? METRICS[2];
  const asBars = data.length <= BAR_THRESHOLD;

  /* Shared between both chart types, so switching period never changes the
     axes, the grid or the tooltip — only the shape of the data. */
  const grid = (
    <CartesianGrid
      stroke="var(--border)"
      strokeDasharray="4 4"
      vertical={false}
    />
  );
  const xAxis = (
    <XAxis
      dataKey="date"
      tickFormatter={(value: string) => formatCalendarDate(value).slice(0, 5)}
      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
      axisLine={false}
      tickLine={false}
      minTickGap={asBars ? 0 : 24}
      interval={asBars ? 0 : "preserveStartEnd"}
      dy={6}
    />
  );
  const yAxis = (
    <YAxis
      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
      axisLine={false}
      tickLine={false}
      width={58}
      tickFormatter={(value: number) => active.axisFormat(value)}
    />
  );

  return (
    <div className={cn("space-y-5", className)}>
      <div className="inline-flex w-fit items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5">
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
        {asBars ? (
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
          >
            {grid}
            {xAxis}
            {yAxis}
            <Tooltip
              content={<ChartTooltip formatValue={active.format} />}
              cursor={{ fill: "var(--muted)", opacity: 0.6 }}
            />
            <Bar
              dataKey={metric}
              name={active.label}
              radius={[6, 6, 0, 0]}
              maxBarSize={64}
            >
              {data.map((point) => (
                <Cell key={point.date} fill="var(--chart-1)" />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <AreaChart
            data={data}
            margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fill-period" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.22}
                />
                <stop
                  offset="100%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            {grid}
            {xAxis}
            {yAxis}
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
        )}
      </ResponsiveContainer>
    </div>
  );
}
