"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarkAllReadButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function markAll() {
    startTransition(async () => {
      await fetch("/api/notifications", { method: "PATCH" });
      router.refresh();
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={markAll} disabled={isPending}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
      Tout marquer comme lu
    </Button>
  );
}
