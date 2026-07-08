"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface PublisherOption {
  id: string;
  label: string;
  email: string;
}

export interface DailyStatFormValues {
  id?: string;
  publisherId: string;
  date: string; // yyyy-MM-dd
  clicks: string;
  hosts: string;
  conversions: string;
  revenue: string;
}

interface DailyStatFormDialogProps {
  publishers: PublisherOption[];
  stat?: DailyStatFormValues;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY: DailyStatFormValues = {
  publisherId: "",
  date: today(),
  clicks: "",
  hosts: "",
  conversions: "",
  revenue: "",
};

export function DailyStatFormDialog({ publishers, stat }: DailyStatFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<DailyStatFormValues>(stat ?? EMPTY);

  const isEdit = Boolean(stat?.id);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.publisherId) {
      toast.error("Sélectionnez un publisher.");
      return;
    }

    startTransition(async () => {
      const payload = {
        publisherId: form.publisherId,
        date: form.date,
        clicks: Number(form.clicks || 0),
        hosts: Number(form.hosts || 0),
        conversions: Number(form.conversions || 0),
        revenue: Number(form.revenue || 0),
      };

      const url = isEdit ? `/api/admin/daily-stats/${stat!.id}` : "/api/admin/daily-stats";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { clicks: payload.clicks, hosts: payload.hosts, conversions: payload.conversions, revenue: payload.revenue } : payload),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erreur lors de l'enregistrement.");
        return;
      }
      toast.success(isEdit ? "Statistiques mises à jour." : "Journée enregistrée.");
      setOpen(false);
      if (!isEdit) setForm(EMPTY);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isEdit ? (
            <Button variant="ghost" size="icon-sm" aria-label="Modifier">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button>
              <Plus className="h-4 w-4" />
              Nouvelle journée
            </Button>
          )
        }
      />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier la journée" : "Saisir les statistiques du jour"}</DialogTitle>
          <DialogDescription>
            Ces chiffres deviennent immédiatement les statistiques officielles affichées au publisher.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Publisher</Label>
              <Select
                value={form.publisherId}
                onValueChange={(v) => v && setForm({ ...form, publisherId: v })}
                disabled={isEdit}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {publishers.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                required
                value={form.date}
                disabled={isEdit}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clicks">Clics</Label>
              <Input
                id="clicks"
                type="number"
                min={0}
                required
                value={form.clicks}
                onChange={(e) => setForm({ ...form, clicks: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hosts">Hosts</Label>
              <Input
                id="hosts"
                type="number"
                min={0}
                required
                value={form.hosts}
                onChange={(e) => setForm({ ...form, hosts: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conversions">Conversions</Label>
              <Input
                id="conversions"
                type="number"
                min={0}
                required
                value={form.conversions}
                onChange={(e) => setForm({ ...form, conversions: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="revenue">Revenus ($)</Label>
              <Input
                id="revenue"
                type="number"
                min={0}
                step="0.01"
                required
                value={form.revenue}
                onChange={(e) => setForm({ ...form, revenue: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
