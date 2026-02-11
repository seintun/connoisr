'use client';

import { menuRepository } from '@/features/menu/repositories/menuRepository';
import { optimizeUnsplashUrl, shouldAvoidImagePrefetch } from '@/lib/image';
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
    if (shouldAvoidImagePrefetch()) return;
    if (warmedTablesRef.current.has(tableId)) return;

    const preloadTargets = data
      .slice(0, 8)
      .map((item) => item.imageUrl)
      .filter((url): url is string => Boolean(url))
      .map(
        (url) =>
          `/_next/image?url=${encodeURIComponent(
            optimizeUnsplashUrl(url, { width: 640, quality: 55 }),
          )}&w=640&q=55`,
      );

    const warm = () => {
      preloadTargets.forEach((src) => {
        const img = new Image();
        img.decoding = 'async';
        img.loading = 'eager';
        img.src = src;
      });
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(warm);
    } else {
      setTimeout(warm, 0);
    }

    warmedTablesRef.current.add(tableId);
  }, [data, isSuccess, tableId]);

  return {
    isReady: isSuccess && !!data,
    menuItems: data ?? MENU_ITEMS, // fallback to static import
  };
}
