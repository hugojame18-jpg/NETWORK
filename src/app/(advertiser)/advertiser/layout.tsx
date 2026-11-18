import { requireRole } from "@/lib/rbac";
import { getUnreadNotifications } from "@/lib/data/notifications";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { advertiserNavSections } from "./nav-items";

export default async function AdvertiserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("ADVERTISER");
  const notifications = await getUnreadNotifications(user.id);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        sections={advertiserNavSections}
        brandLabel="RevNetwork"
        brandHref="/advertiser"
        brandSuffix="Espace annonceur"
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar
          navSections={advertiserNavSections}
          brandLabel="RevNetwork"
          notifications={notifications}
          notificationsHref="/advertiser/notifications"
          profileHref="/advertiser/profile"
          settingsHref="/advertiser/settings"
          user={{
            name: user.name ?? "",
            email: user.email ?? "",
            image: user.image,
          }}
        />
        <main className="flex-1">
          {/* Capped width: a table stretched across a 27-inch screen is
              unreadable, and the whitespace is what makes it feel composed. */}
          <div className="mx-auto w-full max-w-[1360px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
