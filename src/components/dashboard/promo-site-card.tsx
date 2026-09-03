"use client";

import { useState, useTransition } from "react";
import { ExternalLink, Loader2, Check, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { PromoSite } from "@/lib/promo-sites";
import { verticalIcon, verticalLabel } from "@/lib/verticals";

type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

/** Zoom-out factor for the preview frame: a ~1440px-wide page inside a ~520px tile. */
const PREVIEW_SCALE = 0.36;

interface PromoSiteCardProps {
  site: PromoSite;
  initialStatus?: RequestStatus | null;
}

const STATUS_LABEL: Record<RequestStatus, string> = {
  PENDING: "Demande en attente",
  APPROVED: "Demande acceptée",
  REJECTED: "Demande refusée",
};

export function PromoSiteCard({ site, initialStatus }: PromoSiteCardProps) {
  const [status, setStatus] = useState<RequestStatus | null>(initialStatus ?? null);
  const [isPending, startTransition] = useTransition();

  function request() {
    startTransition(async () => {
      const res = await fetch("/api/publisher/site-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteSlug: site.slug }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Impossible d'envoyer la demande.");
        return;
      }
      setStatus(json.request.status);
      toast.success("Demande envoyée ! Tu seras notifié dès qu'elle est traitée.");
    });
  }

  return (
    <Card className="hover-lift shadow-premium flex flex-col overflow-hidden">
      {/* Live preview: the site itself, rendered small and non-interactive so the
          whole tile stays a link rather than a browsable frame. */}
      <a
        href={site.url}
        target="_blank"
        rel="noreferrer"
        className="group relative block h-52 overflow-hidden border-b border-border bg-muted"
        aria-label={`Ouvrir ${site.name} dans un nouvel onglet`}
      >
        {/* Sized at 1/PREVIEW_SCALE of the tile and scaled back down, so the
            frame renders at a desktop-width viewport yet fills the tile exactly
            at any breakpoint. */}
        <iframe
          src={site.url}
          title={`Aperçu de ${site.name}`}
          loading="lazy"
          tabIndex={-1}
          sandbox="allow-scripts allow-same-origin"
          className="pointer-events-none absolute top-0 left-0 origin-top-left border-0"
          style={{
            width: `${100 / PREVIEW_SCALE}%`,
            height: `${100 / PREVIEW_SCALE}%`,
            transform: `scale(${PREVIEW_SCALE})`,
          }}
        />
        <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/30" />
        <span className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-md bg-background/90 px-2.5 py-1.5 text-xs font-medium opacity-0 shadow-sm transition group-hover:opacity-100">
          <ExternalLink className="h-3.5 w-3.5" />
          Voir le site
        </span>
      </a>

      <CardContent className="flex flex-1 flex-col gap-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <a href={site.url} target="_blank" rel="noreferrer" className="font-semibold hover:underline">
              {site.name}
            </a>
            <p className="text-xs text-muted-foreground">{site.url.replace(/^https?:\/\//, "").replace(/\/.*$/, "")}</p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {verticalIcon(site.category)} {verticalLabel(site.category)}
          </Badge>
        </div>

        <p className="line-clamp-3 text-sm text-muted-foreground">{site.description}</p>

        <div className="mt-auto pt-2">
          {status === null ? (
            <Button className="w-full" onClick={request} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Demander
            </Button>
          ) : (
            <Badge
              variant={status === "APPROVED" ? "default" : status === "REJECTED" ? "destructive" : "secondary"}
              className="flex w-full justify-center gap-1.5 py-2"
            >
              {status === "APPROVED" ? <Check className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
              {STATUS_LABEL[status]}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
