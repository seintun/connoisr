import { createInitialSession, sessionReducer } from '@/features/session/domain/sessionReducer';
import { describe, expect, it } from 'vitest';

describe('sessionReducer', () => {
  it('creates default initial session', () => {
    const session = createInitialSession('t-1');
    expect(session.tableId).toBe('t-1');
    expect(session.cart).toEqual([]);
    expect(session.orders).toEqual([]);
    expect(session.status).toBe('browsing');
  });

  it('adds quantity as exploded instance items', () => {
    const base = createInitialSession('1');
    const state = sessionReducer(base, {
      type: 'ADD_ITEM',
      payload: {
        menuItemId: 'item-1',
        name: 'Burger',
        category: 'Main',
        price: 10,
        quantity: 3,
      },
    });

    expect(state?.cart).toHaveLength(3);
    expect(state?.cart.every((item) => item.quantity === 1)).toBe(true);
  });

  it('updates grouped quantity by equivalent identity', () => {
    const seeded = sessionReducer(createInitialSession('1'), {
      type: 'ADD_ITEM',
      payload: {
        menuItemId: 'item-1',
        name: 'Burger',
        category: 'Main',
        price: 10,
        quantity: 2,
      },
    });
    const firstItemId = seeded?.cart[0]?.instanceId;
    if (!seeded || !firstItemId) throw new Error('setup failed');

    const updated = sessionReducer(seeded, {
      type: 'UPDATE_QUANTITY',
      payload: { itemId: firstItemId, quantity: 4 },
    });

    expect(updated?.cart).toHaveLength(4);
  });
});
