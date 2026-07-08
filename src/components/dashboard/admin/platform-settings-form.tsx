"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface PlatformSettingsFormProps {
  siteName: string;
  supportEmail: string;
  defaultCookieDays: number;
  minPayout: number;
  maintenanceMode: boolean;
}

export function PlatformSettingsForm(initial: PlatformSettingsFormProps) {
  const [form, setForm] = useState(initial);
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          defaultCookieDays: Number(form.defaultCookieDays),
          minPayout: Number(form.minPayout),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erreur lors de la mise à jour.");
        return;
      }
      toast.success("Paramètres enregistrés.");
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="siteName">Nom de la plateforme</Label>
          <Input id="siteName" value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supportEmail">Email support</Label>
          <Input
            id="supportEmail"
            type="email"
            value={form.supportEmail}
            onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="defaultCookieDays">Cookie par défaut (jours)</Label>
          <Input
            id="defaultCookieDays"
            type="number"
            min={1}
            value={form.defaultCookieDays}
            onChange={(e) => setForm({ ...form, defaultCookieDays: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minPayout">Paiement minimum ($)</Label>
          <Input
            id="minPayout"
            type="number"
            min={0}
            value={form.minPayout}
            onChange={(e) => setForm({ ...form, minPayout: Number(e.target.value) })}
          />
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <div>
          <p className="text-sm font-medium">Mode maintenance</p>
          <p className="text-xs text-muted-foreground">Désactive temporairement l&apos;accès public à la plateforme.</p>
        </div>
        <Switch
          checked={form.maintenanceMode}
          onCheckedChange={(checked) => setForm({ ...form, maintenanceMode: checked })}
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Enregistrer
      </Button>
    </form>
  );
}
