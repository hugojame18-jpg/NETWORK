import { Skeleton } from "@/components/ui/skeleton";

/**
 * Generic dashboard page skeleton shown by the route-group `loading.tsx`
 * files while a server component page is streaming. Mirrors the common
 * layout of the dashboards: heading, stat cards row, then a large panel.
 */
export function DashboardPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Chargement de la page">
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}
