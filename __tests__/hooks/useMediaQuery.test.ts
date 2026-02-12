import { useMediaQuery } from '@/hooks/useMediaQuery';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('useMediaQuery', () => {
  let listeners: Array<() => void> = [];
  let matches = false;

  beforeEach(() => {
    listeners = [];
    matches = false;

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: (query: string) => {
        const mediaQueryList: MediaQueryList = {
          matches,
          media: query,
          onchange: null,
          addEventListener: (_event: string, listener: EventListenerOrEventListenerObject) => {
            listeners.push(listener as () => void);
          },
          removeEventListener: (_event: string, listener: EventListenerOrEventListenerObject) => {
            listeners = listeners.filter((entry) => entry !== listener);
          },
          addListener: (listener) => {
            listeners.push(listener as () => void);
          },
          removeListener: (listener) => {
            listeners = listeners.filter((entry) => entry !== listener);
          },
          dispatchEvent: () => true,
        };

        Object.defineProperty(mediaQueryList, 'matches', {
          get: () => matches,
        });

        return mediaQueryList;
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns current match state and updates on change', () => {
    matches = false;
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(false);

    act(() => {
      matches = true;
      listeners.forEach((listener) => listener());
    });

    expect(result.current).toBe(true);
  });
});
