import { buildCartItem, buildOrder } from '@/__tests__/fixtures/builders';
import { buildKDSOrderViewModels } from '@/features/kitchen/domain/kdsSelectors';
import {
  NEW_ORDER_WINDOW_SECONDS,
  getOrderTiming,
} from '@/features/kitchen/domain/kdsPrioritization';
import { describe, expect, it } from 'vitest';

describe('kdsPrioritization', () => {
  const now = 1_700_000_000_000;

  it('marks new ordered tickets inside the new-ticket window', () => {
    const createdAt = now - (NEW_ORDER_WINDOW_SECONDS - 10) * 1000;
    const timing = getOrderTiming(createdAt, 'ordered', now);

    expect(timing.isNew).toBe(true);
    expect(timing.isOverdue).toBe(false);
  });

  it('prioritizes overdue before new, modified, normal, then ready', () => {
    const overdueCooking = buildOrder({
      id: 'overdue-cooking',
      status: 'cooking',
      createdAt: now - 15 * 60 * 1000,
    });
    const newOrdered = buildOrder({
      id: 'new-ordered',
      status: 'ordered',
      createdAt: now - 30 * 1000,
    });
    const modifiedOrdered = buildOrder({
      id: 'modified-ordered',
      status: 'ordered',
      createdAt: now - 4 * 60 * 1000,
      items: [
        buildCartItem({
          status: 'SENT',
          options: { note: 'no onion' },
          isCustomized: true,
        }),
      ],
    });
    const normalOrdered = buildOrder({
      id: 'normal-ordered',
      status: 'ordered',
      createdAt: now - 5 * 60 * 1000,
    });
    const readyOrder = buildOrder({
      id: 'ready-order',
      status: 'ready',
      createdAt: now - 20 * 60 * 1000,
    });

    const results = buildKDSOrderViewModels(
      [normalOrdered, readyOrder, modifiedOrdered, overdueCooking, newOrdered],
      now,
    );

    expect(results.map((entry) => entry.order.id)).toEqual([
      'overdue-cooking',
      'new-ordered',
      'modified-ordered',
      'normal-ordered',
      'ready-order',
    ]);
  });
});
