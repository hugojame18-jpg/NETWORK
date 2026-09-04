import { Megaphone } from "lucide-react";
import { formatDate } from "@/lib/format";

interface AnnouncementBannerProps {
  announcements: { id: string; title: string; body: string; createdAt: Date }[];
}

/**
 * Admin messages, pinned at the top of the publisher dashboard. Server-rendered
 * and not dismissible: the admin controls visibility by toggling the message
 * off, so it can't be missed by a publisher who clicked it away once.
 */
export function AnnouncementBanner({ announcements }: AnnouncementBannerProps) {
  if (announcements.length === 0) return null;

  return (
    <div className="space-y-3">
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className="flex gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4"
        >
          <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <p className="font-semibold">{announcement.title}</p>
              <span className="text-xs text-muted-foreground">{formatDate(announcement.createdAt)}</span>
            </div>
            <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">{announcement.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
