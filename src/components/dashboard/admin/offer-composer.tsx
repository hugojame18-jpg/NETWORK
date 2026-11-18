"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { VERTICALS } from "@/lib/verticals";

const PAYOUT_TYPES = ["CPA", "CPL", "CPS", "REVSHARE"] as const;

export function OfferComposer() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(VERTICALS[0]?.value ?? "");
  const [description, setDescription] = useState("");
  const [payout, setPayout] = useState("0");
  const [payoutType, setPayoutType] =
    useState<(typeof PAYOUT_TYPES)[number]>("CPA");
  const [landingUrl, setLandingUrl] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch("/api/admin/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          description,
          payout: Number(payout) || 0,
          payoutType,
          landingUrl,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Création impossible.");
        return;
      }
      toast.success("Offre créée et active.");
      setName("");
      setDescription("");
      setPayout("0");
      setLandingUrl("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="offer-name">Nom de l&apos;offre</Label>
        <Input
          id="offer-name"
          required
          placeholder="Ex. Sweepstake iPhone 17 — FR"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="offer-category">Catégorie</Label>
        <select
          id="offer-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {VERTICALS.map((vertical) => (
            <option key={vertical.value} value={vertical.value}>
              {vertical.icon} {vertical.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="offer-payout">Payout ($)</Label>
        <Input
          id="offer-payout"
          type="number"
          min={0}
          step="0.01"
          value={payout}
          onChange={(e) => setPayout(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="offer-payout-type">Type de payout</Label>
        <select
          id="offer-payout-type"
          value={payoutType}
          onChange={(e) =>
            setPayoutType(e.target.value as (typeof PAYOUT_TYPES)[number])
          }
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {PAYOUT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="offer-landing">Lien de l&apos;offre (optionnel)</Label>
        <Input
          id="offer-landing"
          type="url"
          placeholder="https://… — tu pourras l'ajouter plus tard"
          value={landingUrl}
          onChange={(e) => setLandingUrl(e.target.value)}
        />
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="offer-description">Description (optionnel)</Label>
        <Textarea
          id="offer-description"
          rows={2}
          placeholder="Ce que voit l'affilié sur la carte de l'offre."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Créer l&apos;offre
        </Button>
      </div>
    </form>
  );
}
