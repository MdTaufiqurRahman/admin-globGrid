import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useDocumentTitle } from "@/hooks/use-document-title";

type RouterContext = {
  /** For loaders: `context.queryClient.ensureQueryData($api.queryOptions(...))`. */
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster position="top-right" />
      {/* Both devtools render nothing in a production build. Kept off the left edge, where
          the sidebar's account menu sits. */}
      <ReactQueryDevtools buttonPosition="bottom-right" />
      <TanStackRouterDevtools position="top-right" />
    </>
  );
}

function NotFound() {
  useDocumentTitle("Page not found");

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="font-heading text-5xl font-extrabold text-primary">404</p>
      <p className="text-muted-foreground">There is no such page in the admin panel.</p>
      <Button asChild variant="outline" className="mt-2">
        <Link to="/">Back to the dashboard</Link>
      </Button>
    </main>
  );
}
