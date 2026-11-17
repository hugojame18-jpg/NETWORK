"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface DeliverLinkFormProps {
  linkId: string;
  currentUrl?: string | null;
  delivered?: boolean;
}

export function DeliverLinkForm({ linkId, currentUrl, delivered }: DeliverLinkFormProps) {
  const router = useRouter();
  const [url, setUrl] = useState(currentUrl ?? "");
  // Show the input unless there's already a real URL to display.
  const [editing, setEditing] = useState(!delivered || !currentUrl);
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch(`/api/admin/links/${linkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrl: url }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Envoi impossible.");
        return;
      }
      toast.success("Lien envoyé à l'affilié.");
      setEditing(false);
      router.refresh();
    });
  }

  // Delivered with a real URL and not editing — show it with an edit affordance.
  if (delivered && currentUrl && !editing) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={currentUrl ?? "#"}
          target="_blank"
          rel="noreferrer"
          className="max-w-[280px] truncate text-xs text-primary hover:underline"
        >
          {currentUrl}
        </a>
        <Button size="icon-sm" variant="ghost" onClick={() => setEditing(true)} aria-label="Modifier le lien">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <Input
        type="url"
        required
        placeholder="https://tracker-annonceur.com/?aff=..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="h-8 w-[260px] text-xs"
      />
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        Envoyer
      </Button>
    </form>
  );
}
