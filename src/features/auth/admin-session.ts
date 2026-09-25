import type { components } from "@/lib/api/schema";
import type { AdminRole, Session } from "@/stores/session-store";

type LoginResponse = components["schemas"]["LoginResponse"];

const adminRoles: readonly string[] = ["ADMIN", "SUPER_ADMIN"] satisfies AdminRole[];

function isAdminRole(role: string): role is AdminRole {
  return adminRoles.includes(role);
}

/**
 * The session a login opens here, or null when the account may not use the
 * admin panel. `/api/auth/login` signs in every account, customers included,
 * so only an `ADMIN` or `SUPER_ADMIN` is let through.
 */
export function adminSessionOf(response: LoginResponse): Session | null {
  const roles = (response.roles ?? []).filter(isAdminRole);
  if (!response.token || !response.id || roles.length === 0) return null;

  const email = response.email ?? "";
  const name = [response.firstName, response.lastName].filter(Boolean).join(" ") || email;
  return { token: response.token, admin: { id: response.id, name, email, roles } };
}
