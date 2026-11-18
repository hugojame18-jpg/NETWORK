import type { Metadata } from "next";
import { getUsersAdminList, getAllPermissions } from "@/lib/data/admin";
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
import { UserStatusMenu } from "@/components/dashboard/admin/user-status-menu";
import { PermissionsDialog } from "@/components/dashboard/admin/permissions-dialog";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Shield } from "lucide-react";

export const metadata: Metadata = { title: "Utilisateurs & rôles" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> =
  {
    ACTIVE: "default",
    PENDING: "secondary",
    SUSPENDED: "secondary",
    BANNED: "destructive",
  };

export default async function AdminUsersPage() {
  const [users, permissions] = await Promise.all([
    getUsersAdminList(),
    getAllPermissions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilisateurs & rôles"
        description="Tous les comptes de la plateforme, leur rôle et leurs permissions."
      />

      <Card>
        <CardContent className="px-0">
          {users.length === 0 ? (
            <EmptyState
              icon={<Shield />}
              title="Aucun utilisateur"
              description="Les comptes créés sur la plateforme apparaîtront ici."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Inscrit le</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[user.status]}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {user.role === "ADMIN" && (
                          <PermissionsDialog
                            userId={user.id}
                            userName={user.name}
                            allPermissions={permissions}
                            grantedKeys={user.permissions.map(
                              (p) => p.permission.key,
                            )}
                          />
                        )}
                        <UserStatusMenu
                          userId={user.id}
                          currentStatus={user.status}
                          userLabel={user.name}
                        />
                      </div>
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
