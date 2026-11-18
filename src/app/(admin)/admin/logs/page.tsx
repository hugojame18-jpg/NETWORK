import type { Metadata } from "next";
import { getAuditLogs } from "@/lib/data/admin";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ScrollText } from "lucide-react";

export const metadata: Metadata = { title: "Logs" };

export default async function AdminLogsPage() {
  const logs = await getAuditLogs(200);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal"
        description="Les actions sensibles effectuées sur la plateforme."
      />

      <Card>
        <CardContent className="px-0">
          {logs.length === 0 ? (
            <EmptyState
              icon={<ScrollText />}
              title="Journal vide"
              description="Chaque action d'administration sera tracée ici."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Cible</TableHead>
                  <TableHead>Acteur</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant="secondary">{log.action}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.targetType}
                      {log.targetId ? ` · ${log.targetId.slice(0, 10)}…` : ""}
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.actor?.name ?? "Système"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(log.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
