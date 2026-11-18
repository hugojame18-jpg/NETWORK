import type { Metadata } from "next";
import { requireRole } from "@/lib/rbac";
import { getNotifications } from "@/lib/data/notifications";
import { Card, CardContent } from "@/components/ui/card";
import { NotificationRow } from "@/components/dashboard/notification-row";
import { MarkAllReadButton } from "@/components/dashboard/mark-all-read-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Bell } from "lucide-react";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await requireRole("PUBLISHER");
  const notifications = await getNotifications(user.id, 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Les réponses à tes demandes de liens, tes paiements et les annonces du réseau."
        action={<MarkAllReadButton />}
      />

      <Card>
        <CardContent className="px-0">
          {notifications.length === 0 ? (
            <EmptyState
              icon={<Bell />}
              title="Rien de neuf"
              description="Tu seras prévenu ici dès qu'un lien est prêt, qu'un paiement part ou qu'une offre arrive."
            />
          ) : (
            notifications.map((n) => (
              <NotificationRow
                key={n.id}
                id={n.id}
                title={n.title}
                body={n.body}
                read={n.read}
                createdAt={n.createdAt}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
