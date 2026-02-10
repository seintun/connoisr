"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const ADJECTIVES = ["Hungry", "Happy", "Crispy", "Golden", "Chilled"];
const FOODS = ["Taco", "Noodle", "Dumpling", "Brioche", "Espresso"];

interface IdentityState {
  userName: string | null;
  userId: string;
  isGuest: boolean;
}

interface IdentityContextType extends IdentityState {
  setIdentity: (name: string) => void;
  joinAsGuest: () => void;
  clearIdentity: () => void;
}

const IdentityContext = createContext<IdentityContextType | undefined>(undefined);

function generateGuestName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const food = FOODS[Math.floor(Math.random() * FOODS.length)];
  return `${adj} ${food}`;
}

function getStorageKey(tableId: string) {
  return `tempodine-identity-${tableId}`;
}

export function IdentityProvider({
  children,
  tableId,
}: {
  children: React.ReactNode;
  tableId: string;
}) {
  const [state, setState] = useState<IdentityState>({
    userName: null,
    userId: "",
    isGuest: false,
  });

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    try {
      const key = getStorageKey(tableId);
      const saved = sessionStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved) as IdentityState;
        if (parsed.userName) {
          setState(parsed);
          return;
        }
      }
    } catch {
      // noop
    }
    // Generate a userId for this session
    setState((prev) => ({ ...prev, userId: crypto.randomUUID() }));
  }, [tableId]);

  // Persist to sessionStorage on change
  useEffect(() => {
    if (state.userName) {
      try {
        sessionStorage.setItem(getStorageKey(tableId), JSON.stringify(state));
      } catch {
        // noop
      }
    }
  }, [state, tableId]);

  const setIdentity = useCallback(
    (name: string) => {
      setState((prev) => ({
        ...prev,
        userName: name.trim(),
        isGuest: false,
        userId: prev.userId || crypto.randomUUID(),
      }));
    },
    []
  );

  const joinAsGuest = useCallback(() => {
    setState((prev) => ({
      ...prev,
      userName: generateGuestName(),
      isGuest: true,
      userId: prev.userId || crypto.randomUUID(),
    }));
  }, []);

  const clearIdentity = useCallback(() => {
    setState({ userName: null, userId: crypto.randomUUID(), isGuest: false });
    try {
      sessionStorage.removeItem(getStorageKey(tableId));
    } catch {
      // noop
    }
  }, [tableId]);

  return (
    <IdentityContext.Provider
      value={{ ...state, setIdentity, joinAsGuest, clearIdentity }}
    >
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity() {
  const context = useContext(IdentityContext);
  if (!context) throw new Error("useIdentity must be used within IdentityProvider");
  return context;
}
