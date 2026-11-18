import type { Metadata } from "next";
import { Webhook } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  ensurePostbackTokens,
  postbackSecret,
  postbackUrlTemplate,
} from "@/lib/postback";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { CopyValue } from "@/components/dashboard/admin/copy-value";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Global postback" };

// The secret and the hit log must never come from a cached render.
export const dynamic = "force-dynamic";

const STATUS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  ACCEPTED: { label: "Comptée", variant: "default" },
  DUPLICATE: { label: "Doublon", variant: "secondary" },
  UNKNOWN_TOKEN: { label: "sub3 inconnu", variant: "destructive" },
  UNAUTHORIZED: { label: "Clé refusée", variant: "destructive" },
  INVALID: { label: "Appel incomplet", variant: "destructive" },
};

export default async function AdminPostbackPage() {
  // Any affiliate without a sub3 gets one the moment this page is opened, so
  // the list below is never missing a row you were about to go looking for.
  await ensurePostbackTokens();

  const [secret, publishers, hits] = await Promise.all([
    postbackSecret(),
    prisma.publisher.findMany({
      orderBy: { memberId: "asc" },
      select: {
        id: true,
        memberId: true,
        companyName: true,
        postbackToken: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.postbackHit.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        publisher: {
          select: { memberId: true, user: { select: { name: true } } },
        },
      },
    }),
  ]);

  const url = postbackUrlTemplate(secret);
  const accepted = hits.filter((hit) => hit.status === "ACCEPTED").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Global postback"
        description="L'URL à donner à tes réseaux annonceurs, et le sub3 de chaque affilié. Une conversion qui arrive ici monte immédiatement sur son dashboard."
      />

      <Card>
        <CardHeader>
          <CardTitle>Ton URL de postback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CopyValue value={url} />
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Remplace{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                {"{sub3}"}
              </code>
              ,{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                {"{payout}"}
              </code>{" "}
              et{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                {"{transaction_id}"}
              </code>{" "}
              par les macros du réseau — chacun a les siennes.
            </p>
            <p>
              Le montant est pris comme{" "}
              <strong className="text-foreground">CA brut</strong> :
              l&apos;affilié touche sa part automatiquement. Les noms de
              paramètres courants sont tous acceptés (payout, amount, sum,
              revenue…), de même que txid, transaction_id ou clickid pour
              l&apos;identifiant de transaction.
            </p>
            <p>
              L&apos;identifiant de transaction n&apos;est pas obligatoire, mais
              sans lui une conversion renvoyée deux fois par le réseau sera
              comptée deux fois.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Le sub3 de chaque affilié</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {publishers.length === 0 ? (
            <EmptyState
              icon={<Webhook />}
              title="Aucun affilié"
              description="Chaque compte créé reçoit automatiquement son sub3, visible ici."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Affilié</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>sub3 à passer dans son trafic</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publishers.map((publisher) => (
                  <TableRow key={publisher.id}>
                    <TableCell>
                      <p className="font-medium">
                        {publisher.companyName ?? publisher.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {publisher.user.email}
                      </p>
                    </TableCell>
                    <TableCell className="num text-muted-foreground">
                      #{publisher.memberId}
                    </TableCell>
                    <TableCell className="w-[280px]">
                      {publisher.postbackToken ? (
                        <CopyValue value={publisher.postbackToken} />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Derniers appels reçus</CardTitle>
            <p className="text-xs text-muted-foreground">
              {hits.length === 0
                ? "aucun appel"
                : `${accepted} comptée${accepted > 1 ? "s" : ""} sur les ${hits.length} derniers`}
            </p>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {hits.length === 0 ? (
            <EmptyState
              icon={<Webhook />}
              title="Aucun appel pour l'instant"
              description="Dès qu'un réseau appelle ton URL, l'appel apparaît ici — compté ou rejeté, avec la raison."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reçu le</TableHead>
                  <TableHead>Affilié</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hits.map((hit) => {
                  const status = STATUS[hit.status] ?? {
                    label: hit.status,
                    variant: "secondary" as const,
                  };
                  return (
                    <TableRow key={hit.id}>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(hit.createdAt)}
                      </TableCell>
                      <TableCell>
                        {hit.publisher ? (
                          <>
                            <span className="font-medium">
                              {hit.publisher.user.name}
                            </span>{" "}
                            <span className="num text-xs text-muted-foreground">
                              #{hit.publisher.memberId}
                            </span>
                          </>
                        ) : (
                          <span className="font-mono text-xs text-muted-foreground">
                            {hit.sub3 ?? "sub3 absent"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="num">
                        {hit.amount === null ? "—" : formatCurrency(hit.amount)}
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate font-mono text-xs text-muted-foreground">
                        {hit.transactionId ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-start gap-1">
                          <Badge variant={status.variant}>{status.label}</Badge>
                          {hit.message && (
                            <span className="text-xs text-muted-foreground">
                              {hit.message}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
