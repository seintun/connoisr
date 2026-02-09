"use client";

import { KDSTicket } from "@/components/domain/KDSTicket";
import { Order } from "@/types";
import { useEffect, useState } from "react";

export default function KDSPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  // Poll for orders from localStorage (simulating real-time updates)
  useEffect(() => {
    const checkOrders = () => {
      const savedSession = localStorage.getItem("tempo-dine-session");
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          if (session.orders) {
            setOrders(session.orders);
          }
        } catch (e) {
          console.error("Failed to parse session", e);
        }
      }
    };

    checkOrders();
    const interval = setInterval(checkOrders, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = (orderId: string, status: Order["status"]) => {
    setOrders((prev) => {
      const updatedOrders = prev.map((order) =>
        order.id === orderId ? { ...order, status } : order
      );
      
      // Persist status update to localStorage so it syncs
      const savedSession = localStorage.getItem("tempo-dine-session");
      if (savedSession) {
         try {
            const session = JSON.parse(savedSession);
            session.orders = updatedOrders;
            localStorage.setItem("tempo-dine-session", JSON.stringify(session));
         } catch (e) {
            console.error("Failed to update session", e);
         }
      }
      
      return updatedOrders;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <header className="flex justify-between items-center mb-8 border-b border-border pb-4">
        <h1 className="text-3xl font-serif font-bold text-primary">Kitchen Display System</h1>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{orders.filter((o) => o.status === "ordered").length} Pending</span>
          <span>{orders.filter((o) => o.status === "cooking").length} Cooking</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders
          .filter((o) => o.status !== "served" && o.status !== "paid")
          .sort((a, b) => a.createdAt - b.createdAt)
          .map((order) => (
            <KDSTicket
              key={order.id}
              order={order}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
      </div>
    </div>
  );
}
