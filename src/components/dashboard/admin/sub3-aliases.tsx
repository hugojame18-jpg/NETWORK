"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

export interface Sub3Alias {
  id: string;
  token: string;
}

interface AttachResponse {
  error?: string;
  replay?: { counted: number; amount: number };
  trafficSynced?: boolean;
}

/** Says what attaching actually changed, in the affiliate's own numbers. */
export function attachedMessage(token: string, json: AttachResponse): string {
  const parts = [`« ${token} » rattaché.`];
  const counted = json.replay?.counted ?? 0;
  if (counted > 0) {
    parts.push(
      `${counted} conversion${counted > 1 ? "s" : ""} déjà reçue${counted > 1 ? "s" : ""} (${formatCurrency(
        json.replay?.amount ?? 0,
      )} brut) ${counted > 1 ? "sont maintenant comptées" : "est maintenant comptée"}.`,
    );
  }
  parts.push(
    json.trafficSynced
      ? "Les clics des derniers jours sont à jour."
      : "Les clics suivront à la prochaine synchro Flow.",
  );
  return parts.join(" ");
}

/**
 * The other sub3 an affiliate's traffic carries, besides their main one.
 *
 * One account, several sites: each site already sends its own sub3, so the
 * account collects them rather than making the affiliate reconfigure anything.
 */
export function Sub3Aliases({
  publisherId,
  aliases,
}: {
  publisherId: string;
  aliases: Sub3Alias[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();

  function add(event: React.FormEvent) {
    event.preventDefault();
    const token = draft.trim().toLowerCase();
    if (!token) return;

    startTransition(async () => {
      const res = await fetch("/api/admin/postback/aliases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publisherId, token }),
      });
      const json = (await res.json().catch(() => ({}))) as AttachResponse;
      if (!res.ok) {
        toast.error(json.error ?? "Impossible d'ajouter ce sub3.");
        return;
      }
      toast.success(attachedMessage(token, json));
      setDraft("");
      router.refresh();
    });
  }

  function remove(alias: Sub3Alias) {
    if (
      !window.confirm(
        `Détacher « ${alias.token} » ? Ce qui a déjà été compté reste acquis ; seules les prochaines conversions et les prochains clics sous ce sub3 ne lui seront plus attribués.`,
      )
    )
      return;

    startTransition(async () => {
      const res = await fetch(`/api/admin/postback/aliases/${alias.id}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error ?? "Impossible de détacher ce sub3.");
        return;
      }
      toast.success(`« ${alias.token} » détaché.`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      {aliases.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {aliases.map((alias) => (
            <span
              key={alias.id}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 py-0.5 pr-0.5 pl-2 font-mono text-xs"
            >
              {alias.token}
              <button
                type="button"
                onClick={() => remove(alias)}
                disabled={isPending}
                aria-label={`Détacher ${alias.token}`}
                className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <form onSubmit={add} className="flex items-center gap-1.5">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ajouter un sub3"
          spellCheck={false}
          autoComplete="off"
          aria-label="Ajouter un sub3 à cet affilié"
          className="h-8 min-w-0 flex-1 rounded-lg border border-border bg-card px-2.5 font-mono text-xs focus:border-primary focus:outline-none"
        />
        <Button
          type="submit"
          size="icon-sm"
          variant="outline"
          disabled={isPending || draft.trim() === ""}
          aria-label="Ajouter"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
        </Button>
      </form>
    </div>
  );
}
