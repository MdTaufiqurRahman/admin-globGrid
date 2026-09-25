import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { secondsLeft } from "@/lib/jwt";

/** The roles that open the admin panel. A plain `USER` signs in on the storefront only. */
export type AdminRole = "ADMIN" | "SUPER_ADMIN";

export type Admin = { id: string; name: string; email: string; roles: AdminRole[] };

export type Session = { token: string; admin: Admin };

type SessionState = {
  token: string | null;
  admin: Admin | null;
  signIn: (session: Session) => void;
  signOut: () => void;
};

const STORAGE_KEY = "gg-admin-session";

/**
 * The signed-in admin's session. The API hands the JWT back in the response
 * body, not as a cookie, so the page has to keep it — in localStorage, so a
 * reload or a second tab stays signed in.
 */
export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      signIn: ({ token, admin }) => set({ token, admin }),
      signOut: () => set({ token: null, admin: null }),
    }),
    { name: STORAGE_KEY },
  ),
);

/** The token to send, if one is held and has not run out. */
export function activeToken() {
  const { token } = useSession.getState();
  return token && secondsLeft(token) !== 0 ? token : null;
}

export function isSignedIn() {
  return activeToken() !== null;
}

/**
 * Ends a session the admin did not end themselves (the token ran out, or the
 * API refused it) and says so. Several requests failing together make one toast.
 */
export function expireSession() {
  if (!useSession.getState().token) return;
  useSession.getState().signOut();
  toast.warning("Session expired", {
    id: "session-expired",
    description: "Sign in again to carry on.",
  });
}

// Signing in or out in another tab reaches this one as well.
window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY) void useSession.persist.rehydrate();
});
