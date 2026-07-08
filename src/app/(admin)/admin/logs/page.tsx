import type { Metadata } from "next";
import { getAuditLogs } from "@/lib/data/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Logs" };

export default async function AdminLogsPage() {
  const logs = await getAuditLogs(200);

  return (
    <Card className="shadow-premium">
      <CardContent className="p-0">
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
                <TableCell className="text-sm">{log.actor?.name ?? "Système"}</TableCell>
                <TableCell className="text-muted-foreground">{formatDateTime(log.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {logs.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">Aucun log pour le moment.</p>}
      </CardContent>
    </Card>
  );
}
