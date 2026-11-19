import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { getUnreadNotifications } from "@/lib/data/notifications";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { ApplicationPending } from "@/components/dashboard/application-pending";
import { MobileTabBar } from "@/components/dashboard/mobile-tab-bar";
import { SUPPORT_TELEGRAM } from "@/lib/contact";
import { publisherNavSections, publisherTabs } from "./nav-items";

export default async function PublisherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <div className="flex min-h-screen bg-background">
      <Sidebar
        sections={publisherNavSections}
        brandLabel="RevNetwork"
        brandHref="/dashboard"
        brandSuffix="Espace affilié"
        supportHref={SUPPORT_TELEGRAM}
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar
          navSections={publisherNavSections}
          brandLabel="RevNetwork"
          notifications={notifications}
          notificationsHref="/dashboard/notifications"
          profileHref="/dashboard/profile"
          settingsHref="/dashboard/settings"
          user={{
            name: user.name ?? "",
            email: user.email ?? "",
            image: user.image,
          }}
        />
        <main className="flex-1">
          {/* Capped width: a table stretched across a 27-inch screen is
              unreadable, and the whitespace is what makes it feel composed. */}
          {/* Extra room at the bottom on phones, where the tab bar sits over
              the page and would otherwise cover its last row. */}
          <div className="mx-auto w-full max-w-[1280px] space-y-6 px-4 pt-6 pb-28 sm:px-6 lg:px-8 lg:pb-10">
            {children}
          </div>
        </main>
      </div>
      <MobileTabBar items={publisherTabs} />
    </div>
  );
}
