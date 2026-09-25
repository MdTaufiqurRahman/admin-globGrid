import { createRouter } from "@tanstack/react-router";
import { queryClient } from "@/lib/query-client";
import { useSession } from "@/stores/session-store";
import { routeTree } from "./routeTree.gen";

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  // TanStack Query caches whatever a loader fetches, so the router keeps no copy of its own.
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }

  interface StaticDataRouteOption {
    /** The page's name, shown in the header and the browser tab. */
    title?: string;
  }
}

// However the session ends — a 401, the token running out, signing out — the
// route guards run again and send the admin to sign in.
useSession.subscribe((state, previous) => {
  if (previous.token && !state.token) void router.invalidate();
});
