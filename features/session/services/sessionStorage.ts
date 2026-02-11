import { SESSION_STORAGE_KEY, STORAGE_PREFIX } from '@/lib/constants';
import type { Order, TableSession } from '@/types';

export function readSession(tableId: string): TableSession | null {
  if (typeof window === 'undefined') return null;
  const key = SESSION_STORAGE_KEY(tableId);
  const saved = localStorage.getItem(key);
  if (!saved) return null;
  const parsed = JSON.parse(saved) as TableSession;
  return parsed.tableId === tableId ? parsed : null;
}

export function writeSession(session: TableSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_STORAGE_KEY(session.tableId), JSON.stringify(session));
}

export function collectOrdersFromStorage(): Order[] {
  if (typeof window === 'undefined') return [];
  const allOrders: Order[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(`${STORAGE_PREFIX}-session-`)) continue;

      const sessionStr = localStorage.getItem(key);
      if (!sessionStr) continue;

      const session = JSON.parse(sessionStr) as TableSession;
      if (Array.isArray(session.orders)) {
        allOrders.push(...session.orders);
      }
    }
  } catch {
    return [];
  }

  return allOrders;
}

export function updateOrderStatusInStorage(
  orderId: string,
  status: Order['status'],
): string | null {
  if (typeof window === 'undefined') return null;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(`${STORAGE_PREFIX}-session-`)) continue;

      const sessionStr = localStorage.getItem(key);
      if (!sessionStr) continue;

      const session = JSON.parse(sessionStr) as TableSession;
      if (!Array.isArray(session.orders)) continue;

      const orderIndex = session.orders.findIndex((order) => order.id === orderId);
      if (orderIndex < 0) continue;

      session.orders[orderIndex].status = status;
      localStorage.setItem(key, JSON.stringify(session));
      return session.tableId;
    }
  } catch {
    return null;
  }

  return null;
}
