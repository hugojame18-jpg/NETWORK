import type { Metadata } from "next";
import { requireRole } from "@/lib/rbac";
import { getNotifications } from "@/lib/data/notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationRow } from "@/components/dashboard/notification-row";
import { MarkAllReadButton } from "@/components/dashboard/mark-all-read-button";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await requireRole("PUBLISHER");
  const notifications = await getNotifications(user.id, 100);

  return (
    <Card className="shadow-premium">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Notifications</CardTitle>
        <MarkAllReadButton />
      </CardHeader>
      <CardContent className="p-0">
        {notifications.map((n) => (
          <NotificationRow key={n.id} id={n.id} title={n.title} body={n.body} read={n.read} createdAt={n.createdAt} />
        ))}
        {notifications.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">Aucune notification pour le moment.</p>
        )}
      </CardContent>
    </Card>
  );
}
