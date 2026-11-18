"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function TrainingComposer() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch("/api/admin/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, description }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Ajout impossible.");
        return;
      }
      toast.success("Vidéo ajoutée à l'espace formation.");
      setTitle("");
      setUrl("");
      setDescription("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="training-title">Titre</Label>
        <Input
          id="training-title"
          required
          maxLength={150}
          placeholder="Ex. Créer sa première campagne TikTok"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="training-url">Lien de la vidéo</Label>
        <Input
          id="training-url"
          type="url"
          required
          placeholder="https://youtube.com/watch?v=…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          YouTube, Loom, Drive… La miniature YouTube est récupérée
          automatiquement.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="training-description">Description (optionnel)</Label>
        <Textarea
          id="training-description"
          rows={3}
          placeholder="Ce que l'affilié va apprendre."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        Ajouter la vidéo
      </Button>
    </form>
  );
}
