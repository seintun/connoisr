import { menuRepository } from '@/features/menu/repositories/menuRepository';
import { describe, expect, it } from 'vitest';

describe('menuRepository', () => {
  it('returns menu items for a table', async () => {
    const items = await menuRepository.getMenu('1');
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).toHaveProperty('id');
    expect(items[0]).toHaveProperty('name');
  });
});
