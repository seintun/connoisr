"use client";

import { useTableSession } from "@/components/providers/TableSessionProvider";
import { cn } from "@/lib/utils";
import { Order } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChefHat, Clock, Timer } from "lucide-react";
import { useEffect, useState } from "react";

export default function KitchenPage() {
  const { session, updateOrderStatus } = useTableSession();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        Waiting for session...
      </div>
    );
  }

  const activeOrders = (session.orders || [])
    .filter(order => order.status !== 'paid' && order.status !== 'served')
    .sort((a, b) => a.createdAt - b.createdAt);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'ordered': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cooking': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'ready': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-neutral-800 text-neutral-400';
    }
  };

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ChefHat className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">TempoDine KDS</h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-neutral-400 font-mono">
          <span>Table: {session.tableId}</span>
          <span>{new Date(now).toLocaleTimeString()}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {activeOrders.map((order) => {
            const timeDiff = Math.floor((now - order.createdAt) / 60000); // minutes
            
            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "rounded-2xl border bg-neutral-900/50 backdrop-blur-sm overflow-hidden flex flex-col shadow-xl",
                  getStatusColor(order.status).split(' ')[2] // Use border color
                )}
              >
                {/* Order Header */}
                <div className={cn("px-4 py-3 flex justify-between items-center border-b", getStatusColor(order.status))}>
                   <div className="flex items-center gap-2">
                     <span className="font-bold text-lg">#{order.id.slice(0,4)}</span>
                     <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-black/20">
                       {order.status}
                     </span>
                   </div>
                   <div className="flex items-center gap-1.5 text-xs font-mono font-medium">
                     <Timer className="w-3.5 h-3.5" />
                     <span>{timeDiff}m</span>
                   </div>
                </div>

                {/* Order Items */}
                <div className="p-4 space-y-4 flex-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-lg text-neutral-200 flex items-center gap-2">
                          {item.quantity}x {item.name}
                          {item.isCustomized && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              Custom
                            </span>
                          )}
                        </span>
                      </div>
                      
                      {/* Customizations */}
                      {item.options && Object.keys(item.options).length > 0 && (
                        <div className="bg-white/5 rounded-lg p-2 text-sm space-y-1 mt-1">
                          {item.options.spiciness && (
                            <div className="text-orange-400 flex items-center gap-1.5">
                              <span className="text-[10px] uppercase tracking-wider opacity-70">Spiciness</span>
                              <span className="font-medium">{item.options.spiciness}</span>
                            </div>
                          )}
                          {item.options.removals && (
                             <div className="text-red-400 flex items-start gap-1.5">
                                <span className="text-[10px] uppercase tracking-wider opacity-70 shrink-0 mt-0.5">No</span>
                                <span className="font-medium line-through decoration-red-400/50">{item.options.removals}</span>
                             </div>
                          )}
                          {item.options.allergens && (
                            <div className="text-emerald-400 flex items-center gap-1.5">
                              <span className="text-[10px] uppercase tracking-wider opacity-70">Dietary</span>
                              <span className="font-medium">{item.options.allergens}</span>
                            </div>
                          )}
                          {item.options.note && (
                            <div className="text-indigo-400 flex items-start gap-1.5">
                              <span className="text-[10px] uppercase tracking-wider opacity-70 shrink-0 mt-0.5">Note</span>
                              <span className="italic font-medium">"{item.options.note}"</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="p-3 border-t border-white/10 bg-white/5 flex gap-2">
                  {order.status === 'ordered' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'cooking')}
                      className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <ChefHat className="w-5 h-5" /> Start Cooking
                    </button>
                  )}
                  {order.status === 'cooking' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" /> Mark Ready
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'served')}
                      className="w-full py-3 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      Mark Served
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {activeOrders.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-neutral-600">
            <Clock className="w-16 h-16 mb-4 opacity-20" />
            <h2 className="text-xl font-medium">No active orders</h2>
            <p>Waiting for new orders...</p>
          </div>
        )}
      </div>
    </div>
  );
}
