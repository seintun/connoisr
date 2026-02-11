import { optimizeUnsplashUrl, shouldAvoidImagePrefetch } from '@/lib/image';
import { describe, expect, it } from 'vitest';

describe('image utils', () => {
  it('optimizes unsplash URLs with target width and quality', () => {
    const url =
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800';
    const optimized = optimizeUnsplashUrl(url, { width: 540, quality: 55 });

    expect(optimized).toContain('w=540');
    expect(optimized).toContain('q=55');
  });

  it('returns non-unsplash URLs unchanged', () => {
    const url = 'https://example.com/image.jpg';
    expect(optimizeUnsplashUrl(url, { width: 540, quality: 55 })).toBe(url);
  });

  it('detects data saver/slow network preference', () => {
    const originalNavigator = global.navigator;
    Object.defineProperty(global, 'navigator', {
      value: {
        connection: { saveData: true, effectiveType: '4g' },
      },
      configurable: true,
    });

    expect(shouldAvoidImagePrefetch()).toBe(true);

    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      configurable: true,
    });
  });
});
