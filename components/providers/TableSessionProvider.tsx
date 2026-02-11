"use client";

import { SESSION_STORAGE_KEY } from "@/lib/constants";
import { calculateTotal } from "@/lib/utils";
import { CartItem, Order, TableSession } from "@/types";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";

type Action =
  | { type: "SET_SESSION"; payload: TableSession }
  | { type: "SET_GUEST_NAME"; payload: string }
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "instanceId" | "status"> & { quantity?: number } } // Allow quantity in payload for explosion
  | { type: "REMOVE_ITEM"; payload: { itemId: string } }
  | { type: "UPDATE_QUANTITY"; payload: { itemId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SEND_ORDER" }
  | {
      type: "UPDATE_ORDER_STATUS";
      payload: { orderId: string; status: Order["status"] };
    };

const sessionReducer = (
  state: TableSession | null,
  action: Action,
): TableSession | null => {
  if (action.type === "SET_SESSION") return action.payload;
  if (!state) return null;
  if (action.type === "SET_GUEST_NAME")
    return { ...state, guestName: action.payload };

  switch (action.type) {
    case "ADD_ITEM": {
      // Instance-based: Always create new items. Explode quantity into individual instances.
      const item = action.payload;
      
      const count = item.quantity || 1;
      const newInstances: CartItem[] = [];
      
      for (let i = 0; i < count; i++) {
         newInstances.push({
             ...item,
             instanceId: crypto.randomUUID(),
             quantity: 1, // Enforce 1
             status: 'PENDING'
         });
      }

      return {
        ...state,
        cart: [...state.cart, ...newInstances],
      };
    }
    case "REMOVE_ITEM":
      // Removes a specific instance
      return {
        ...state,
        cart: state.cart.filter((i) => i.instanceId !== action.payload.itemId),
      };
      
    case "UPDATE_QUANTITY": {
      const { itemId, quantity } = action.payload;
      
      
      // For quantity > 0, we adjust the count of identical instances
      // 1. Find the target instance to get its metadata
      const targetInstance = state.cart.find(i => i.instanceId === itemId);
      if (!targetInstance) return state;
      
      const identicalInstances = state.cart.filter(i => 
          i.menuItemId === targetInstance.menuItemId &&
          i.orderedByName === targetInstance.orderedByName &&
          JSON.stringify(i.options) === JSON.stringify(targetInstance.options) &&
          i.status === 'PENDING' // Only modify pending items
      );
      
      const currentCount = identicalInstances.length;
      const diff = quantity - currentCount;
      
      if (diff === 0) return state;
      
      let newCart = [...state.cart];
      
      if (diff > 0) {
          // Add `diff` copies
          for (let i = 0; i < diff; i++) {
              newCart.push({
                  ...targetInstance,
                  instanceId: crypto.randomUUID(),
                  quantity: 1,
                  status: 'PENDING'
              });
          }
      } else {
          // Remove `Math.abs(diff)` instances
          // We prioritize removing the specific one targeted IF it's a removal? 
          // Actually, if we are just adjusting count, we can remove any of the identical ones.
          // Let's remove from the end to be safe, or remove the specifically targeted one if count becomes 0.
          
          const toRemoveCount = Math.abs(diff);
          let removed = 0;
          newCart = newCart.filter(item => {
              if (removed >= toRemoveCount) return true;
              
              const isMatch = item.menuItemId === targetInstance.menuItemId &&
                              item.orderedByName === targetInstance.orderedByName &&
                              JSON.stringify(item.options) === JSON.stringify(targetInstance.options) &&
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
    case "CLEAR_CART":
      return { ...state, cart: [] };
    case "SEND_ORDER": {
      if (state.cart.length === 0) return state;
      const newOrder: Order = {
        id: crypto.randomUUID(),
        tableId: state.tableId,
        items: state.cart.map(i => ({...i, status: 'SENT'})), // Mark as SENT
        status: "ordered",
        createdAt: Date.now(),
        total: calculateTotal(state.cart),
      };
      return {
        ...state,
        orders: [...(state.orders || []), newOrder],
        cart: [],
        status: "ordering",
      };
    }
    case "UPDATE_ORDER_STATUS":
      return {
        ...state,
        orders: (state.orders || []).map((o) =>
          o.id === action.payload.orderId
            ? { ...o, status: action.payload.status }
            : o,
        ),
      };
    default:
      return state;
  }
};

interface TableSessionContextType {
  session: TableSession | null;
  addItem: (item: Omit<CartItem, "instanceId" | "status"> & { quantity?: number }) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  sendOrder: () => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  initializeSession: (tableId: string) => void;
  setGuestName: (name: string) => void;
}

const TableSessionContext = createContext<TableSessionContextType | undefined>(
  undefined,
);

export function TableSessionProvider({
  children,
  tableId: initialTableId,
}: {
  children: React.ReactNode;
  tableId?: string;
}) {
  const [session, dispatch] = useReducer(sessionReducer, null);

  const getStorageKey = useCallback(
    (tId: string) => SESSION_STORAGE_KEY(tId),
    [],
  );

  const initializeSession = useCallback(
    (tId: string) => {
      const key = getStorageKey(tId);
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.tableId === tId) {
            dispatch({ type: "SET_SESSION", payload: parsed });
            return;
          }
        }
      } catch (e) {
        console.error("Session parse error", e);
      }
      dispatch({
        type: "SET_SESSION",
        payload: { tableId: tId, cart: [], orders: [], status: "browsing" },
      });
    },
    [getStorageKey],
  );

  useEffect(() => {
    if (initialTableId) initializeSession(initialTableId);
  }, [initialTableId, initializeSession]);

  useEffect(() => {
    if (session) {
      localStorage.setItem(
        getStorageKey(session.tableId),
        JSON.stringify(session),
      );
    }
  }, [session, getStorageKey]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (session && e.key === getStorageKey(session.tableId) && e.newValue) {
        try {
          const newSession = JSON.parse(e.newValue);
          if (JSON.stringify(session) !== e.newValue) {
            dispatch({ type: "SET_SESSION", payload: newSession });
          }
        } catch (error) {
          console.error("Sync error", error);
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [session, getStorageKey]);

  const addItem = useCallback(
    (item: Omit<CartItem, "instanceId" | "status"> & { quantity?: number }) =>
      dispatch({ type: "ADD_ITEM", payload: item }),
    [],
  );
  const removeItem = useCallback(
    (itemId: string) => dispatch({ type: "REMOVE_ITEM", payload: { itemId } }),
    [],
  );
  const updateItemQuantity = useCallback(
    (itemId: string, quantity: number) =>
      dispatch({ type: "UPDATE_QUANTITY", payload: { itemId, quantity } }),
    [],
  );
  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);
  const sendOrder = useCallback(() => dispatch({ type: "SEND_ORDER" }), []);
  const updateOrderStatus = useCallback(
    (orderId: string, status: Order["status"]) =>
      dispatch({ type: "UPDATE_ORDER_STATUS", payload: { orderId, status } }),
    [],
  );
  const setGuestName = useCallback(
    (name: string) => dispatch({ type: "SET_GUEST_NAME", payload: name }),
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
    throw new Error(
      "useTableSession must be used within a TableSessionProvider",
    );
  return context;
}
