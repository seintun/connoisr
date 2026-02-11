import type { CartItem } from '@/types';

export type KDSModifierTone = 'danger' | 'warn' | 'info' | 'neutral';

export interface KDSModifierToken {
  id: string;
  label: string;
  value: string;
  tone: KDSModifierTone;
}

function normalize(value: string | undefined): string {
  return value?.trim() ?? '';
}

function buildToken(
  id: string,
  label: string,
  value: string,
  tone: KDSModifierTone,
): KDSModifierToken {
  return {
    id,
    label,
    value,
    tone,
  };
}

function humanizeKey(key: string): string {
  return key.replace(/[_-]/g, ' ').trim().toUpperCase();
}

export function getKitchenNote(item: CartItem): string | null {
  const note = normalize(item.options?.note ?? item.notes);
  return note.length > 0 ? note : null;
}

export function getModifierTokens(item: CartItem): KDSModifierToken[] {
  const options = item.options ?? {};
  const tokens: KDSModifierToken[] = [];

  const removals = normalize(options.removals);
  if (removals) {
    tokens.push(buildToken('removals', 'NO', removals.toUpperCase(), 'danger'));
  }

  const spiciness = normalize(options.spiciness);
  if (spiciness) {
    tokens.push(buildToken('spiciness', 'HEAT', spiciness, 'warn'));
  }

  const sweetness = normalize(options.sweetness);
  if (sweetness) {
    tokens.push(buildToken('sweetness', 'SWEET', sweetness, 'warn'));
  }

  const allergens = normalize(options.allergens);
  if (allergens) {
    tokens.push(buildToken('allergens', 'ALLERGEN', allergens, 'info'));
  }

  for (const [key, rawValue] of Object.entries(options)) {
    if (
      key === 'note' ||
      key === 'removals' ||
      key === 'spiciness' ||
      key === 'sweetness' ||
      key === 'allergens'
    ) {
      continue;
    }

    const value = normalize(rawValue);
    if (!value) {
      continue;
    }

    tokens.push(buildToken(key, humanizeKey(key), value, 'neutral'));
  }

  if (item.isCustomized && tokens.length === 0 && !getKitchenNote(item)) {
    tokens.push(buildToken('custom', 'CUSTOM', 'Modified', 'warn'));
  }

  return tokens;
}

export function hasItemModifiers(item: CartItem): boolean {
  return (
    item.isCustomized === true ||
    getModifierTokens(item).length > 0 ||
    getKitchenNote(item) !== null
  );
}
