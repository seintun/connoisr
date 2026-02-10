"use client";

import { CartItem, Order, TableSession } from "@/types";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface TableSessionContextType {
  session: TableSession | null;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  sendOrder: () => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  initializeSession: (tableId: string) => void;
}

const TableSessionContext = createContext<TableSessionContextType | undefined>(
  undefined
);

export function TableSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<TableSession | null>(null);

  // ... (keep existing useEffects)

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem("tempo-dine-session");
    if (savedSession) {
      try {
        setSession(JSON.parse(savedSession));
      } catch (e) {
        console.error("Failed to parse session", e);
      }
    }
  }, []);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (session) {
      localStorage.setItem("tempo-dine-session", JSON.stringify(session));
    }
  }, [session]);

  // Sync with other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "tempo-dine-session" && e.newValue) {
        try {
          const newSession = JSON.parse(e.newValue);
          setSession(prev => {
            if (JSON.stringify(prev) !== e.newValue) {
               return newSession;
            }
            return prev;
          });
        } catch (error) {
          console.error("Failed to sync session", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const initializeSession = useCallback((tableId: string) => {
    setSession((prev) => {
      if (!prev || prev.tableId !== tableId) {
        return {
          tableId,
          cart: [],
          orders: [],
          status: "browsing",
        };
      }
      return prev;
    });
  }, []);

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    setSession((prev) => {
      if (!prev) return null;

      // Customized items always get their own line
      // Plain items merge if same menuItemId
      const existingItemIndex = item.isCustomized
        ? -1
        : prev.cart.findIndex(
            (i) => i.menuItemId === item.menuItemId && !i.isCustomized
          );

      if (existingItemIndex > -1) {
        const newCart = [...prev.cart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + item.quantity,
        };

        return {
          ...prev,
          cart: newCart,
        };
      }

      const newItem: CartItem = {
        ...item,
        id: crypto.randomUUID(),
      };

      return {
        ...prev,
        cart: [...prev.cart, newItem],
      };
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        cart: prev.cart.filter((i) => i.id !== itemId),
      };
    });
  }, []);

  const updateItemQuantity = useCallback((itemId: string, quantity: number) => {
    setSession((prev) => {
      if (!prev) return null;
      if (quantity <= 0) {
        return {
          ...prev,
          cart: prev.cart.filter((i) => i.id !== itemId),
        };
      }
      return {
        ...prev,
        cart: prev.cart.map((i) =>
          i.id === itemId ? { ...i, quantity } : i
        ),
      };
    });
  }, []);

  const clearCart = useCallback(() => {
    setSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        cart: [],
      };
    });
  }, []);

  const sendOrder = useCallback(() => {
    setSession((prev) => {
      if (!prev || prev.cart.length === 0) return prev;

      const newOrder: Order = {
        id: crypto.randomUUID(),
        tableId: prev.tableId,
        items: [...prev.cart],
        status: 'ordered',
        createdAt: Date.now(),
        total: prev.cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
      };

      return {
        ...prev,
        orders: [...(prev.orders || []), newOrder],
        cart: [],
        status: 'ordering',
      };
    });
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setSession((prev) => {
        if (!prev) return null;
        return {
            ...prev,
            orders: (prev.orders || []).map(order => 
                order.id === orderId ? { ...order, status } : order
            )
        };
    });
  }, []);

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
      }}
    >
      {children}
    </TableSessionContext.Provider>
  );
}

export function useTableSession() {
  const context = useContext(TableSessionContext);
  if (context === undefined) {
    throw new Error(
      "useTableSession must be used within a TableSessionProvider"
    );
  }
  return context;
}
