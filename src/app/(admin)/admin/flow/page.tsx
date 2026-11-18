import type { Metadata } from "next";
import { flowConfig, lastSync } from "@/lib/flow";
import { getPublishersForSelect } from "@/lib/data/admin";
import { AttachSub3 } from "@/components/dashboard/admin/attach-sub3";
import { PageHeader } from "@/components/dashboard/page-header";
import { FlowSyncPanel } from "@/components/dashboard/admin/flow-sync-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Synchro Flow" };

// Shows a live integration state; a cached render would lie about it.
export const dynamic = "force-dynamic";

export default async function AdminFlowPage() {
  const [config, sync, publishers] = await Promise.all([
    flowConfig(),
    lastSync(),
    getPublishersForSelect(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Synchronisation Flow"
        description="Les clics et les hosts sont relus chez Flow par affilié : à chaque conversion, quand un affilié ouvre ses stats, et une fois par nuit. Plus rien à saisir le soir."
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
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    <strong className="num text-foreground">
                      {sync.rowsWritten}
                    </strong>{" "}
                    journée(s) d&apos;affilié mise(s) à jour, sur{" "}
                    <strong className="num text-foreground">
                      {sync.rowsReturned ?? 0}
                    </strong>{" "}
                    ligne(s) renvoyée(s) par Flow.
                  </p>
                  {sync.rowsReturned === 0 && (
                    <p>
                      Flow a accepté la requête mais n&apos;a aucun trafic à
                      remonter sur ces trois jours. Soit il n&apos;y a
                      effectivement pas eu de clic, soit tes liens ne portent
                      pas de sub3.
                    </p>
                  )}
                  {sync.sampleSlices && sync.sampleSlices.length > 0 && (
                    <div>
                      <p className="eyebrow">Échantillon reçu</p>
                      <p className="mt-1 font-mono text-xs break-all">
                        {sync.sampleSlices.join("  ·  ")}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-destructive">{sync.error}</p>
              )}

              {sync.unknownSub3.length > 0 && (
                <div className="rounded-lg border border-warning/40 bg-warning/10 p-3">
                  <p className="font-medium">
                    Du trafic arrive sous des sub3 que personne ne porte
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Ces valeurs tournent chez Flow mais ne correspondent à
                    aucun compte ici : leurs clics ne s&apos;affichent nulle
                    part et leurs conversions sont refusées par le postback.
                    Dis à qui chacune appartient — un affilié peut en porter
                    autant qu&apos;il a de sites, et tout s&apos;additionne
                    sur son dashboard. Les conversions déjà refusées sous ce
                    sub3 lui seront comptées dans la foulée.
                  </p>
                  <div className="mt-3 space-y-2">
                    {sync.unknownSub3.map((token) => (
                      <AttachSub3
                        key={token}
                        token={token}
                        publishers={publishers.map((publisher) => ({
                          id: publisher.id,
                          label: publisher.label,
                        }))}
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Une valeur qui se termine par un accent grave est une faute
                    de frappe dans la configuration du site. Tu peux la
                    rattacher telle quelle : c&apos;est bien ce que le site
                    envoie.
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
