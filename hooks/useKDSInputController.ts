'use client';

import {
  findNextMatchingIndex,
  getNextActionLabel,
  getNextFocusIndex,
  getNextStatus,
} from '@/features/kitchen/domain/kdsCommands';
import type { KDSOrderViewModel } from '@/features/kitchen/domain/kdsSelectors';
import type { Order } from '@/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

type KDSInputMode = 'touch' | 'keyboard';

interface LastStatusAction {
  orderId: string;
  previousStatus: Order['status'];
  expiresAt: number;
}

interface UseKDSInputControllerArgs {
  orders: KDSOrderViewModel[];
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const UNDO_WINDOW_MS = 5000;

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
}

export function useKDSInputController({ orders, updateOrderStatus }: UseKDSInputControllerArgs) {
  const [rawFocusedOrderId, setRawFocusedOrderId] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<KDSInputMode>('touch');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [lastAction, setLastAction] = useState<LastStatusAction | null>(null);

  const focusedOrderId = useMemo(() => {
    if (orders.length === 0) {
      return null;
    }

    if (rawFocusedOrderId && orders.some((entry) => entry.order.id === rawFocusedOrderId)) {
      return rawFocusedOrderId;
    }

    return orders[0].order.id;
  }, [orders, rawFocusedOrderId]);

  const focusedIndex = useMemo(
    () => orders.findIndex((entry) => entry.order.id === focusedOrderId),
    [orders, focusedOrderId],
  );

  const focusedOrder = focusedIndex >= 0 ? orders[focusedIndex] : null;

  useEffect(() => {
    if (!lastAction) {
      return;
    }

    const timeout = setTimeout(
      () => setLastAction(null),
      Math.max(lastAction.expiresAt - Date.now(), 0),
    );
    return () => clearTimeout(timeout);
  }, [lastAction]);

  const moveFocus = useCallback(
    (delta: number) => {
      if (orders.length === 0) return;
      const nextIndex = getNextFocusIndex(focusedIndex, delta, orders.length);
      if (nextIndex >= 0) {
        setRawFocusedOrderId(orders[nextIndex].order.id);
      }
    },
    [orders, focusedIndex],
  );

  const jumpTo = useCallback(
    (matcher: (order: KDSOrderViewModel) => boolean) => {
      if (orders.length === 0) {
        return;
      }

      const startIndex = focusedIndex < 0 ? 0 : focusedIndex + 1;
      const foundIndex = findNextMatchingIndex(startIndex, orders.length, (index) =>
        matcher(orders[index]),
      );

      if (foundIndex >= 0) {
        setRawFocusedOrderId(orders[foundIndex].order.id);
      }
    },
    [orders, focusedIndex],
  );

  const commitStatusUpdate = useCallback(
    (orderId: string, status: Order['status']) => {
      const targetOrder = orders.find((entry) => entry.order.id === orderId)?.order;
      if (!targetOrder || targetOrder.status === status) {
        return;
      }

      setLastAction({
        orderId,
        previousStatus: targetOrder.status,
        expiresAt: Date.now() + UNDO_WINDOW_MS,
      });
      updateOrderStatus(orderId, status);
    },
    [orders, updateOrderStatus],
  );

  const advanceFocusedOrder = useCallback(() => {
    if (!focusedOrder) {
      return;
    }

    const nextStatus = getNextStatus(focusedOrder.order.status);
    if (!nextStatus) {
      return;
    }

    commitStatusUpdate(focusedOrder.order.id, nextStatus);
  }, [focusedOrder, commitStatusUpdate]);

  const undoLastAction = useCallback(() => {
    if (!lastAction) {
      return;
    }

    if (Date.now() > lastAction.expiresAt) {
      setLastAction(null);
      return;
    }

    updateOrderStatus(lastAction.orderId, lastAction.previousStatus);
    setRawFocusedOrderId(lastAction.orderId);
    setLastAction(null);
  }, [lastAction, updateOrderStatus]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      if (event.key === '?') {
        event.preventDefault();
        setInputMode('keyboard');
        setShowShortcuts((prev) => !prev);
        return;
      }

      if (event.key === 'Escape') {
        setShowShortcuts(false);
        return;
      }

      if (showShortcuts) {
        return;
      }

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setInputMode('keyboard');
          moveFocus(1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setInputMode('keyboard');
          moveFocus(-1);
          break;
        case 'Enter':
          event.preventDefault();
          setInputMode('keyboard');
          advanceFocusedOrder();
          break;
        case 'm':
        case 'M':
          event.preventDefault();
          setInputMode('keyboard');
          jumpTo((order) => order.isModified);
          break;
        case 'o':
        case 'O':
          event.preventDefault();
          setInputMode('keyboard');
          jumpTo((order) => order.isOverdue);
          break;
        case 'n':
        case 'N':
          event.preventDefault();
          setInputMode('keyboard');
          jumpTo((order) => order.isNew);
          break;
        case 'u':
        case 'U':
          event.preventDefault();
          setInputMode('keyboard');
          undoLastAction();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [moveFocus, advanceFocusedOrder, jumpTo, undoLastAction, showShortcuts]);

  const actionHint = focusedOrder
    ? getNextActionLabel(focusedOrder.order.status)
    : 'No active orders';

  const setFocusedFromTouch = useCallback((orderId: string) => {
    setInputMode('touch');
    setRawFocusedOrderId(orderId);
  }, []);

  const closeShortcuts = useCallback(() => setShowShortcuts(false), []);
  const openShortcuts = useCallback(() => setShowShortcuts(true), []);

  return {
    focusedOrderId,
    inputMode,
    showShortcuts,
    closeShortcuts,
    openShortcuts,
    actionHint,
    setFocusedFromTouch,
    commitStatusUpdate,
    undoAvailable: !!lastAction,
    undoLastAction,
  };
}
