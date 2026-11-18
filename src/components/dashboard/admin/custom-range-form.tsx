"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Free date range for the revenue page. Navigates rather than fetching, so the
 * chosen period lives in the URL and can be bookmarked or shared.
 */
export function CustomRangeForm({ from, to }: { from?: string; to?: string }) {
  const router = useRouter();
  const [start, setStart] = useState(from ?? "");
  const [end, setEnd] = useState(to ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (start) params.set("from", start);
    if (end) params.set("to", end);
    router.push(
      params.toString() ? `/admin/revenue?${params}` : "/admin/revenue",
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <CalendarRange className="h-4 w-4 text-muted-foreground" />
      <Input
        type="date"
        aria-label="Date de début"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="h-8 w-[150px] text-xs"
      />
      <span className="text-xs text-muted-foreground">au</span>
      <Input
        type="date"
        aria-label="Date de fin"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        className="h-8 w-[150px] text-xs"
      />
      <Button type="submit" size="sm" variant="outline">
        Appliquer
      </Button>
    </form>
  );
}
