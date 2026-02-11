import type { CartItem, Order, TableSession } from '@/types';

type CartItemOverrides = Partial<CartItem>;
type OrderOverrides = Partial<Order> & { items?: CartItem[] };
type SessionOverrides = Partial<TableSession>;

let sequence = 0;

function nextId(prefix: string) {
  sequence += 1;
  return `${prefix}-${sequence}`;
}

export function buildCartItem(overrides: CartItemOverrides = {}): CartItem {
  const instanceId = overrides.instanceId ?? nextId('item');
  const menuItemId = overrides.menuItemId ?? 'menu-default';

  return {
    instanceId,
    menuItemId,
    name: overrides.name ?? 'Test Item',
    category: overrides.category ?? 'Main',
    price: overrides.price ?? 10,
    quantity: overrides.quantity ?? 1,
    status: overrides.status ?? 'PENDING',
    notes: overrides.notes,
    options: overrides.options,
    isCustomized: overrides.isCustomized,
    tags: overrides.tags,
    orderedByName: overrides.orderedByName,
  };
}

export function buildOrder(overrides: OrderOverrides = {}): Order {
  const items = overrides.items ?? [buildCartItem({ status: 'SENT' })];

  return {
    id: overrides.id ?? nextId('order'),
    tableId: overrides.tableId ?? '1',
    items,
    status: overrides.status ?? 'ordered',
    createdAt: overrides.createdAt ?? Date.now(),
    total: overrides.total ?? items.reduce((sum, item) => sum + item.price, 0),
  };
}

export function buildSession(overrides: SessionOverrides = {}): TableSession {
  return {
    tableId: overrides.tableId ?? '1',
    guestName: overrides.guestName,
    cart: overrides.cart ?? [],
    orders: overrides.orders ?? [],
    status: overrides.status ?? 'ordering',
  };
}
