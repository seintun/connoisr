import { Order } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function useKitchenOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastSynced, setLastSynced] = useState(Date.now());

  const syncOrders = useCallback(() => {
    const allOrders: Order[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("tempo-dine-session-")) {
          const sessionStr = localStorage.getItem(key);
          if (sessionStr) {
            const session = JSON.parse(sessionStr);
            if (session.orders && Array.isArray(session.orders)) {
              allOrders.push(...session.orders);
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to sync orders", e);
    }

    setOrders((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(allOrders)) {
        return allOrders;
      }
      return prev;
    });
    setLastSynced(Date.now());
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: Order["status"]) => {
    let found = false;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("tempo-dine-session-")) {
        try {
          const sessionStr = localStorage.getItem(key);
          if (sessionStr) {
            const session = JSON.parse(sessionStr);
            if (session.orders && Array.isArray(session.orders)) {
              const orderIndex = session.orders.findIndex((o: Order) => o.id === orderId);
              if (orderIndex > -1) {
                session.orders[orderIndex].status = status;
                localStorage.setItem(key, JSON.stringify(session));
                found = true;
                break;
              }
            }
          }
        } catch (e) {
          console.error("Error updating order", e);
        }
      }
    }

    if (found) {
      syncOrders();
    }
  }, [syncOrders]);

  useEffect(() => {
    syncOrders();
    // Poll every 2 seconds
    const pollInterval = setInterval(syncOrders, 2000);

    const handleStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith("tempo-dine-session-")) {
        syncOrders();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("storage", handleStorage);
    };
  }, [syncOrders]);

  return {
    orders,
    updateOrderStatus,
    lastSynced,
  };
}


