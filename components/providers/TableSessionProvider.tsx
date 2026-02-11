'use client';

import { createInitialSession, sessionReducer } from '@/features/session/domain/sessionReducer';
import { readSession, writeSession } from '@/features/session/services/sessionStorage';
import {
  notifySessionUpdated,
  subscribeToSessionUpdates,
} from '@/features/session/services/sessionSync';
import { CartItem, Order, TableSession } from '@/types';
import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';

interface TableSessionContextType {
  session: TableSession | null;
  addItem: (item: Omit<CartItem, 'instanceId' | 'status'> & { quantity?: number }) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  sendOrder: () => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  initializeSession: (tableId: string) => void;
  setGuestName: (name: string) => void;
}

const TableSessionContext = createContext<TableSessionContextType | undefined>(undefined);

export function TableSessionProvider({
  children,
  tableId: initialTableId,
}: {
  children: React.ReactNode;
  tableId?: string;
}) {
  const [session, dispatch] = useReducer(sessionReducer, null);

  const initializeSession = useCallback((tId: string) => {
    try {
      const existing = readSession(tId);
      if (existing) {
        dispatch({ type: 'SET_SESSION', payload: existing });
        return;
      }
    } catch (e) {
      console.error('Session parse error', e);
    }
    dispatch({ type: 'SET_SESSION', payload: createInitialSession(tId) });
  }, []);

  useEffect(() => {
    if (initialTableId) initializeSession(initialTableId);
  }, [initialTableId, initializeSession]);

  useEffect(() => {
    if (session) {
      writeSession(session);
      notifySessionUpdated(session.tableId);
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const currentSignature = JSON.stringify(session);

    return subscribeToSessionUpdates((updatedTableId) => {
      if (updatedTableId && updatedTableId !== session.tableId) return;
      try {
        const nextSession = readSession(session.tableId);
        if (!nextSession) return;
        if (JSON.stringify(nextSession) === currentSignature) return;
        dispatch({ type: 'SET_SESSION', payload: nextSession });
      } catch (error) {
        console.error('Sync error', error);
      }
    });
  }, [session]);

  const addItem = useCallback(
    (item: Omit<CartItem, 'instanceId' | 'status'> & { quantity?: number }) =>
      dispatch({ type: 'ADD_ITEM', payload: item }),
    [],
  );
  const removeItem = useCallback(
    (itemId: string) => dispatch({ type: 'REMOVE_ITEM', payload: { itemId } }),
    [],
  );
  const updateItemQuantity = useCallback(
    (itemId: string, quantity: number) =>
      dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } }),
    [],
  );
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);
  const sendOrder = useCallback(() => dispatch({ type: 'SEND_ORDER' }), []);
  const updateOrderStatus = useCallback(
    (orderId: string, status: Order['status']) =>
      dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId, status } }),
    [],
  );
  const setGuestName = useCallback(
    (name: string) => dispatch({ type: 'SET_GUEST_NAME', payload: name }),
    [],
  );

  return (
    <TableSessionContext.Provider
      value={{
        session,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
        sendOrder,
        updateOrderStatus,
        initializeSession,
        setGuestName,
      }}
    >
      {children}
    </TableSessionContext.Provider>
  );
}

export function useTableSession() {
  const context = useContext(TableSessionContext);
  if (context === undefined)
    throw new Error('useTableSession must be used within a TableSessionProvider');
  return context;
}
