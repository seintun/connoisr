"use client";

import { UrgencyLevel, useOrderTimer } from "@/hooks/useOrderTimer";
import { Order } from "@/types";
import clsx from "clsx";

interface KDSTicketProps {
  order: Order;
  onStatusUpdate: (orderId: string, status: Order["status"]) => void;
}

export function KDSTicket({ order, onStatusUpdate }: KDSTicketProps) {
  const { formattedTime, urgency } = useOrderTimer(order.createdAt, order.status);

  const getUrgencyStyles = (level: UrgencyLevel) => {
    switch (level) {
      case "new":
        return "border-primary bg-primary/5 shadow-glow text-primary"; // Coral
      case "process":
        return "border-secondary bg-secondary/5 text-secondary"; // Indigo
      case "delayed":
        return "border-amber-500 bg-amber-500/5 text-amber-600"; // Amber
      case "ready":
        return "border-success bg-success/5 text-success"; // Emerald
      case "served":
        return "border-muted bg-muted/50 text-muted-foreground opacity-75";
      default:
        return "border-border bg-card";
    }
  };

  return (
    <div
      className={clsx(
        "flex flex-col rounded-2xl border-2 p-5 transition-all duration-300 transform",
        getUrgencyStyles(urgency)
      )}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-serif text-2xl font-bold tracking-tight">Table {order.tableId}</h3>
          <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
            #{order.id.slice(0, 8)}
          </span>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono font-bold tracking-tighter">{formattedTime}</div>
          <div className="text-xs uppercase font-bold tracking-widest mt-1">
            {order.status}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 mb-6">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between items-center text-foreground/90">
            <div className="flex items-center gap-2">
              <span className="font-bold font-sans bg-foreground/5 px-2 py-0.5 rounded-md text-sm">
                {item.quantity}x
              </span>
              <span className="font-medium text-base">{item.name}</span>
            </div>
            {item.notes && (
              <div className="text-xs text-muted-foreground italic max-w-[40%] text-right">
                {item.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-auto">
        {order.status === "ordered" && (
          <button
            onClick={() => onStatusUpdate(order.id, "cooking")}
            className="col-span-2 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/25"
          >
            Start Cooking
          </button>
        )}
        {order.status === "cooking" && (
          <button
            onClick={() => onStatusUpdate(order.id, "ready")}
            className="col-span-2 py-3 bg-success text-success-foreground font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-success/25"
          >
            Mark Ready
          </button>
        )}
        {order.status === "ready" && (
          <button
            onClick={() => onStatusUpdate(order.id, "served")}
            className="col-span-2 py-3 bg-secondary text-secondary-foreground font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-secondary/25"
          >
            Complete Order
          </button>
        )}
      </div>
    </div>
  );
}
