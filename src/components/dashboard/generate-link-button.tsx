"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Loader2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface GenerateLinkButtonProps {
  offerId: string;
  initialToken?: string;
}

export function GenerateLinkButton({ offerId, initialToken }: GenerateLinkButtonProps) {
  const [token, setToken] = useState(initialToken ?? null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const trackingUrl = token ? `${origin}/api/track/click/${token}` : null;

  function generate() {
    startTransition(async () => {
      const res = await fetch("/api/publisher/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Impossible de générer le lien.");
        return;
      }
      setToken(json.link.token);
      toast.success("Lien affilié généré.");
    });
  }

  async function copy() {
    if (!trackingUrl) return;
    await navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  if (token) {
    return (
      <div className="flex items-center gap-2">
        <code className="max-w-[220px] truncate rounded-md border border-border bg-muted px-2 py-1.5 text-xs">
          {trackingUrl}
        </code>
        <Button size="icon-sm" variant="outline" onClick={copy} aria-label="Copier le lien">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
    );
  }

  return (
    <Button size="sm" onClick={generate} disabled={isPending}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
      Générer mon lien
    </Button>
  );
}
