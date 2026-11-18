"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface TestablePublisher {
  id: string;
  label: string;
}

/**
 * Sends one postback to ourselves, as the network would.
 *
 * It exists because the accepted path is the one branch nobody can try by
 * hand without pasting the secret into a URL bar. The server holds the key,
 * so the proof costs a click.
 */
export function PostbackTest({
  publishers,
}: {
  publishers: TestablePublisher[];
}) {
  const router = useRouter();
  const [publisherId, setPublisherId] = useState(publishers[0]?.id ?? "");
  const [amount, setAmount] = useState("1");
  const [isPending, startTransition] = useTransition();

  if (publishers.length === 0) return null;

  function send() {
    startTransition(async () => {
      const res = await fetch("/api/admin/postback/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publisherId, amount: Number(amount) }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "L'appel de test a échoué.");
        return;
      }
      if (json.ok) {
        toast.success(
          `Conversion comptée pour ${json.publisher} — transaction ${json.transactionId}.`,
        );
      } else {
        toast.error(
          `Refusé par l'endpoint (HTTP ${json.status}) : ${json.body}`,
        );
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1">
        <span className="eyebrow">Affilié</span>
        <select
          value={publisherId}
          onChange={(event) => setPublisherId(event.target.value)}
          className="h-9 rounded-lg border border-border bg-card px-2.5 text-sm"
        >
          {publishers.map((publisher) => (
            <option key={publisher.id} value={publisher.id}>
              {publisher.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="eyebrow">Montant</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="num h-9 w-24 rounded-lg border border-border bg-card px-2.5 text-sm"
        />
      </label>

      <Button onClick={send} disabled={isPending || !publisherId}>
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Zap className="h-4 w-4" />
        )}
        Envoyer un appel de test
      </Button>
    </div>
  );
}
