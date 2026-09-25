import createFetchClient, { type Middleware } from "openapi-fetch";
import createClient from "openapi-react-query";
import { env } from "@/lib/env";
import { activeToken, expireSession } from "@/stores/session-store";
import { NetworkError } from "./errors";
import type { PendingPaths } from "./pending";
import type { paths } from "./schema";

/**
 * Typed calls to the GlobaGRID API. Paths, params and payloads come from
 * `schema.d.ts`, generated from the API's Swagger — run `pnpm api:types` again
 * whenever the backend changes. `PendingPaths` covers what the admin needs
 * before the Swagger has it.
 */
export const fetchClient = createFetchClient<paths & PendingPaths>({
  baseUrl: env.VITE_API_URL,
});

const session: Middleware = {
  onRequest({ request }) {
    const token = activeToken();
    if (token) request.headers.set("Authorization", `Bearer ${token}`);
    return request;
  },
  onResponse({ response }) {
    // The API refused the token — expired or revoked — so the session is over.
    if (response.status === 401) expireSession();
    return response;
  },
  onError({ error }) {
    // A cancelled query is not a failure; TanStack Query needs to see it as it is.
    if (error instanceof DOMException && error.name === "AbortError") return;
    return new NetworkError({ cause: error });
  },
};

fetchClient.use(session);

/** TanStack Query over the same client: `$api.useQuery("get", "/api/rfqs", { params })`. */
export const $api = createClient(fetchClient);
