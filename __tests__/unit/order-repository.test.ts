import { describe, expect, it, vi } from 'vitest';
import { SESSION_STORAGE_KEY } from '@/lib/constants';
import { orderRepository } from '@/features/order/repositories/orderRepository';
import { buildOrder } from '@/__tests__/fixtures/builders';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
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

describe('orderRepository', () => {
  it('lists orders from local session storage', () => {
    localStorageMock.clear();
    const order = buildOrder({ id: 'o1', tableId: 't1', status: 'ordered' });
    localStorageMock.setItem(
      SESSION_STORAGE_KEY('t1'),
      JSON.stringify({ tableId: 't1', orders: [order] }),
    );

    const orders = orderRepository.listOrders();
    expect(orders).toHaveLength(1);
    expect(orders[0].id).toBe('o1');
  });

  it('updates status and returns table id', () => {
    localStorageMock.clear();
    const order = buildOrder({ id: 'o1', tableId: 't1', status: 'ordered' });
    localStorageMock.setItem(
      SESSION_STORAGE_KEY('t1'),
      JSON.stringify({ tableId: 't1', orders: [order] }),
    );

    const tableId = orderRepository.updateStatus('o1', 'ready');
    const session = JSON.parse(localStorageMock.getItem(SESSION_STORAGE_KEY('t1')) || '{}');

    expect(tableId).toBe('t1');
    expect(session.orders[0].status).toBe('ready');
  });
});
