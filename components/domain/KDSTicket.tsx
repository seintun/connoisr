"use client";

import { Order } from "@/types";
import clsx from "clsx";
import { useEffect, useState } from "react";

interface KDSTicketProps {
  order: Order;
  onStatusUpdate: (orderId: string, status: Order["status"]) => void;
}

export function KDSTicket({ order, onStatusUpdate }: KDSTicketProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [order.createdAt]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "border-destructive/50 bg-destructive/10";
      case "cooking":
        return "border-primary/50 bg-primary/10";
      case "ready":
        return "border-emerald-500/50 bg-emerald-500/10";
      default:
        return "border-border bg-card";
    }
  };

  return (
    <div
      className={clsx(
        "flex flex-col rounded-sm border p-4 shadow-sm transition-all",
        getStatusColor(order.status)
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-serif text-lg font-bold">Table {order.tableId}</h3>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            #{order.id.slice(0, 8)}
          </span>
        </div>
        <div className="text-right">
          <div className="text-xl font-mono font-bold">{formatTime(elapsed)}</div>
          <div className="text-xs uppercase font-medium text-muted-foreground">
            {order.status}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-2 mb-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="font-medium">
              {item.quantity}x {item.name}
            </span>
            {item.notes && (
              <div className="text-xs text-muted-foreground ml-4 italic">
                {item.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-auto">
        {order.status === "pending" && (
          <button
            onClick={() => onStatusUpdate(order.id, "cooking")}
            className="col-span-2 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:opacity-90"
          >
            Start Cooking
          </button>
        )}
        {order.status === "cooking" && (
          <button
            onClick={() => onStatusUpdate(order.id, "ready")}
            className="col-span-2 py-2 bg-emerald-600 text-white text-sm font-medium rounded-sm hover:opacity-90"
          >
            Mark Ready
          </button>
        )}
        {order.status === "ready" && (
          <button
            onClick={() => onStatusUpdate(order.id, "served")}
            className="col-span-2 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-sm hover:opacity-90"
          >
            Serviced
          </button>
        )}
      </div>
    </div>
  );
}
