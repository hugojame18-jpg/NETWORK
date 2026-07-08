import { requireRole } from "@/lib/rbac";
import { getUnreadNotifications } from "@/lib/data/notifications";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { advertiserNavItems } from "./nav-items";

export default async function AdvertiserDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADVERTISER");
  const notifications = await getUnreadNotifications(user.id);

  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar items={advertiserNavItems} brandLabel="RevNetwork" brandHref="/advertiser" />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar
          navItems={advertiserNavItems}
          brandLabel="RevNetwork"
          notifications={notifications}
          notificationsHref="/advertiser/notifications"
          profileHref="/advertiser/profile"
          settingsHref="/advertiser/settings"
          user={{ name: user.name ?? "", email: user.email ?? "", image: user.image }}
        />
        <main className="flex-1 space-y-6 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
