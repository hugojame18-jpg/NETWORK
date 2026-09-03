import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { getUnreadNotifications } from "@/lib/data/notifications";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { ApplicationPending } from "@/components/dashboard/application-pending";
import { publisherNavItems } from "./nav-items";

export default async function PublisherDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("PUBLISHER");

  // Applications are vetted by hand: until an admin approves, the dashboard is
  // replaced wholesale by a status screen. Gating here covers every child route
  // at once, so a new page can't accidentally ship unprotected.
  const publisher = await prisma.publisher.findUnique({
    where: { userId: user.id },
    select: { applicationStatus: true },
  });
  if (publisher && publisher.applicationStatus !== "APPROVED") {
    return (
      <ApplicationPending
        name={user.name ?? ""}
        rejected={publisher.applicationStatus === "REJECTED"}
      />
    );
  }

  const notifications = await getUnreadNotifications(user.id);

  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar items={publisherNavItems} brandLabel="RevNetwork" brandHref="/dashboard" />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar
          navItems={publisherNavItems}
          brandLabel="RevNetwork"
          notifications={notifications}
          notificationsHref="/dashboard/notifications"
          profileHref="/dashboard/profile"
          settingsHref="/dashboard/settings"
          user={{ name: user.name ?? "", email: user.email ?? "", image: user.image }}
        />
        <main className="flex-1 space-y-6 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
