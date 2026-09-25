import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { fetchClient } from "@/lib/api/client";
import type { Category } from "./model";

/** The most the API hands out in one page. Its Swagger says 1000; the server turns down more than 100. */
const MAX_PAGE_SIZE = 100;

/**
 * Every category, for choosing a parent, fetched a page at a time. The key
 * sits under `["get", "/api/categories"]`, so invalidating the list after a
 * change refreshes this as well.
 */
export const allCategoriesQuery = queryOptions({
  queryKey: ["get", "/api/categories", "all"],
  queryFn: async ({ signal }) => {
    const categories: Category[] = [];
    for (let page = 1; ; page++) {
      const { data, error } = await fetchClient.GET("/api/categories", {
        params: { query: { page, size: MAX_PAGE_SIZE } },
        signal,
      });
      if (error) throw error;
      categories.push(...(data.content ?? []));
      if (data.last || page >= (data.totalPages ?? 0)) return categories;
    }
  },
});

/**
 * After a category changes: the list pages and the whole catalogue (both
 * under `/api/categories`), and any category fetched on its own by id.
 */
export function refreshCategories(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["get", "/api/categories"] }),
    queryClient.invalidateQueries({ queryKey: ["get", "/api/categories/{id}"] }),
  ]);
}
