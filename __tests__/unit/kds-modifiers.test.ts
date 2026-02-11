import { buildCartItem } from '@/__tests__/fixtures/builders';
import {
  getKitchenNote,
  getModifierTokens,
  hasItemModifiers,
} from '@/features/kitchen/domain/kdsModifiers';
import { describe, expect, it } from 'vitest';

describe('kdsModifiers', () => {
  it('extracts kitchen note from options.note first', () => {
    const item = buildCartItem({ options: { note: 'extra crispy' }, notes: 'fallback' });

    expect(getKitchenNote(item)).toBe('extra crispy');
  });

  it('builds expected tokens for common options', () => {
    const item = buildCartItem({
      options: {
        removals: 'onions',
        spiciness: 'Hot',
        allergens: 'Dairy',
      },
      isCustomized: true,
    });

    const tokens = getModifierTokens(item);

    expect(tokens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'removals', label: 'NO', value: 'ONIONS' }),
        expect.objectContaining({ id: 'spiciness', label: 'HEAT', value: 'Hot' }),
        expect.objectContaining({ id: 'allergens', label: 'ALLERGEN', value: 'Dairy' }),
      ]),
    );
    expect(hasItemModifiers(item)).toBe(true);
  });

  it('adds a CUSTOM token when customized with no explicit options', () => {
    const item = buildCartItem({ isCustomized: true, options: {}, notes: undefined });
    const tokens = getModifierTokens(item);

    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toMatchObject({ id: 'custom', label: 'CUSTOM' });
  });
});
