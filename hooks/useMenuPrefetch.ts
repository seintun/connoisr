'use client';

import { menuRepository } from '@/features/menu/repositories/menuRepository';
import { MENU_ITEMS } from '@/lib/menu';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

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

  const warmedTablesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isSuccess || !data || typeof window === 'undefined') return;
    if (!navigator.onLine) return;
    if (warmedTablesRef.current.has(tableId)) return;

    const preloadTargets = data
      .map((item) => item.imageUrl)
      .filter((url): url is string => Boolean(url))
      .flatMap((url) => [url, `/_next/image?url=${encodeURIComponent(url)}&w=1200&q=75`]);

    preloadTargets.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    warmedTablesRef.current.add(tableId);
  }, [data, isSuccess, tableId]);

  return {
    isReady: isSuccess && !!data,
    menuItems: data ?? MENU_ITEMS, // fallback to static import
  };
}
