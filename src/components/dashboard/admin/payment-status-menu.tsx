"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Banknote, CheckCircle2, Loader2, MoreHorizontal, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function PaymentStatusMenu({ paymentId, currentStatus }: { paymentId: string; currentStatus: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setStatus(status: string) {
    startTransition(async () => {
      const res = await fetch(`/api/admin/payments/${paymentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Action impossible.");
        return;
      }
      toast.success("Paiement mis à jour.");
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
        {currentStatus === "PENDING" && (
          <DropdownMenuItem onClick={() => setStatus("APPROVED")}>
            <CheckCircle2 className="h-4 w-4" />
            Valider
          </DropdownMenuItem>
        )}
        {currentStatus !== "PAID" && (
          <DropdownMenuItem onClick={() => setStatus("PAID")}>
            <Banknote className="h-4 w-4" />
            Marquer comme payé
          </DropdownMenuItem>
        )}
        {currentStatus !== "REJECTED" && (
          <DropdownMenuItem onClick={() => setStatus("REJECTED")} variant="destructive">
            <XCircle className="h-4 w-4" />
            Refuser
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
