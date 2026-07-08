"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, CheckCircle2, Loader2, MoreHorizontal, PauseCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function OfferStatusMenu({ offerId, currentStatus }: { offerId: string; currentStatus: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setStatus(status: string) {
    startTransition(async () => {
      const res = await fetch(`/api/admin/offers/${offerId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Action impossible.");
        return;
      }
      toast.success("Statut de l'offre mis à jour.");
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Actions" disabled={isPending}>
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MoreHorizontal className="h-3.5 w-3.5" />}
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {currentStatus !== "ACTIVE" && (
          <DropdownMenuItem onClick={() => setStatus("ACTIVE")}>
            <CheckCircle2 className="h-4 w-4" />
            Approuver / activer
          </DropdownMenuItem>
        )}
        {currentStatus !== "PAUSED" && (
          <DropdownMenuItem onClick={() => setStatus("PAUSED")}>
            <PauseCircle className="h-4 w-4" />
            Mettre en pause
          </DropdownMenuItem>
        )}
        {currentStatus !== "ARCHIVED" && (
          <DropdownMenuItem onClick={() => setStatus("ARCHIVED")} variant="destructive">
            <Archive className="h-4 w-4" />
            Archiver
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
