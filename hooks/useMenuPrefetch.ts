'use client';

import { menuRepository } from '@/features/menu/repositories/menuRepository';
import { MENU_ITEMS } from '@/lib/menu';
import { useQuery } from '@tanstack/react-query';

/**
 * Prefetches menu data the moment the app mounts.
 * Since MENU_ITEMS is a static import, this simulates a network fetch
 * so the architecture is ready for a real API endpoint.
 *
 * Returns `isReady` — true once data is cached.
 */
export function useMenuPrefetch(tableId: string) {
  const { data, isSuccess } = useQuery({
    queryKey: ['menu', tableId],
    queryFn: () => menuRepository.getMenu(tableId),
    staleTime: 5 * 60 * 1000,
  });

  return {
    isReady: isSuccess && !!data,
    menuItems: data ?? MENU_ITEMS, // fallback to static import
  };
}
