"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ApplicationStatusActions({ publisherId }: { publisherId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setStatus(status: "APPROVED" | "REJECTED") {
    startTransition(async () => {
      const res = await fetch(`/api/admin/publishers/${publisherId}/application`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Action impossible.");
        return;
      }
      toast.success(status === "APPROVED" ? "Publisher approuvé." : "Candidature refusée.");
      router.refresh();
    });
  }

  return (
    <div className="flex gap-1">
      <Button size="icon-sm" variant="outline" onClick={() => setStatus("APPROVED")} disabled={isPending} aria-label="Approuver">
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
      </Button>
      <Button size="icon-sm" variant="outline" onClick={() => setStatus("REJECTED")} disabled={isPending} aria-label="Refuser">
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
