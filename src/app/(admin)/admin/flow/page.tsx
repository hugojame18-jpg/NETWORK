import type { Metadata } from "next";
import { flowConfig, lastSync } from "@/lib/flow";
import { PageHeader } from "@/components/dashboard/page-header";
import { FlowSyncPanel } from "@/components/dashboard/admin/flow-sync-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Synchro Flow" };

// Shows a live integration state; a cached render would lie about it.
export const dynamic = "force-dynamic";

export default async function AdminFlowPage() {
  const [config, sync] = await Promise.all([flowConfig(), lastSync()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Synchronisation Flow"
        description="Les clics et les hosts sont relus chez Flow toutes les deux heures, par affilié. Plus rien à saisir le soir."
      />

      <Card>
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FlowSyncPanel hasKey={config.apiKey !== null} />
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              La clé se trouve dans ton profil Flow, à la rubrique API. Elle est
              rangée en base, comme la clé de postback : remplaçable d&apos;ici
              sans redéploiement, et jamais renvoyée vers le navigateur une fois
              enregistrée.
            </p>
            <p>
              Appelée sur <code className="rounded bg-muted px-1 py-0.5 text-xs">{config.apiUrl}</code>,
              découpée par jour et par sub3, en UTC — le même repère que les
              conversions, pour que les deux chiffres ne tombent pas de part et
              d&apos;autre de minuit.
            </p>
            <p>
              Seuls les clics et les hosts viennent d&apos;ici. Les conversions
              et les revenus restent ceux du postback, qui arrive en temps réel.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dernière synchronisation</CardTitle>
        </CardHeader>
        <CardContent>
          {sync === null ? (
            <p className="text-sm text-muted-foreground">
              Aucune synchronisation n&apos;a encore tourné. Enregistre ta clé,
              puis lance-en une pour vérifier.
            </p>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={sync.ok ? "default" : "destructive"}>
                  {sync.ok ? "Réussie" : "Échouée"}
                </Badge>
                <span className="text-muted-foreground">
                  {formatDateTime(new Date(sync.ranAt))} · période du{" "}
                  {sync.from} au {sync.to}
                </span>
              </div>

              {sync.ok ? (
                <p className="text-muted-foreground">
                  <strong className="num text-foreground">
                    {sync.rowsWritten}
                  </strong>{" "}
                  journée(s) d&apos;affilié mise(s) à jour.
                </p>
              ) : (
                <p className="text-destructive">{sync.error}</p>
              )}

              {sync.unknownSub3.length > 0 && (
                <div className="rounded-lg border border-warning/40 bg-warning/10 p-3">
                  <p className="font-medium">
                    Du trafic arrive sous des sub3 inconnus
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Ces valeurs tournent chez Flow mais ne correspondent à aucun
                    affilié ici, donc leurs clics ne sont attribués à personne.
                    Mets le sub3 correspondant sur le bon compte depuis la page
                    Global postback :
                  </p>
                  <p className="mt-2 font-mono text-xs">
                    {sync.unknownSub3.join(", ")}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
