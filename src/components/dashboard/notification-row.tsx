"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";

interface NotificationRowProps {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date | string;
}

export function NotificationRow({ id, title, body, read, createdAt }: NotificationRowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function markRead() {
    if (read) return;
    startTransition(async () => {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      router.refresh();
    });
  }

  return (
    <button
      onClick={markRead}
      disabled={isPending}
      className={cn(
        "flex w-full items-start gap-3 border-b border-border/60 px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-muted/40",
        !read && "bg-primary/5",
      )}
    >
      {!read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
      {read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-transparent" />}
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{body}</p>
        <p className="mt-1 text-xs text-muted-foreground/70">{formatDateTime(createdAt)}</p>
      </div>
    </button>
  );
}
