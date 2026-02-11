import { groupCartItems } from '@/features/cart/domain/grouping';
import {
  getKitchenNote,
  getModifierTokens,
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

export interface KDSOrderStaticViewModel {
  order: Order;
  groupedItems: KDSGroupedItemViewModel[];
  isModified: boolean;
}

function isActiveOrder(order: Order): boolean {
  return order.status !== 'paid' && order.status !== 'served';
}

export function buildKDSGroupedItems(items: CartItem[]): KDSGroupedItemViewModel[] {
  return groupCartItems(items)
    .map((group) => {
      const modifierTokens = getModifierTokens(group.item);
      const kitchenNote = getKitchenNote(group.item);
      return {
        key: group.key,
        count: group.count,
        name: group.item.name,
        orderedByName: group.item.orderedByName,
        item: group.item,
        isModified:
          group.item.isCustomized === true || modifierTokens.length > 0 || kitchenNote !== null,
        modifierTokens,
        kitchenNote,
      };
    })
    .sort((a, b) => {
      if (a.isModified !== b.isModified) {
        return a.isModified ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
}

export function buildKDSOrderStaticViewModels(orders: Order[]): KDSOrderStaticViewModel[] {
  return orders.filter(isActiveOrder).map((order) => {
    const groupedItems = buildKDSGroupedItems(order.items);
    const isModified = groupedItems.some((group) => group.isModified);

    return {
      order,
      groupedItems,
      isModified,
    };
  });
}

export function projectKDSOrderViewModels(
  staticViewModels: KDSOrderStaticViewModel[],
  now: number,
): KDSOrderViewModel[] {
  return staticViewModels
    .map((viewModel) => {
      const timing = getOrderTiming(viewModel.order.createdAt, viewModel.order.status, now);
      const priorityBucket = getPriorityBucket(viewModel.order, viewModel.isModified, timing);

      return {
        order: viewModel.order,
        groupedItems: viewModel.groupedItems,
        isModified: viewModel.isModified,
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

export function buildKDSOrderViewModels(orders: Order[], now: number): KDSOrderViewModel[] {
  return projectKDSOrderViewModels(buildKDSOrderStaticViewModels(orders), now);
}
