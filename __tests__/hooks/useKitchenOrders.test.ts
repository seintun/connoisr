import { useKitchenOrders } from '@/hooks/useKitchenOrders';
import { SESSION_STORAGE_KEY } from '@/lib/constants';
import { buildOrder } from '@/__tests__/fixtures/builders';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((i: number) => Object.keys(store)[i] || null),
    get length() {
      return Object.keys(store).length;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useKitchenOrders', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockOrder = buildOrder({
    id: 'o1',
    tableId: 't1',
    items: [],
    status: 'ordered',
    createdAt: Date.now(),
    total: 10,
  });

  const setupStorage = (orders: ReturnType<typeof buildOrder>[]) => {
    const session = { tableId: 't1', orders };
    localStorageMock.setItem(SESSION_STORAGE_KEY('t1'), JSON.stringify(session));
  };

  it('syncs orders from localStorage initially', () => {
    setupStorage([mockOrder]);
    const { result } = renderHook(() => useKitchenOrders());

    expect(result.current.orders).toHaveLength(1);
    expect(result.current.orders[0].id).toBe('o1');
  });

  it('updates status of an order', () => {
    setupStorage([mockOrder]);
    const { result } = renderHook(() => useKitchenOrders());

    act(() => {
      result.current.updateOrderStatus('o1', 'cooking');
    });

    const stored = JSON.parse(localStorageMock.getItem(SESSION_STORAGE_KEY('t1'))!);
    expect(stored.orders[0].status).toBe('cooking');

    // Should also update local state
    expect(result.current.orders[0].status).toBe('cooking');
  });

  it('syncs on storage event changes', () => {
    const listeners: Array<(event: Event) => void> = [];
    const addEventListenerSpy = vi
      .spyOn(window, 'addEventListener')
      .mockImplementation((type, listener) => {
        if (type === 'storage') {
          listeners.push(listener as (event: Event) => void);
        }
      });
    const removeEventListenerSpy = vi
      .spyOn(window, 'removeEventListener')
      .mockImplementation(() => {});

    setupStorage([]);
    const { result } = renderHook(() => useKitchenOrders());
    expect(result.current.orders).toHaveLength(0);

    // Simulate external update
    setupStorage([mockOrder]);

    act(() => {
      listeners[0](new StorageEvent('storage', { key: SESSION_STORAGE_KEY('t1') }));
    });

    expect(result.current.orders).toHaveLength(1);
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});
