"use client";

import { KDSTicket } from "@/components/domain/KDSTicket";
import { Order } from "@/types";
import { useState } from "react";

// Mock Data
const MOCK_ORDERS: Order[] = [
  {
    id: "ord-123",
    tableId: "4",
    items: [
      { id: "1", menuItemId: "item-1", name: "Truffle Risotto", category: "Mains", price: 28, quantity: 2 },
      { id: "2", menuItemId: "item-2", name: "Pan-Seared Scallops", category: "Mains", price: 32, quantity: 1 },
    ],
    status: "cooking",
    createdAt: new Date(Date.now() - 1000 * 60 * 12), // 12 mins ago
    updatedAt: new Date(),
    total: 88,
  },
  {
    id: "ord-124",
    tableId: "7",
    items: [
      { id: "3", menuItemId: "item-3", name: "Wagyu Beef Carpaccio", category: "Appetizers", price: 24, quantity: 1 },
    ],
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 2), // 2 mins ago
    updatedAt: new Date(),
    total: 24,
  },
];

export default function KDSPage() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

  const handleStatusUpdate = (orderId: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status, updatedAt: new Date() } : order
      )
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <header className="flex justify-between items-center mb-8 border-b border-border pb-4">
        <h1 className="text-3xl font-serif font-bold text-primary">Kitchen Display System</h1>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{orders.filter((o) => o.status === "pending").length} Pending</span>
          <span>{orders.filter((o) => o.status === "cooking").length} Cooking</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders
          .filter((o) => o.status !== "served" && o.status !== "paid")
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
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
