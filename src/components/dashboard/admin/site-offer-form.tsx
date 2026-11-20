"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SiteOffer } from "@/lib/validations/site-offer";

const FIELDS: {
  key: keyof SiteOffer;
  label: string;
  hint: string;
  long?: boolean;
  placeholder?: string;
}[] = [
  {
    key: "trackingUrl",
    label: "Lien de l'offre",
    hint: "Le lien CC Submit, sans sub3 : il est ajouté pour chaque site.",
    placeholder: "https://…",
  },
  { key: "productName", label: "Nom de l'offre", hint: "Tel que le visiteur doit le comprendre." },
  {
    key: "summary",
    label: "Ce que le visiteur obtient",
    hint: "Ce qui lui est réellement livré ou donné, en une ou deux phrases.",
    long: true,
  },
  { key: "price", label: "Prix demandé aujourd'hui", hint: "Ce qui est débité au moment de l'inscription." },
  {
    key: "recurring",
    label: "Prélèvements suivants",
    hint: "Montant et rythme de tout prélèvement ultérieur, ou « Aucun » s'il n'y en a pas.",
    long: true,
  },
  { key: "billedBy", label: "Qui débite", hint: "Le nom qui apparaît sur le relevé bancaire." },
  { key: "cancellation", label: "Comment résilier", hint: "Où et comment, en clair.", long: true },
  { key: "companyName", label: "Nom de la société", hint: "Affiché en pied de page." },
  { key: "contactEmail", label: "E-mail de contact", hint: "Affiché en pied de page." },
];

export function SiteOfferForm({ initial }: { initial: Partial<SiteOffer> }) {
  const [form, setForm] = useState<Record<string, string>>(
    Object.fromEntries(FIELDS.map((f) => [f.key, initial[f.key] ?? ""])),
  );
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch("/api/admin/site-offer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error ?? "Enregistrement impossible.");
        return;
      }
      toast.success("Conditions enregistrées. Les affiliés peuvent générer leur site.");
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {FIELDS.map((f) => (
        <div key={f.key} className="space-y-1.5">
          <Label htmlFor={`offer-${f.key}`}>{f.label}</Label>
          {f.long ? (
            <Textarea
              id={`offer-${f.key}`}
              rows={3}
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            />
          ) : (
            <Input
              id={`offer-${f.key}`}
              value={form[f.key]}
              placeholder={f.placeholder}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            />
          )}
          <p className="text-xs text-muted-foreground">{f.hint}</p>
        </div>
      ))}
      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Enregistrer
      </Button>
    </form>
  );
}
