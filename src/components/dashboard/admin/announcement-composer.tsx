"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function AnnouncementComposer() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Envoi impossible.");
        return;
      }
      toast.success(
        json.recipients > 0
          ? `Message publié — ${json.recipients} affilié${json.recipients > 1 ? "s" : ""} notifié${json.recipients > 1 ? "s" : ""}.`
          : "Message publié.",
      );
      setTitle("");
      setBody("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          required
          maxLength={120}
          placeholder="Ex. Nouvelles offres CC Submit disponibles"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Message</Label>
        <Textarea
          id="body"
          required
          rows={5}
          maxLength={4000}
          placeholder="Écris ton message aux affiliés…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Il s&apos;affichera en haut du dashboard de tous tes affiliés, et chacun recevra une notification.
        </p>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Publier le message
      </Button>
    </form>
  );
}
