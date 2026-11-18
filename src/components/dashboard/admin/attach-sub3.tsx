"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { attachedMessage } from "@/components/dashboard/admin/sub3-aliases";
import { toast } from "sonner";

interface PublisherOption {
  id: string;
  label: string;
}

/**
 * One sub3 that is carrying traffic and belongs to nobody, with the one
 * decision it needs: whose is it?
 *
 * The value is shown exactly as the network sends it. A sub3 ending in a
 * backtick looks like a typo because it is one — but it is still what the
 * site sends, so it is attached as it stands rather than corrected here and
 * left broken there.
 */
export function AttachSub3({
  token,
  publishers,
}: {
  token: string;
  publishers: PublisherOption[];
}) {
  const router = useRouter();
  const [publisherId, setPublisherId] = useState(
    publishers.length === 1 ? publishers[0].id : "",
  );
  const [isPending, startTransition] = useTransition();

  const chosen = publishers.find((p) => p.id === publisherId);

  function attach() {
    if (!chosen) {
      toast.error("Choisis d'abord l'affilié à qui ce trafic appartient.");
      return;
    }
    if (
      !window.confirm(
        `Rattacher « ${token} » à ${chosen.label} ? Les conversions déjà reçues sous ce sub3 lui seront comptées, et son solde augmentera d'autant.`,
      )
    )
      return;

    startTransition(async () => {
      const res = await fetch("/api/admin/postback/aliases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publisherId, token }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error ?? "Impossible de rattacher ce sub3.");
        return;
      }
      toast.success(attachedMessage(token, json));
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-2">
      <code className="min-w-[120px] flex-1 px-1 font-mono text-xs break-all">
        {token}
      </code>
      <Select
        value={publisherId}
        onValueChange={(value) => value && setPublisherId(String(value))}
      >
        <SelectTrigger className="h-8 w-[220px]">
          <SelectValue placeholder="À quel affilié ?">
            {chosen?.label ?? "À quel affilié ?"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {publishers.map((publisher) => (
            <SelectItem key={publisher.id} value={publisher.id}>
              {publisher.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size="sm" onClick={attach} disabled={isPending || !chosen}>
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Link2 className="h-3.5 w-3.5" />
        )}
        Rattacher
      </Button>
    </div>
  );
}
