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
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "id"> }
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
      const item = action.payload;
      const existingIdx = item.isCustomized
        ? -1
        : state.cart.findIndex(
            (i) =>
              i.menuItemId === item.menuItemId &&
              !i.isCustomized &&
              i.orderedByName === item.orderedByName,
          );

      if (existingIdx > -1) {
        const newCart = [...state.cart];
        newCart[existingIdx] = {
          ...newCart[existingIdx],
          quantity: newCart[existingIdx].quantity + item.quantity,
        };
        return { ...state, cart: newCart };
      }

      return {
        ...state,
        cart: [...state.cart, { ...item, id: crypto.randomUUID() }],
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        cart: state.cart.filter((i) => i.id !== action.payload.itemId),
      };
    case "UPDATE_QUANTITY": {
      const { itemId, quantity } = action.payload;
      if (quantity <= 0) {
        return { ...state, cart: state.cart.filter((i) => i.id !== itemId) };
      }
      return {
        ...state,
        cart: state.cart.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
      };
    }
    case "CLEAR_CART":
      return { ...state, cart: [] };
    case "SEND_ORDER": {
      if (state.cart.length === 0) return state;
      const newOrder: Order = {
        id: crypto.randomUUID(),
        tableId: state.tableId,
        items: [...state.cart],
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
  addItem: (item: Omit<CartItem, "id">) => void;
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
    (item: Omit<CartItem, "id">) =>
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
