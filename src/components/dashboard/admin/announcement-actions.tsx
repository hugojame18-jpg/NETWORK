"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AnnouncementActions({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      if (!res.ok) {
        toast.error("Action impossible.");
        return;
      }
      toast.success(active ? "Message masqué." : "Message réaffiché.");
      router.refresh();
    });
  }

  function remove() {
    if (!confirm("Supprimer définitivement ce message ?")) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Suppression impossible.");
        return;
      }
      toast.success("Message supprimé.");
      router.refresh();
    });
  }

  return (
    <div className="flex gap-1">
      <Button
        size="icon-sm"
        variant="outline"
        onClick={toggle}
        disabled={isPending}
        aria-label={active ? "Masquer le message" : "Réafficher le message"}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : active ? (
          <EyeOff className="h-3.5 w-3.5" />
        ) : (
          <Eye className="h-3.5 w-3.5" />
        )}
      </Button>
      <Button size="icon-sm" variant="outline" onClick={remove} disabled={isPending} aria-label="Supprimer le message">
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
