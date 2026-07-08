"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCalendarDate } from "@/lib/format";

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
}

const DEFAULT_SERIES: ChartSeriesConfig[] = [
  { key: "clicks", label: "Clics", color: "#818cf8" },
  { key: "leads", label: "Leads", color: "#38bdf8" },
  { key: "conversions", label: "Conversions", color: "#34d399" },
  { key: "commissions", label: "Commissions ($)", color: "#fbbf24" },
];

const RANGES = [
  { value: "7", label: "7 derniers jours" },
  { value: "30", label: "30 derniers jours" },
  { value: "90", label: "90 derniers jours" },
];

interface PerformanceChartProps {
  data: Record<string, string | number>[];
  series?: ChartSeriesConfig[];
}

export function PerformanceChart({ data, series = DEFAULT_SERIES }: PerformanceChartProps) {
  const [range, setRange] = useState("30");

  const filtered = useMemo(() => data.slice(-Number(range)), [data, range]);

  return (
    <Card className="shadow-premium">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Performance</CardTitle>
        <Select value={range} onValueChange={(value) => value && setRange(value)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={filtered} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value: string) => formatCalendarDate(value).slice(0, 5)}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 12,
              }}
              labelFormatter={(label) => (typeof label === "string" ? formatCalendarDate(label) : "")}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                fill={`url(#fill-${s.key})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
