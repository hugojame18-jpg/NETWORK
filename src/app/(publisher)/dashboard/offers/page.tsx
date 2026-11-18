import type { Metadata } from "next";
import Link from "next/link";
import { Globe2, Layers, Smartphone } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import {
  getAvailableOffers,
  getPublisherByUserId,
  getPublisherLinks,
} from "@/lib/data/publisher";
import { publisherPostbackToken, withSub3 } from "@/lib/postback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GenerateLinkButton } from "@/components/dashboard/generate-link-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatCurrency } from "@/lib/format";
import { verticalIcon, verticalLabel } from "@/lib/verticals";
import { cn } from "@/lib/utils";

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

/** Filter chips: a segmented row rather than loose badges, so the active state reads. */
function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary/40 bg-primary/12 text-primary"
          : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

export default async function OffersPage({ searchParams }: OffersPageProps) {
  const user = await requireRole("PUBLISHER");
  const publisher = await getPublisherByUserId(user.id);
  const { category } = await searchParams;

  const [offers, links, sub3] = await Promise.all([
    getAvailableOffers({ category }),
    getPublisherLinks(publisher.id),
    publisherPostbackToken(publisher.id, publisher.postbackToken),
  ]);

  const linkByOffer = new Map(links.map((link) => [link.offerId, link]));
  const categories = Array.from(new Set(offers.map((o) => o.category)));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offres disponibles"
        description="Choisis une offre, demande ton lien, envoie ton trafic. Tu touches ta part sur chaque conversion validée."
      />

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <FilterChip href="/dashboard/offers" active={!category}>
            Toutes
          </FilterChip>
          {categories.map((cat) => (
            <FilterChip
              key={cat}
              href={`/dashboard/offers?category=${encodeURIComponent(cat)}`}
              active={category === cat}
            >
              {verticalIcon(cat)} {verticalLabel(cat)}
            </FilterChip>
          ))}
        </div>
      )}

      {offers.length === 0 ? (
        <div className="surface">
          <EmptyState
            icon={<Layers />}
            title={
              category
                ? "Aucune offre dans cette catégorie"
                : "Aucune offre pour le moment"
            }
            description={
              category
                ? "Essaie une autre catégorie — le catalogue bouge souvent."
                : "De nouvelles offres arrivent régulièrement. Tu seras prévenu dès qu'il y a du neuf."
            }
            action={
              category ? (
                <Link
                  href="/dashboard/offers"
                  className="inline-flex items-center rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
                >
                  Voir toutes les offres
                </Link>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {offers.map((offer) => {
            const existingLink = linkByOffer.get(offer.id);
            return (
              <Card
                key={offer.id}
                className="hover-lift flex flex-col transition-colors hover:border-primary/30"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base">
                        <Link
                          href={`/dashboard/offers/${offer.id}`}
                          className="hover:underline"
                        >
                          {offer.name}
                        </Link>
                      </CardTitle>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {offer.advertiser.companyName}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {verticalIcon(offer.category)}{" "}
                      {verticalLabel(offer.category)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-4">
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {offer.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Globe2 className="h-3.5 w-3.5 shrink-0" />
                      {offer.countries.length === 0
                        ? "Monde entier"
                        : offer.countries.join(", ")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="h-3.5 w-3.5 shrink-0" />
                      {offer.devices.join(", ")}
                    </span>
                  </div>

                  <div className="rule-fade mt-auto" />

                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="num text-xl font-semibold">
                        {formatCurrency(offer.payout)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {PAYOUT_LABELS[offer.payoutType]} · cookie{" "}
                        {offer.cookieDays} j
                      </p>
                    </div>
                    <GenerateLinkButton
                      offerId={offer.id}
                      initialLink={
                        existingLink
                          ? {
                              status: existingLink.status,
                              targetUrl: existingLink.targetUrl
                                ? withSub3(existingLink.targetUrl, sub3)
                                : null,
                              token: existingLink.token,
                            }
                          : null
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
