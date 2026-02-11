import {
  updateOrderStatusInStorage,
  collectOrdersFromStorage,
} from '@/features/session/services/sessionStorage';
import type { Order } from '@/types';

export interface OrderRepository {
  listOrders(): Order[];
  updateStatus(orderId: string, status: Order['status']): string | null;
}

class LocalOrderRepository implements OrderRepository {
  listOrders(): Order[] {
    return collectOrdersFromStorage();
  }

  updateStatus(orderId: string, status: Order['status']): string | null {
    return updateOrderStatusInStorage(orderId, status);
  }
}

export const orderRepository: OrderRepository = new LocalOrderRepository();
