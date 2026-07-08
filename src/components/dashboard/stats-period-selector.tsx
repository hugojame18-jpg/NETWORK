"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PRESETS = [
  { value: "today", label: "Aujourd'hui" },
  { value: "yesterday", label: "Hier" },
  { value: "this_week", label: "Cette semaine" },
  { value: "last_7_days", label: "Les 7 derniers jours" },
  { value: "last_30_days", label: "Les 30 derniers jours" },
  { value: "this_month", label: "Ce mois" },
  { value: "last_month", label: "Le mois dernier" },
  { value: "this_year", label: "Cette année" },
  { value: "full_year", label: "Année complète" },
  { value: "custom", label: "Période personnalisée" },
] as const;

interface StatsPeriodSelectorProps {
  period: string;
  from: string;
  to: string;
}

export function StatsPeriodSelector({ period, from, to }: StatsPeriodSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    if (key === "period" && value !== "custom") {
      params.delete("from");
      params.delete("to");
    }
    router.push(`/dashboard/stats?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-2">
        <Label>Période</Label>
        <Select value={period} onValueChange={(v) => v && updateParam("period", v)}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRESETS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {period === "custom" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="from">Du</Label>
            <Input id="from" type="date" value={from} onChange={(e) => updateParam("from", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">Au</Label>
            <Input id="to" type="date" value={to} onChange={(e) => updateParam("to", e.target.value)} />
          </div>
        </>
      )}
    </div>
  );
}
