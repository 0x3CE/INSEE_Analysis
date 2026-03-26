"use client";

import { QueryClient } from "@tanstack/react-query";

// Singleton — shared across the app via ReactQueryProvider
let queryClientInstance: QueryClient | undefined;

export function getQueryClient() {
  if (!queryClientInstance) {
    queryClientInstance = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 30, // 30 min — public stats don't change often
          gcTime: 1000 * 60 * 60,    // Keep cache 1h
          retry: 2,
          refetchOnWindowFocus: false,
        },
      },
    });
  }
  return queryClientInstance;
}
