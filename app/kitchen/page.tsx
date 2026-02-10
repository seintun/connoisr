"use client";

import { useTableSession } from "@/components/providers/TableSessionProvider";
import { MENU_ITEMS, TAG_EMOJIS } from "@/lib/menu";
import { cn } from "@/lib/utils";
import { Order } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChefHat, Clock, Flame, Timer } from "lucide-react";
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
                  {order.items.map((item, idx) => {
                    const menuDef = MENU_ITEMS.find(i => i.id === item.menuItemId);
                    const tags = menuDef?.tags || item.tags || [];
                    const hasOptions = item.options && Object.keys(item.options).length > 0;
                    const hasNotes = !!item.notes;
                    const isCustom = item.isCustomized || hasOptions || hasNotes;

                    return (
                      <div key={idx} className={cn("flex flex-col gap-2 p-3 rounded-xl transition-colors", isCustom ? "bg-white/5 border border-white/5" : "hover:bg-white/5")}>
                        {/* Main Item Row */}
                        <div className="flex items-start gap-3">
                          <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-200 text-neutral-900 font-bold font-mono text-lg shadow-sm">
                            {item.quantity}
                          </span>
                          <div className="flex-1 min-w-0">
                             <div className="flex items-baseline justify-between gap-2">
                                <span className={cn("font-bold text-xl tracking-tight leading-tight", isCustom ? "text-white" : "text-neutral-200")}>
                                  {item.name}
                                </span>
                             </div>
                             
                             {/* Tags */}
                             {tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-1.5 opacity-80">
                                  {tags.map(tag => (
                                    <span key={tag} className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-white/10 flex items-center gap-1">
                                      <span className="grayscale">{TAG_EMOJIS[tag]}</span>
                                      <span>{tag}</span>
                                    </span>
                                  ))}
                                </div>
                             )}
                          </div>
                        </div>

                        {/* Customizations Block */}
                        {(hasOptions || hasNotes) && (
                          <div className="ml-11 space-y-1.5">
                            
                            {/* Spiciness */}
                            {item.options?.spiciness && (
                              <div className="flex items-center gap-2 text-orange-400 font-medium bg-orange-950/30 px-2 py-1.5 rounded-md border border-orange-500/20">
                                <Flame className="w-3.5 h-3.5 fill-orange-400/20" />
                                <span className="text-xs uppercase tracking-wider opacity-70">Spice:</span>
                                <span className="text-sm">{item.options.spiciness}</span>
                              </div>
                            )}

                            {/* Removals */}
                            {item.options?.removals && (
                               <div className="flex items-start gap-2 text-red-400 font-medium bg-red-950/30 px-2 py-1.5 rounded-md border border-red-500/20">
                                  <div className="mt-0.5 relative shrink-0">
                                    <span className="w-3.5 h-3.5 flex items-center justify-center border border-red-400 rounded-full text-[10px] font-bold">✕</span>
                                  </div>
                                  <div className="flex flex-col leading-tight">
                                    <span className="text-[10px] uppercase tracking-wider opacity-70">NO:</span>
                                    <span className="text-sm">{item.options.removals}</span>
                                  </div>
                               </div>
                            )}

                            {/* Dietary */}
                            {item.options?.allergens && (
                              <div className="flex items-center gap-2 text-emerald-400 font-medium bg-emerald-950/30 px-2 py-1.5 rounded-md border border-emerald-500/20">
                                <span className="text-lg leading-none">🥬</span>
                                <span className="text-xs uppercase tracking-wider opacity-70">Dietary:</span>
                                <span className="text-sm">{item.options.allergens}</span>
                              </div>
                            )}

                            {/* Notes - High Visibility */}
                            {(item.options?.note || item.notes) && (
                              <div className="flex items-start gap-2 text-amber-300 font-medium bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/30 shadow-sm mt-1">
                                <span className="text-lg leading-none mt-0.5">📝</span>
                                <div className="flex flex-col">
                                   <span className="text-[10px] uppercase tracking-wider text-amber-500 font-bold mb-0.5">Kitchen Note:</span>
                                   <span className="italic text-base text-amber-200">"{item.options?.note || item.notes}"</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
