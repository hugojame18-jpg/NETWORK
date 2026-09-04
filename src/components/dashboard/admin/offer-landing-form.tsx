"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface OfferLandingFormProps {
  offerId: string;
  currentUrl: string;
  /** Placeholder stored when the offer was created without a link yet. */
  placeholder: boolean;
}

export function OfferLandingForm({ offerId, currentUrl, placeholder }: OfferLandingFormProps) {
  const router = useRouter();
  const [url, setUrl] = useState(placeholder ? "" : currentUrl);
  const [editing, setEditing] = useState(placeholder);
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch(`/api/admin/offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landingUrl: url }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Enregistrement impossible.");
        return;
      }
      toast.success("Lien enregistré.");
      setEditing(false);
      router.refresh();
    });
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={currentUrl}
          target="_blank"
          rel="noreferrer"
          className="max-w-[220px] truncate text-xs text-primary hover:underline"
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
        placeholder="https://…"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="h-8 w-[230px] text-xs"
      />
      <Button type="submit" size="icon-sm" disabled={isPending} aria-label="Enregistrer le lien">
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
      </Button>
    </form>
  );
}
