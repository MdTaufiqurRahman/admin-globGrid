import { useEffect } from "react";
import { secondsLeft } from "@/lib/jwt";
import { expireSession, useSession } from "@/stores/session-store";

/** The longest delay `setTimeout` keeps (about 24.8 days); a longer one fires at once. */
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

/**
 * Ends the session the moment its token runs out, so an admin who left the tab
 * open is sent to sign in instead of meeting a page of failed requests.
 */
export function useSessionExpiry() {
  const token = useSession((state) => state.token);

  useEffect(() => {
    if (!token) return;
    const seconds = secondsLeft(token);
    // No `exp`, or one too far off to time: the route guard and the API's 401 cover it.
    if (seconds === null || seconds * 1000 > MAX_TIMEOUT_MS) return;
    const timer = window.setTimeout(expireSession, seconds * 1000);
    return () => window.clearTimeout(timer);
  }, [token]);
}
