import type { CartItem } from '@/types';

export interface GroupedCartItem {
  key: string;
  item: CartItem;
  count: number;
  instances: CartItem[];
}

export interface UserGroupedCartItems {
  key: string;
  label: string;
  groups: GroupedCartItem[];
  totalQuantity: number;
}

interface IdentityOptions {
  includeOrderedByName?: boolean;
  includeCustomization?: boolean;
  includeNotes?: boolean;
  includeStatus?: boolean;
}

const DEFAULT_IDENTITY_OPTIONS: Required<IdentityOptions> = {
  includeOrderedByName: true,
  includeCustomization: true,
  includeNotes: true,
  includeStatus: false,
};

function normalizeText(value: string | undefined): string {
  return value?.trim() ?? '';
}

function normalizeOptions(options: CartItem['options']): string {
  if (!options) return '';
  const keys = Object.keys(options).sort();
  return keys.map((key) => `${key}:${options[key] ?? ''}`).join('|');
}

export function buildCartItemIdentityKey(
  item: CartItem,
  options: IdentityOptions = DEFAULT_IDENTITY_OPTIONS,
): string {
  const config = { ...DEFAULT_IDENTITY_OPTIONS, ...options };

  const parts = [item.menuItemId, normalizeOptions(item.options)];

  if (config.includeNotes) {
    parts.push(normalizeText(item.notes));
  }

  if (config.includeOrderedByName) {
    parts.push(normalizeText(item.orderedByName));
  }

  if (config.includeCustomization) {
    parts.push(item.isCustomized ? 'custom' : 'standard');
  }

  if (config.includeStatus) {
    parts.push(item.status);
  }

  return parts.join('::');
}

export function areCartItemsEquivalent(
  a: CartItem,
  b: CartItem,
  options: IdentityOptions = DEFAULT_IDENTITY_OPTIONS,
): boolean {
  return buildCartItemIdentityKey(a, options) === buildCartItemIdentityKey(b, options);
}

export function groupCartItems(
  items: CartItem[],
  options: IdentityOptions = DEFAULT_IDENTITY_OPTIONS,
): GroupedCartItem[] {
  const groups = new Map<string, GroupedCartItem>();

  items.forEach((item) => {
    const key = buildCartItemIdentityKey(item, options);
    const existing = groups.get(key);

    if (existing) {
      existing.count += 1;
      existing.instances.push(item);
      return;
    }

    groups.set(key, { key, item, count: 1, instances: [item] });
  });

  return Array.from(groups.values());
}

export function groupItemsByUser(groups: GroupedCartItem[]): UserGroupedCartItems[] {
  const byUser = new Map<string, UserGroupedCartItems>();

  groups.forEach((group) => {
    const rawName = normalizeText(group.item.orderedByName);
    const key = rawName || '__unassigned__';
    const label = rawName || 'Unassigned';

    const existing = byUser.get(key);
    if (existing) {
      existing.groups.push(group);
      existing.totalQuantity += group.count;
    } else {
      byUser.set(key, {
        key,
        label,
        groups: [group],
        totalQuantity: group.count,
      });
    }
  });

  return Array.from(byUser.values());
}
