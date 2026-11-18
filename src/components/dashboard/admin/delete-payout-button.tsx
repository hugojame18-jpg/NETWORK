"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * Removes a recorded payout, for when an amount or a date went in wrong.
 *
 * The confirmation spells out the amount: deleting the wrong line puts money
 * back on a balance that was correct, which is exactly as bad as the typo it
 * was meant to fix.
 */
export function DeletePayoutButton({
  paymentId,
  amountLabel,
}: {
  paymentId: string;
  amountLabel: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onDelete() {
    if (
      !window.confirm(
        `Supprimer le paiement de ${amountLabel} ? Le montant reviendra sur son solde.`,
      )
    )
      return;

    startTransition(async () => {
      const res = await fetch(`/api/admin/payouts/${paymentId}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error ?? "Impossible de supprimer ce paiement.");
        return;
      }
      toast.success("Paiement supprimé. Le solde est recalculé.");
      router.refresh();
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={`Supprimer le paiement de ${amountLabel}`}
      onClick={onDelete}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}
