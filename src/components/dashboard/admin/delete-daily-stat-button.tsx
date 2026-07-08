"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DeleteDailyStatButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onDelete() {
    if (!window.confirm("Supprimer cette journée ? Cette action est irréversible.")) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/daily-stats/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erreur lors de la suppression.");
        return;
      }
      toast.success("Journée supprimée.");
      router.refresh();
    });
  }

  return (
    <Button variant="ghost" size="icon-sm" aria-label="Supprimer" onClick={onDelete} disabled={isPending}>
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </Button>
  );
}
