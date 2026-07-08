"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const DEVICE_OPTIONS = ["DESKTOP", "MOBILE", "TABLET", "ALL"] as const;
const PAYOUT_TYPES = ["CPA", "CPL", "CPS", "REVSHARE"] as const;

export interface OfferFormValues {
  id?: string;
  name: string;
  description: string;
  category: string;
  payout: string;
  payoutType: (typeof PAYOUT_TYPES)[number];
  countries: string;
  devices: string[];
  restrictions: string;
  landingUrl: string;
  previewUrl: string;
  creativeUrl: string;
  cookieDays: string;
  dailyCap: string;
  campaignId: string;
}

interface OfferFormDialogProps {
  offer?: OfferFormValues;
  campaigns: { id: string; name: string }[];
}

const EMPTY: OfferFormValues = {
  name: "",
  description: "",
  category: "",
  payout: "",
  payoutType: "CPA",
  countries: "",
  devices: ["ALL"],
  restrictions: "",
  landingUrl: "",
  previewUrl: "",
  creativeUrl: "",
  cookieDays: "30",
  dailyCap: "",
  campaignId: "",
};

export function OfferFormDialog({ offer, campaigns }: OfferFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<OfferFormValues>(offer ?? EMPTY);

  function toggleDevice(device: string) {
    setForm((f) => ({
      ...f,
      devices: f.devices.includes(device) ? f.devices.filter((d) => d !== device) : [...f.devices, device],
    }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const payload = {
        name: form.name,
        description: form.description,
        category: form.category,
        payout: Number(form.payout),
        payoutType: form.payoutType,
        countries: form.countries
          .split(",")
          .map((c) => c.trim().toUpperCase())
          .filter(Boolean),
        devices: form.devices,
        restrictions: form.restrictions,
        landingUrl: form.landingUrl,
        previewUrl: form.previewUrl,
        creativeUrl: form.creativeUrl,
        cookieDays: Number(form.cookieDays),
        dailyCap: form.dailyCap ? Number(form.dailyCap) : null,
        campaignId: form.campaignId,
      };

      const url = offer?.id ? `/api/advertiser/offers/${offer.id}` : "/api/advertiser/offers";
      const res = await fetch(url, {
        method: offer?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erreur lors de l'enregistrement.");
        return;
      }
      toast.success(offer?.id ? "Offre mise à jour, en attente de validation." : "Offre créée, en attente de validation.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          offer ? (
            <Button variant="ghost" size="icon-sm" aria-label="Modifier">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button>
              <Plus className="h-4 w-4" />
              Nouvelle offre
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{offer ? "Modifier l'offre" : "Nouvelle offre"}</DialogTitle>
          <DialogDescription>Chaque offre créée ou modifiée passe par une validation admin avant de redevenir active.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Input id="category" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payout">Payout ($)</Label>
              <Input
                id="payout"
                type="number"
                min={0}
                step="0.01"
                required
                value={form.payout}
                onChange={(e) => setForm({ ...form, payout: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.payoutType} onValueChange={(v) => v && setForm({ ...form, payoutType: v as OfferFormValues["payoutType"] })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYOUT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cookieDays">Cookie (jours)</Label>
              <Input
                id="cookieDays"
                type="number"
                min={1}
                required
                value={form.cookieDays}
                onChange={(e) => setForm({ ...form, cookieDays: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="countries">Pays (codes ISO séparés par une virgule, vide = monde entier)</Label>
            <Input
              id="countries"
              placeholder="US, CA, FR"
              value={form.countries}
              onChange={(e) => setForm({ ...form, countries: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Devices</Label>
            <div className="flex flex-wrap gap-4">
              {DEVICE_OPTIONS.map((device) => (
                <label key={device} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={form.devices.includes(device)} onCheckedChange={() => toggleDevice(device)} />
                  {device}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="landingUrl">Landing page</Label>
            <Input
              id="landingUrl"
              type="url"
              required
              placeholder="https://"
              value={form.landingUrl}
              onChange={(e) => setForm({ ...form, landingUrl: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="previewUrl">Preview (optionnel)</Label>
              <Input
                id="previewUrl"
                type="url"
                placeholder="https://"
                value={form.previewUrl}
                onChange={(e) => setForm({ ...form, previewUrl: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dailyCap">Cap journalier (optionnel)</Label>
              <Input
                id="dailyCap"
                type="number"
                min={0}
                value={form.dailyCap}
                onChange={(e) => setForm({ ...form, dailyCap: e.target.value })}
              />
            </div>
          </div>

          {campaigns.length > 0 && (
            <div className="space-y-2">
              <Label>Campagne (optionnel)</Label>
              <Select value={form.campaignId || "none"} onValueChange={(v) => setForm({ ...form, campaignId: v === "none" ? "" : v ?? "" })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="restrictions">Restrictions (optionnel)</Label>
            <Textarea
              id="restrictions"
              value={form.restrictions}
              onChange={(e) => setForm({ ...form, restrictions: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {offer ? "Enregistrer" : "Créer l'offre"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
