import { requireRole } from "@/lib/rbac";
import { getUnreadNotifications } from "@/lib/data/notifications";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { publisherNavItems } from "./nav-items";

export default async function PublisherDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("PUBLISHER");
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
