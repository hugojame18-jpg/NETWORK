import { requireRole } from "@/lib/rbac";
import { getUnreadNotifications } from "@/lib/data/notifications";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { adminNavItems } from "./nav-items";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN");
  const notifications = await getUnreadNotifications(user.id);

  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar items={adminNavItems} brandLabel="RevNetwork Admin" brandHref="/admin" />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar
          navItems={adminNavItems}
          brandLabel="RevNetwork Admin"
          notifications={notifications}
          notificationsHref="/admin"
          profileHref="/admin/settings"
          settingsHref="/admin/settings"
          user={{ name: user.name ?? "", email: user.email ?? "", image: user.image }}
        />
        <main className="flex-1 space-y-6 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
