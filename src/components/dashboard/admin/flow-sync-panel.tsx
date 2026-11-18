"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * Where the Flow API key is entered and the sync can be fired by hand.
 *
 * The key is never sent back to the browser once stored — the field starts
 * empty and only ever travels upwards, so a stored key cannot leak through a
 * screenshot of this page.
 */
export function FlowSyncPanel({ hasKey }: { hasKey: boolean }) {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [saving, startSaving] = useTransition();
  const [syncing, startSyncing] = useTransition();

  function save() {
    startSaving(async () => {
      const res = await fetch("/api/admin/flow", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Impossible d'enregistrer la clé.");
        return;
      }
      setApiKey("");
      toast.success("Clé enregistrée. Lance une synchronisation pour tester.");
      router.refresh();
    });
  }

  function sync() {
    startSyncing(async () => {
      const res = await fetch("/api/admin/flow", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "La synchronisation a échoué.");
        return;
      }
      if (json.ok) {
        toast.success(
          json.rowsWritten > 0
            ? `${json.rowsWritten} journée(s) mise(s) à jour depuis Flow.`
            : "Flow a répondu, mais n'a aucun trafic à remonter sur la période.",
        );
      } else {
        toast.error(json.error ?? "Flow a refusé la requête.");
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex min-w-[260px] flex-1 flex-col gap-1">
          <span className="eyebrow">
            {hasKey ? "Remplacer la clé API Flow" : "Clé API Flow"}
          </span>
          <input
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder={hasKey ? "••••••••  (une clé est enregistrée)" : "Colle ta clé ici"}
            spellCheck={false}
            autoComplete="off"
            className="h-9 rounded-lg border border-border bg-card px-2.5 font-mono text-xs focus:border-primary focus:outline-none"
          />
        </label>

        <Button onClick={save} disabled={saving || apiKey.trim().length < 8}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Enregistrer
        </Button>

        <Button variant="outline" onClick={sync} disabled={syncing || !hasKey}>
          {syncing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Synchroniser maintenant
        </Button>
      </div>
    </div>
  );
}
