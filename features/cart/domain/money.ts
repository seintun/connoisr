import type { CartItem, Order } from '@/types';

export function computeSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

export function computeOrdersSubtotal(orders: Order[]): number {
  return orders.reduce((sum, order) => sum + order.total, 0);
}

export function computeTax(amount: number, rate = 0.08): number {
  return amount * rate;
}

export function computeGrandTotal(amount: number, rate = 0.08): number {
  return amount + computeTax(amount, rate);
}

export function formatCurrency(amount: number, locale = 'en-US'): string {
  return amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
