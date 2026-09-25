import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSessionExpiry } from "@/features/auth/use-session-expiry";
import { isSignedIn } from "@/stores/session-store";

/** Every page behind the sign-in: the sidebar, the header, and the guard in front of them. */
export const Route = createFileRoute("/_app")({
  beforeLoad: ({ location }) => {
    if (isSignedIn()) return;
    throw redirect({ to: "/login", search: { redirect: location.href } });
  },
  component: AppLayout,
});

function AppLayout() {
  useSessionExpiry();

  return (
    <SidebarProvider defaultOpen={sidebarWasOpen()}>
      <AppSidebar />
      {/* `min-w-0` so a wide table scrolls inside its card instead of widening the page. */}
      <SidebarInset className="min-w-0">
        <SiteHeader />
        <div className="flex-1 p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

/** The sidebar notes in a cookie whether it was left open; read it back so a reload keeps it. */
function sidebarWasOpen() {
  return !document.cookie.split("; ").includes("sidebar_state=false");
}
