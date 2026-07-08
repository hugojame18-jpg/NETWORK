import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Globe2, Smartphone, ShieldAlert, Timer } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { getOfferById, getPublisherByUserId, getExistingLink } from "@/lib/data/publisher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GenerateLinkButton } from "@/components/dashboard/generate-link-button";
import { formatCurrency } from "@/lib/format";

interface OfferDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: OfferDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const offer = await getOfferById(id);
  return { title: offer?.name ?? "Offre" };
}

export default async function OfferDetailPage({ params }: OfferDetailPageProps) {
  const user = await requireRole("PUBLISHER");
  const { id } = await params;

  const [publisher, offer] = await Promise.all([getPublisherByUserId(user.id), getOfferById(id)]);
  if (!offer || offer.status !== "ACTIVE") notFound();

  const existingLink = await getExistingLink(publisher.id, offer.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/dashboard/offers" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour aux offres
      </Link>

      <Card className="shadow-premium">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl">{offer.name}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{offer.advertiser.companyName}</p>
            </div>
            <Badge variant="secondary">{offer.category}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">{offer.description}</p>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Payout</p>
              <p className="mt-1 text-lg font-semibold">{formatCurrency(offer.payout)}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="mt-1 text-lg font-semibold">{offer.payoutType}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Cookie</p>
              <p className="mt-1 flex items-center gap-1 text-lg font-semibold">
                <Timer className="h-4 w-4" /> {offer.cookieDays}j
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Cap journalier</p>
              <p className="mt-1 text-lg font-semibold">{offer.dailyCap ?? "—"}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Globe2 className="h-4 w-4" />
              {offer.countries.length === 0 ? "Disponible dans le monde entier" : offer.countries.join(", ")}
            </span>
            <span className="flex items-center gap-1.5">
              <Smartphone className="h-4 w-4" />
              {offer.devices.join(", ")}
            </span>
          </div>

          {offer.restrictions && (
            <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              {offer.restrictions}
            </div>
          )}

          {offer.previewUrl && (
            <a
              href={offer.previewUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="block text-sm font-medium text-primary hover:underline"
            >
              Prévisualiser la landing page →
            </a>
          )}

          <div className="border-t border-border pt-6">
            <p className="mb-3 text-sm font-medium">Votre lien de tracking</p>
            <GenerateLinkButton offerId={offer.id} initialToken={existingLink?.token} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
