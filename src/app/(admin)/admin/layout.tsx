import { requireRole } from "@/lib/rbac";
import { getUnreadNotifications } from "@/lib/data/notifications";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { adminNavSections } from "./nav-items";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("ADMIN");
  const notifications = await getUnreadNotifications(user.id);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        sections={adminNavSections}
        brandLabel="RevNetwork"
        brandHref="/admin"
        brandSuffix="Administration"
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar
          navSections={adminNavSections}
          brandLabel="RevNetwork Admin"
          notifications={notifications}
          notificationsHref="/admin"
          profileHref="/admin/settings"
          settingsHref="/admin/settings"
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
