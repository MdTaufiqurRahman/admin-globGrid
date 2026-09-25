import { QueryClient } from "@tanstack/react-query";
import { statusOf } from "@/lib/api/problems";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // A 4xx is the request's own fault; asking again gets the same answer.
        const status = statusOf(error);
        if (status !== undefined && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
