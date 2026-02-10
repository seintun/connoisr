"use client";

import { MENU_ITEMS } from "@/lib/menu";
import { useQuery } from "@tanstack/react-query";

/**
 * Prefetches menu data the moment the app mounts.
 * Since MENU_ITEMS is a static import, this simulates a network fetch
 * so the architecture is ready for a real API endpoint.
 *
 * Returns `isReady` — true once data is cached.
 */
export function useMenuPrefetch(tableId: string) {
  const { data, isSuccess } = useQuery({
    queryKey: ["menu", tableId],
    queryFn: async () => {
      // Simulate network latency for realistic prefetch behavior.
      // Replace with `fetch('/api/menu?table=${tableId}')` when backend is ready.
      await new Promise((resolve) => setTimeout(resolve, 200));
      return MENU_ITEMS;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    isReady: isSuccess && !!data,
    menuItems: data ?? MENU_ITEMS, // fallback to static import
  };
}
