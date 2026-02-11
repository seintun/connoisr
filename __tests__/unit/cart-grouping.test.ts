import {
  areCartItemsEquivalent,
  buildCartItemIdentityKey,
  groupCartItems,
  groupItemsByUser,
} from '@/features/cart/domain/grouping';
import { describe, expect, it } from 'vitest';
import { buildCartItem } from '@/__tests__/fixtures/builders';

describe('cart grouping domain helpers', () => {
  it('builds stable identity keys regardless of option key order', () => {
    const a = buildCartItem({
      menuItemId: 'item-1',
      options: { spiciness: 'Hot', note: 'No onions' },
      orderedByName: 'Alex',
      isCustomized: true,
    });
    const b = buildCartItem({
      menuItemId: 'item-1',
      options: { note: 'No onions', spiciness: 'Hot' },
      orderedByName: 'Alex',
      isCustomized: true,
    });

    expect(buildCartItemIdentityKey(a)).toBe(buildCartItemIdentityKey(b));
  });

  it('groups identical items and separates customizations', () => {
    const items = [
      buildCartItem({
        menuItemId: 'item-1',
        name: 'Avocado Toast',
        options: { spiciness: 'Hot' },
        orderedByName: 'Alex',
        isCustomized: true,
      }),
      buildCartItem({
        menuItemId: 'item-1',
        name: 'Avocado Toast',
        options: { spiciness: 'Hot' },
        orderedByName: 'Alex',
        isCustomized: true,
      }),
      buildCartItem({
        menuItemId: 'item-1',
        name: 'Avocado Toast',
        options: { spiciness: 'Mild' },
        orderedByName: 'Alex',
        isCustomized: true,
      }),
    ];

    const groups = groupCartItems(items);
    expect(groups).toHaveLength(2);
    expect(groups.map((group) => group.count).sort((a, b) => b - a)).toEqual([2, 1]);
  });

  it('groups derived groups by user label', () => {
    const groups = groupCartItems([
      buildCartItem({ orderedByName: 'Alex', menuItemId: 'i1' }),
      buildCartItem({ orderedByName: 'Alex', menuItemId: 'i2' }),
      buildCartItem({ orderedByName: 'Sam', menuItemId: 'i3' }),
    ]);

    const byUser = groupItemsByUser(groups);
    expect(byUser).toHaveLength(2);
    expect(byUser.find((group) => group.key === 'Alex')?.totalQuantity).toBe(2);
    expect(byUser.find((group) => group.key === 'Sam')?.totalQuantity).toBe(1);
  });

  it('matches equivalent items with shared identity options', () => {
    const a = buildCartItem({
      menuItemId: 'item-9',
      orderedByName: 'Alex',
      options: { note: 'crispy' },
      status: 'PENDING',
    });
    const b = buildCartItem({
      menuItemId: 'item-9',
      orderedByName: 'Alex',
      options: { note: 'crispy' },
      status: 'SENT',
    });

    expect(areCartItemsEquivalent(a, b, { includeStatus: false })).toBe(true);
    expect(areCartItemsEquivalent(a, b, { includeStatus: true })).toBe(false);
  });
});
