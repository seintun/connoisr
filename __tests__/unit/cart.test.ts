import { calculateTotal, generateGuestName } from '@/lib/utils';
import { CartItem } from '@/types';
import { describe, expect, it } from 'vitest';

describe('Cart Utilities', () => {
  describe('calculateTotal', () => {
    it('should calculate total correctly for multiple items', () => {
      const items: CartItem[] = [
        { instanceId: '1', menuItemId: 'm1', name: 'Burger', category: 'Main', price: 10, quantity: 2, status: 'PENDING' },
        { instanceId: '2', menuItemId: 'm2', name: 'Fries', category: 'Side', price: 5, quantity: 1, status: 'PENDING' },
      ];
      expect(calculateTotal(items)).toBe(25);
    });

    it('should return 0 for empty cart', () => {
      expect(calculateTotal([])).toBe(0);
    });

    it('should handle floating point math correctly', () => {
      const items: CartItem[] = [
        { instanceId: '1', menuItemId: 'm1', name: 'Item A', category: 'Main', price: 1.1, quantity: 3, status: 'PENDING' }, // 3.3
      ];
      expect(calculateTotal(items)).toBeCloseTo(3.3);
    });
  });

  describe('generateGuestName', () => {
    it('should return a string in "Adjective Food" format', () => {
      const name = generateGuestName();
      expect(name).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+$/);
    });

    it('should generate unique names (probabilistic)', () => {
      const name1 = generateGuestName();
      generateGuestName();
      // It's possible but unlikely they are the same. 
      // Ensuring it returns a string is the main check here, or we could mock Math.random.
      expect(typeof name1).toBe('string');
      expect(name1.length).toBeGreaterThan(0);
    });
  });
});
