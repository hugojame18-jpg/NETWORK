"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ReplayTourButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function replay() {
    startTransition(async () => {
      const res = await fetch("/api/publisher/onboarding", { method: "DELETE" });
      if (!res.ok) {
        toast.error("Impossible de relancer le guide.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <Button variant="outline" onClick={replay} disabled={isPending}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
      Revoir le guide de démarrage
    </Button>
  );
}
