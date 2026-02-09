"use client";

import { CartItem, TableSession } from "@/types";
import React, { createContext, useContext, useEffect, useState } from "react";

interface TableSessionContextType {
  session: TableSession | null;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
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

  const initializeSession = (tableId: string) => {
    if (!session || session.tableId !== tableId) {
      setSession({
        tableId,
        cart: [],
        status: "browsing",
      });
    }
  };

  const addItem = (item: Omit<CartItem, "id">) => {
    if (!session) return;
    
    setSession((prev) => {
      if (!prev) return null;

      const existingItemIndex = prev.cart.findIndex(
        (i) => i.menuItemId === item.menuItemId
      );

      if (existingItemIndex > -1) {
        // Item exists, increment quantity
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

      // Item doesn't exist, add new
      const newItem: CartItem = {
        ...item,
        id: crypto.randomUUID(),
      };

      return {
        ...prev,
        cart: [...prev.cart, newItem],
      };
    });
  };

  const removeItem = (itemId: string) => {
    setSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        cart: prev.cart.filter((i) => i.id !== itemId),
      };
    });
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
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
  };

  const clearCart = () => {
    setSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        cart: [],
      };
    });
  };

  return (
    <TableSessionContext.Provider
      value={{
        session,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
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
