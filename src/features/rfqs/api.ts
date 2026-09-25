import type { QueryClient } from "@tanstack/react-query";
import { $api } from "@/lib/api/client";

/**
 * The RFQ as `GET /api/rfqs/{id}` has it: the only place its photos come
 * from. The table's picture, the details panel and the dialogs all read it
 * under the same key, so each RFQ is fetched once.
 */
export function useRfqDetail(id: string | undefined) {
  return $api.useQuery(
    "get",
    "/api/rfqs/{id}",
    { params: { path: { id: id ?? "" } } },
    { enabled: Boolean(id) },
  );
}

/**
 * After an RFQ changes: the list pages under `/api/rfqs`, and every RFQ
 * fetched on its own by id (their photos and the details panel).
 */
export function refreshRfqs(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["get", "/api/rfqs"] }),
    queryClient.invalidateQueries({ queryKey: ["get", "/api/rfqs/{id}"] }),
  ]);
}
