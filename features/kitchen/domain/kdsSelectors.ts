import { groupCartItems } from '@/features/cart/domain/grouping';
import {
  getKitchenNote,
  getModifierTokens,
  hasItemModifiers,
  type KDSModifierToken,
} from '@/features/kitchen/domain/kdsModifiers';
import {
  KDS_PRIORITY_RANK,
  compareKDSOrders,
  getOrderTiming,
  getPriorityBucket,
  type KDSPriorityBucket,
} from '@/features/kitchen/domain/kdsPrioritization';
import type { CartItem, Order } from '@/types';

export interface KDSGroupedItemViewModel {
  key: string;
  count: number;
  name: string;
  orderedByName?: string;
  item: CartItem;
  isModified: boolean;
  modifierTokens: KDSModifierToken[];
  kitchenNote: string | null;
}

export interface KDSOrderViewModel {
  order: Order;
  groupedItems: KDSGroupedItemViewModel[];
  isModified: boolean;
  elapsedSeconds: number;
  elapsedMinutes: number;
  isNew: boolean;
  isWarning: boolean;
  isOverdue: boolean;
  priorityBucket: KDSPriorityBucket;
  priorityRank: number;
}

function isActiveOrder(order: Order): boolean {
  return order.status !== 'paid' && order.status !== 'served';
}

export function buildKDSGroupedItems(items: CartItem[]): KDSGroupedItemViewModel[] {
  return groupCartItems(items)
    .map((group) => {
      const modifierTokens = getModifierTokens(group.item);
      return {
        key: group.key,
        count: group.count,
        name: group.item.name,
        orderedByName: group.item.orderedByName,
        item: group.item,
        isModified: hasItemModifiers(group.item),
        modifierTokens,
        kitchenNote: getKitchenNote(group.item),
      };
    })
    .sort((a, b) => {
      if (a.isModified !== b.isModified) {
        return a.isModified ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
}

export function buildKDSOrderViewModels(orders: Order[], now: number): KDSOrderViewModel[] {
  return orders
    .filter(isActiveOrder)
    .map((order) => {
      const groupedItems = buildKDSGroupedItems(order.items);
      const isModified = groupedItems.some((group) => group.isModified);
      const timing = getOrderTiming(order.createdAt, order.status, now);
      const priorityBucket = getPriorityBucket(order, isModified, timing);

      return {
        order,
        groupedItems,
        isModified,
        elapsedSeconds: timing.elapsedSeconds,
        elapsedMinutes: timing.elapsedMinutes,
        isNew: timing.isNew,
        isWarning: timing.isWarning,
        isOverdue: timing.isOverdue,
        priorityBucket,
        priorityRank: KDS_PRIORITY_RANK[priorityBucket],
      };
    })
    .sort(compareKDSOrders);
}
