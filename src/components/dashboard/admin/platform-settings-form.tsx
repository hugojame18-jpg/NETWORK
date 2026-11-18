"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

/**
 * The network-wide withdrawal threshold.
 *
 * Saving it rewrites the threshold on every affiliate's account and becomes
 * the default for new ones, so the figure typed here is the one an affiliate
 * is actually held to.
 */
export function PlatformSettingsForm({ minPayout }: { minPayout: number }) {
  const router = useRouter();
  const [value, setValue] = useState(String(minPayout));
  const [isPending, startTransition] = useTransition();

  const parsed = Number(value);
  const valid = value.trim() !== "" && Number.isFinite(parsed) && parsed >= 0;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid) return;
    startTransition(async () => {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minPayout: parsed }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error ?? "Erreur lors de la mise à jour.");
        return;
      }
      toast.success("Minimum de retrait appliqué à tous les affiliés.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="max-w-xs space-y-2">
        <Label htmlFor="minPayout">Minimum de retrait ($)</Label>
        <Input
          id="minPayout"
          type="number"
          min={0}
          step="1"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          En dessous de ce solde, un affilié ne peut pas demander de retrait.
          Tu peux toujours lui enregistrer un paiement toi-même, quel que soit
          le montant.
        </p>
      </div>
      <Button type="submit" disabled={isPending || !valid}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Enregistrer
      </Button>
    </form>
  );
}
