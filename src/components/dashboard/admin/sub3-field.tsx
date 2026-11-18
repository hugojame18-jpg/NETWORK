"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * An affiliate's sub3, shown and editable in place.
 *
 * Copying matters far more often than changing, so the copy button stays the
 * default and the Save button only appears once the value has actually been
 * edited — there is no way to overwrite a live token by misclicking.
 */
export function Sub3Field({
  publisherId,
  value,
}: {
  publisherId: string;
  value: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(value);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const dirty = draft.trim().toLowerCase() !== value.toLowerCase();

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access can be refused; the value stays selectable by hand.
    }
  }

  function save() {
    startTransition(async () => {
      const res = await fetch("/api/admin/postback/token", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publisherId, token: draft }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Impossible d'enregistrer ce sub3.");
        return;
      }
      toast.success(`sub3 enregistré : ${json.token}`);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        spellCheck={false}
        autoComplete="off"
        aria-label="sub3 de cet affilié"
        className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-muted/40 px-2.5 font-mono text-xs transition-colors hover:border-primary/40 focus:border-primary focus:bg-card focus:outline-none"
      />
      {dirty ? (
        <Button size="sm" onClick={save} disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            "Enregistrer"
          )}
        </Button>
      ) : (
        <Button
          size="icon-sm"
          variant="outline"
          onClick={copy}
          aria-label="Copier le sub3"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-success" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      )}
    </div>
  );
}
