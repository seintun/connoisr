import { calculateTotal } from '@/lib/utils';
import type { CartItem, Order, TableSession } from '@/types';
import { areCartItemsEquivalent } from '@/features/cart/domain/grouping';

export type SessionAction =
  | { type: 'SET_SESSION'; payload: TableSession }
  | { type: 'SET_GUEST_NAME'; payload: string }
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'instanceId' | 'status'> & { quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SEND_ORDER' }
  | {
      type: 'UPDATE_ORDER_STATUS';
      payload: { orderId: string; status: Order['status'] };
    };

export function createInitialSession(tableId: string): TableSession {
  return { tableId, cart: [], orders: [], status: 'browsing' };
}

export function sessionReducer(
  state: TableSession | null,
  action: SessionAction,
): TableSession | null {
  if (action.type === 'SET_SESSION') return action.payload;
  if (!state) return null;
  if (action.type === 'SET_GUEST_NAME') {
    return { ...state, guestName: action.payload };
  }

  switch (action.type) {
    case 'ADD_ITEM': {
      const item = action.payload;
      const count = item.quantity || 1;
      const newInstances: CartItem[] = [];

      for (let i = 0; i < count; i++) {
        newInstances.push({
          ...item,
          instanceId: crypto.randomUUID(),
          quantity: 1,
          status: 'PENDING',
        });
      }

      return {
        ...state,
        cart: [...state.cart, ...newInstances],
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        cart: state.cart.filter((i) => i.instanceId !== action.payload.itemId),
      };
    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      const targetInstance = state.cart.find((i) => i.instanceId === itemId);
      if (!targetInstance) return state;

      const identicalInstances = state.cart.filter(
        (i) =>
          areCartItemsEquivalent(i, targetInstance, { includeStatus: false }) &&
          i.status === 'PENDING',
      );

      const currentCount = identicalInstances.length;
      const diff = quantity - currentCount;
      if (diff === 0) return state;

      let newCart = [...state.cart];

      if (diff > 0) {
        for (let i = 0; i < diff; i++) {
          newCart.push({
            ...targetInstance,
            instanceId: crypto.randomUUID(),
            quantity: 1,
            status: 'PENDING',
          });
        }
      } else {
        const toRemoveCount = Math.abs(diff);
        let removed = 0;
        newCart = newCart.filter((item) => {
          if (removed >= toRemoveCount) return true;

          const isMatch =
            areCartItemsEquivalent(item, targetInstance, { includeStatus: false }) &&
            item.status === 'PENDING';

          if (isMatch) {
            removed++;
            return false;
          }
          return true;
        });
      }

      return { ...state, cart: newCart };
    }
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'SEND_ORDER': {
      if (state.cart.length === 0) return state;

      const newOrder: Order = {
        id: crypto.randomUUID(),
        tableId: state.tableId,
        items: state.cart.map((i) => ({ ...i, status: 'SENT' })),
        status: 'ordered',
        createdAt: Date.now(),
        total: calculateTotal(state.cart),
      };

      return {
        ...state,
        orders: [...(state.orders || []), newOrder],
        cart: [],
        status: 'ordering',
      };
    }
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: (state.orders || []).map((o) =>
          o.id === action.payload.orderId ? { ...o, status: action.payload.status } : o,
        ),
      };
    default:
      return state;
  }
}
