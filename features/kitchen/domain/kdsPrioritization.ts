import type { Order } from '@/types';

export const NEW_ORDER_WINDOW_SECONDS = 90;
export const WARNING_THRESHOLD_MINUTES = 8;
export const OVERDUE_THRESHOLD_MINUTES = 12;

export type KDSPriorityBucket = 'overdue' | 'new' | 'modified' | 'normal' | 'ready';

export const KDS_PRIORITY_RANK: Record<KDSPriorityBucket, number> = {
  overdue: 0,
  new: 1,
  modified: 2,
  normal: 3,
  ready: 4,
};

export interface KDSOrderTiming {
  elapsedSeconds: number;
  elapsedMinutes: number;
  isNew: boolean;
  isWarning: boolean;
  isOverdue: boolean;
}

export function getOrderTiming(
  createdAt: number,
  status: Order['status'],
  now: number,
): KDSOrderTiming {
  const elapsedSeconds = Math.max(0, Math.floor((now - createdAt) / 1000));
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const activeForTiming = status !== 'ready' && status !== 'served' && status !== 'paid';

  return {
    elapsedSeconds,
    elapsedMinutes,
    isNew: status === 'ordered' && elapsedSeconds <= NEW_ORDER_WINDOW_SECONDS,
    isWarning: activeForTiming && elapsedMinutes >= WARNING_THRESHOLD_MINUTES,
    isOverdue: activeForTiming && elapsedMinutes >= OVERDUE_THRESHOLD_MINUTES,
  };
}

export function getPriorityBucket(
  order: Order,
  isModified: boolean,
  timing: KDSOrderTiming,
): KDSPriorityBucket {
  if (order.status === 'ready') {
    return 'ready';
  }

  if (timing.isOverdue) {
    return 'overdue';
  }

  if (order.status === 'ordered' && timing.isNew) {
    return 'new';
  }

  if (order.status === 'ordered' && isModified) {
    return 'modified';
  }

  return 'normal';
}

export function compareKDSOrders(
  a: { order: Order; priorityRank: number },
  b: { order: Order; priorityRank: number },
): number {
  if (a.priorityRank !== b.priorityRank) {
    return a.priorityRank - b.priorityRank;
  }

  if (a.order.createdAt !== b.order.createdAt) {
    return a.order.createdAt - b.order.createdAt;
  }

  return a.order.id.localeCompare(b.order.id);
}
