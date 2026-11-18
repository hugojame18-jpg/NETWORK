"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Loader2, Link2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export interface LinkState {
  status: "REQUESTED" | "DELIVERED";
  targetUrl: string | null;
  token: string;
}

interface GenerateLinkButtonProps {
  offerId: string;
  initialLink?: LinkState | null;
}

export function GenerateLinkButton({
  offerId,
  initialLink,
}: GenerateLinkButtonProps) {
  const [link, setLink] = useState<LinkState | null>(initialLink ?? null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  // Prefer the real advertiser URL the admin delivered; fall back to the
  // internal tracking URL for legacy links created before the request flow.
  const deliveredUrl =
    link?.status === "DELIVERED"
      ? link.targetUrl || `${origin}/api/track/click/${link.token}`
      : null;

  function request() {
    startTransition(async () => {
      const res = await fetch("/api/publisher/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Impossible d'envoyer la demande.");
        return;
      }
      setLink({
        status: json.link.status,
        targetUrl: json.link.targetUrl ?? null,
        token: json.link.token,
      });
      toast.success(
        json.link.status === "DELIVERED"
          ? "Lien affilié disponible."
          : "Demande envoyée ! Ton lien apparaîtra ici dès qu'il est validé.",
      );
    });
  }

  async function copy() {
    if (!deliveredUrl) return;
    await navigator.clipboard.writeText(deliveredUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  // Link delivered by admin — show it with a copy button.
  if (deliveredUrl) {
    return (
      <div className="flex items-center gap-2">
        <code className="max-w-[220px] truncate rounded-md border border-border bg-muted px-2 py-1.5 text-xs">
          {deliveredUrl}
        </code>
        <Button
          size="icon-sm"
          variant="outline"
          onClick={copy}
          aria-label="Copier le lien"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    );
  }

  // Request sent, waiting for the admin to deliver the link.
  if (link?.status === "REQUESTED") {
    return (
      <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
        <Clock className="h-3.5 w-3.5" />
        En attente de ton lien
      </Badge>
    );
  }

  return (
    <Button size="sm" onClick={request} disabled={isPending}>
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Link2 className="h-4 w-4" />
      )}
      Demander mon lien
    </Button>
  );
}
