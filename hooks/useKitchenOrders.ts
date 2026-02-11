import { orderRepository } from '@/features/order/repositories/orderRepository';
import {
  notifySessionUpdated,
  subscribeToSessionUpdates,
} from '@/features/session/services/sessionSync';
import { Order } from '@/types';
import { useCallback, useEffect, useState } from 'react';

function buildOrdersSignature(orders: Order[]): string {
  return orders.map((order) => `${order.id}:${order.status}:${order.createdAt}`).join('|');
}

const INITIAL_LAST_SYNCED = Date.now();

export function useKitchenOrders() {
  const [orders, setOrders] = useState<Order[]>(() => orderRepository.listOrders());
  const [lastSynced, setLastSynced] = useState(INITIAL_LAST_SYNCED);

  const syncOrders = useCallback(() => {
    const allOrders = orderRepository.listOrders();

    setOrders((prev) => {
      if (buildOrdersSignature(prev) !== buildOrdersSignature(allOrders)) {
        return allOrders;
      }
      return prev;
    });
    setLastSynced(Date.now());
  }, []);

  const updateOrderStatus = useCallback(
    (orderId: string, status: Order['status']) => {
      const tableId = orderRepository.updateStatus(orderId, status);
      if (tableId) {
        notifySessionUpdated(tableId);
        syncOrders();
      }
    },
    [syncOrders],
  );

  useEffect(() => {
    const unsubscribe = subscribeToSessionUpdates(() => syncOrders());
    const pollInterval = setInterval(syncOrders, 15000);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [syncOrders]);

  return {
    orders,
    updateOrderStatus,
    lastSynced,
  };
}
