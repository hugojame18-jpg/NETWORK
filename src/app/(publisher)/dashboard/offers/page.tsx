import type { Metadata } from "next";
import Link from "next/link";
import { Globe2, Smartphone } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { getAvailableOffers, getPublisherByUserId, getPublisherLinks } from "@/lib/data/publisher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GenerateLinkButton } from "@/components/dashboard/generate-link-button";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = { title: "Offres disponibles" };

const PAYOUT_LABELS: Record<string, string> = {
  CPA: "CPA",
  CPL: "CPL",
  CPS: "CPS",
  REVSHARE: "RevShare",
};

interface OffersPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function OffersPage({ searchParams }: OffersPageProps) {
  const user = await requireRole("PUBLISHER");
  const publisher = await getPublisherByUserId(user.id);
  const { category } = await searchParams;

  const [offers, links] = await Promise.all([
    getAvailableOffers({ category }),
    getPublisherLinks(publisher.id),
  ]);

  const linkByOffer = new Map(links.map((link) => [link.offerId, link]));
  const categories = Array.from(new Set(offers.map((o) => o.category)));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Link href="/dashboard/offers">
          <Badge variant={!category ? "default" : "secondary"} className="cursor-pointer px-3 py-1">
            Toutes
          </Badge>
        </Link>
        {categories.map((cat) => (
          <Link key={cat} href={`/dashboard/offers?category=${encodeURIComponent(cat)}`}>
            <Badge variant={category === cat ? "default" : "secondary"} className="cursor-pointer px-3 py-1">
              {cat}
            </Badge>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {offers.map((offer) => {
          const existingLink = linkByOffer.get(offer.id);
          return (
            <Card key={offer.id} className="hover-lift shadow-premium flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">
                      <Link href={`/dashboard/offers/${offer.id}`} className="hover:underline">
                        {offer.name}
                      </Link>
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">{offer.advertiser.companyName}</p>
                  </div>
                  <Badge variant="secondary">{offer.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <p className="line-clamp-2 text-sm text-muted-foreground">{offer.description}</p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Globe2 className="h-3.5 w-3.5" />
                    {offer.countries.length === 0 ? "Monde entier" : offer.countries.join(", ")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Smartphone className="h-3.5 w-3.5" />
                    {offer.devices.join(", ")}
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between pt-2">
                  <div>
                    <p className="text-lg font-semibold">{formatCurrency(offer.payout)}</p>
                    <p className="text-xs text-muted-foreground">{PAYOUT_LABELS[offer.payoutType]} · cookie {offer.cookieDays}j</p>
                  </div>
                  <GenerateLinkButton offerId={offer.id} initialToken={existingLink?.token} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {offers.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">Aucune offre disponible pour le moment.</p>
      )}
    </div>
  );
}
