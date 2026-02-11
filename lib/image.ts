export function optimizeUnsplashUrl(
  url: string,
  { width = 640, quality = 60 }: { width?: number; quality?: number } = {},
): string {
  if (!url.includes('images.unsplash.com')) return url;

  try {
    const parsed = new URL(url);
    parsed.searchParams.set('auto', 'format');
    parsed.searchParams.set('fit', 'crop');
    parsed.searchParams.set('w', String(width));
    parsed.searchParams.set('q', String(quality));
    return parsed.toString();
  } catch {
    return url;
  }
}

export function shouldAvoidImagePrefetch(): boolean {
  if (typeof navigator === 'undefined') return false;

  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  };

  const saveData = Boolean(nav.connection?.saveData);
  const effectiveType = nav.connection?.effectiveType ?? '';
  const isSlowConnection = effectiveType === 'slow-2g' || effectiveType === '2g';

  return saveData || isSlowConnection;
}
