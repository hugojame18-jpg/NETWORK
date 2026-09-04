import type { Metadata } from "next";
import { getAnnouncementsAdminList } from "@/lib/data/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnnouncementComposer } from "@/components/dashboard/admin/announcement-composer";
import { AnnouncementActions } from "@/components/dashboard/admin/announcement-actions";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Messages aux affiliés" };

export default async function AdminAnnouncementsPage() {
  const announcements = await getAnnouncementsAdminList();

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
      <Card className="shadow-premium h-fit">
        <CardHeader>
          <CardTitle>Nouveau message</CardTitle>
        </CardHeader>
        <CardContent>
          <AnnouncementComposer />
        </CardContent>
      </Card>

      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle>Messages publiés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`rounded-lg border p-4 ${
                announcement.active ? "border-border" : "border-border/60 bg-muted/30 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{announcement.title}</p>
                    <Badge variant={announcement.active ? "default" : "secondary"}>
                      {announcement.active ? "Visible" : "Masqué"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(announcement.createdAt)}
                    {announcement.author?.name ? ` · ${announcement.author.name}` : ""}
                  </p>
                </div>
                <AnnouncementActions id={announcement.id} active={announcement.active} />
              </div>
              <p className="mt-3 text-sm whitespace-pre-wrap text-muted-foreground">{announcement.body}</p>
            </div>
          ))}

          {announcements.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Aucun message pour le moment. Écris-en un à gauche.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
