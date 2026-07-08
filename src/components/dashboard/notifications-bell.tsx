"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";

export interface NotificationPreview {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date | string;
}

interface NotificationsBellProps {
  notifications: NotificationPreview[];
  notificationsHref?: string;
}

export function NotificationsBell({ notifications, notificationsHref = "/dashboard/notifications" }: NotificationsBellProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 && (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">Rien de nouveau pour le moment.</p>
        )}
        {notifications.slice(0, 6).map((notification) => (
          <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-0.5 whitespace-normal">
            <div className="flex w-full items-center gap-2">
              {!notification.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
              <p className="text-sm font-medium">{notification.title}</p>
            </div>
            <p className="text-xs text-muted-foreground">{notification.body}</p>
            <p className="text-[10px] text-muted-foreground/70">{formatDateTime(notification.createdAt)}</p>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href={notificationsHref} />}>
          Voir toutes les notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
