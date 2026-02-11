"use client";

import { IDENTITY_STORAGE_KEY } from "@/lib/constants";
import { generateGuestName } from "@/lib/utils";
import React, { useCallback, useContext, useEffect, useState } from "react";

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

const IdentityContext = React.createContext<IdentityContextType | undefined>(
  undefined,
);

function getStorageKey(tableId: string) {
  return IDENTITY_STORAGE_KEY(tableId);
}

function getInitialIdentityState(tableId: string): IdentityState {
  try {
    const saved = sessionStorage.getItem(getStorageKey(tableId));
    if (saved) {
      const parsed = JSON.parse(saved) as IdentityState;
      if (parsed.userName) {
        return parsed;
      }
    }
  } catch {
    // noop
  }

  return { userName: null, userId: crypto.randomUUID(), isGuest: false };
}

export function IdentityProvider({
  children,
  tableId,
}: {
  children: React.ReactNode;
  tableId: string;
}) {
  const [state, setState] = useState<IdentityState>(() =>
    getInitialIdentityState(tableId),
  );

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

  const setIdentity = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      userName: name.trim(),
      isGuest: false,
      userId: prev.userId || crypto.randomUUID(),
    }));
  }, []);

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
  if (!context)
    throw new Error("useIdentity must be used within IdentityProvider");
  return context;
}
