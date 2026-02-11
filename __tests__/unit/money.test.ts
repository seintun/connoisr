import {
  computeGrandTotal,
  computeOrdersSubtotal,
  computeSubtotal,
  computeTax,
  formatCurrency,
} from '@/features/cart/domain/money';
import { describe, expect, it } from 'vitest';
import { buildCartItem, buildOrder } from '@/__tests__/fixtures/builders';

describe('money helpers', () => {
  it('computes cart subtotal from instance-based items', () => {
    const items = [
      buildCartItem({ price: 10 }),
      buildCartItem({ price: 12.5 }),
      buildCartItem({ price: 7.25 }),
    ];

    expect(computeSubtotal(items)).toBe(29.75);
  });

  it('computes order subtotal from order totals', () => {
    const orders = [buildOrder({ total: 18.5 }), buildOrder({ total: 7.25 })];
    expect(computeOrdersSubtotal(orders)).toBe(25.75);
  });

  it('computes tax and grand total using default rate', () => {
    expect(computeTax(100)).toBe(8);
    expect(computeGrandTotal(100)).toBe(108);
  });

  it('formats currency consistently', () => {
    expect(formatCurrency(108)).toBe('108.00');
    expect(formatCurrency(108.456)).toBe('108.46');
  });
});
