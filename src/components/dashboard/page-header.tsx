import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  /** One sentence saying what this page is for. Skipped only when truly obvious. */
  description?: string;
  /** Primary action(s) for the page, right-aligned on wide screens. */
  action?: ReactNode;
  className?: string;
}

/**
 * Every screen opens the same way: what this is, what it's for, what you can do
 * here. Without it a page starts mid-air — a filter chip or a bare table with
 * no title — which is the single clearest signal of an unfinished product.
 */
export function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-4",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <h1 className="text-[22px] leading-tight font-semibold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
}
