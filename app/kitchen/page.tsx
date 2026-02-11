'use client';

import { groupCartItems } from '@/features/cart/domain/grouping';
import { useKitchenOrders } from '@/hooks/useKitchenOrders';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Order } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ChefHat, Clock, Flame, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';

const INITIAL_NOW = Date.now();

export default function KitchenPage() {
  const { orders, updateOrderStatus } = useKitchenOrders();
  const [now, setNow] = useState(INITIAL_NOW);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000); // 10s for time display
    return () => clearInterval(interval);
  }, []);

  const activeOrders = orders
    .filter((order) => order.status !== 'paid' && order.status !== 'served')
    .sort((a, b) => a.createdAt - b.createdAt);

  const OVERDUE_THRESHOLD_MIN = 10;

  const getStatusColor = (status: Order['status'], timeDiff?: number) => {
    // Overdue orders get burnt sienna regardless of status
    if (timeDiff !== undefined && timeDiff >= OVERDUE_THRESHOLD_MIN && status !== 'ready') {
      return 'bg-orange-700/20 text-orange-300 border-orange-700/30';
    }
    switch (status) {
      case 'ordered':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'cooking':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'ready':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      default:
        return 'bg-neutral-800 text-neutral-400';
    }
  };

  return (
    <div className="p-6" data-testid="kitchen-page">
      <header className="flex items-center justify-between mb-8" data-testid="kitchen-header">
        <div className="flex items-center gap-3">
          <ChefHat className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">{APP_NAME} KDS</h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-neutral-400 font-mono">
          <span>Active Orders: {activeOrders.length}</span>
          <span>{new Date(now).toLocaleTimeString()}</span>
        </div>
      </header>

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        data-testid="kitchen-orders-grid"
      >
        <AnimatePresence mode="popLayout">
          {activeOrders.map((order) => {
            const timeDiff = Math.floor((now - order.createdAt) / 60000);
            const isOverdue = timeDiff >= OVERDUE_THRESHOLD_MIN && order.status !== 'ready';
            const statusColors = getStatusColor(order.status, timeDiff);
            const groupedItems = groupCartItems(order.items);

            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                data-testid={`kitchen-order-card-${order.id}`}
                className={cn(
                  'rounded-2xl border bg-neutral-900/50 backdrop-blur-sm overflow-hidden flex flex-col shadow-xl',
                  statusColors.split(' ')[2],
                  isOverdue && 'animate-pulse',
                )}
              >
                {/* Order Header */}
                <div
                  className={cn(
                    'px-4 py-3 flex justify-between items-center border-b',
                    statusColors,
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">Table {order.tableId}</span>
                    <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-black/20">
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-medium">
                    {isOverdue && (
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                    )}
                    <Timer className="w-3.5 h-3.5" />
                    <span className={cn(isOverdue && 'text-orange-300 font-bold')}>
                      {timeDiff}m
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 space-y-4 flex-1">
                  {groupedItems.map((group, idx) => {
                    const item = group.item;
                    const hasOptions = item.options && Object.keys(item.options).length > 0;
                    const hasNotes = !!item.notes;
                    const isCustom = item.isCustomized || hasOptions || hasNotes;

                    // Functional Color Theory
                    // Standard: Emerald (Calm, Standard)
                    // Custom: Amber (Caution, Attention)
                    const itemContainerClass = isCustom
                      ? 'bg-amber-500/10 border border-amber-500/30' // Amber for custom
                      : 'bg-emerald-500/5 border border-emerald-500/10'; // Emerald for standard

                    const quantityBadgeClass = isCustom
                      ? 'bg-amber-500 text-amber-950'
                      : 'bg-emerald-500/20 text-emerald-400';

                    const itemNameClass = isCustom ? 'text-amber-200' : 'text-neutral-200';

                    // Helper for Spiciness Color
                    const getSpicinessColor = (level: string) => {
                      switch (level) {
                        case 'Extra Hot':
                          return 'bg-red-500/20 text-red-300 border-red-500/30';
                        case 'Hot':
                          return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
                        case 'Medium':
                          return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
                        case 'Mild':
                          return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                        default:
                          return 'bg-neutral-800 text-neutral-400';
                      }
                    };

                    return (
                      <div
                        key={idx}
                        className={cn(
                          'flex flex-col gap-3 p-3 rounded-xl transition-colors',
                          itemContainerClass,
                        )}
                      >
                        {/* Main Item Row */}
                        <div className="flex items-start gap-4">
                          <span
                            className={cn(
                              'shrink-0 flex items-center justify-center w-10 h-10 rounded-lg font-bold font-mono text-xl shadow-sm',
                              quantityBadgeClass,
                            )}
                          >
                            {group.count}
                          </span>
                          <div className="flex-1 min-w-0 pt-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <span
                                className={cn('font-bold text-lg leading-tight', itemNameClass)}
                              >
                                {item.name}
                              </span>
                              {item.orderedByName && (
                                <span className="text-xs text-neutral-500 font-medium">
                                  — {item.orderedByName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Customizations Block */}
                        {(hasOptions || hasNotes) && (
                          <div className="ml-14 space-y-2">
                            {/* Spiciness */}
                            {item.options?.spiciness && (
                              <div
                                className={cn(
                                  'flex items-center gap-2 px-3 py-1.5 rounded-lg border w-fit',
                                  getSpicinessColor(item.options.spiciness),
                                )}
                              >
                                <Flame className="w-4 h-4 fill-current opacity-50" />
                                <span className="text-xs font-bold uppercase tracking-wider">
                                  {item.options.spiciness}
                                </span>
                              </div>
                            )}

                            {/* Removals */}
                            {item.options?.removals && (
                              <div className="flex items-start gap-2 text-red-400 font-medium bg-red-950/20 px-3 py-2 rounded-lg border border-red-500/20">
                                <div className="mt-0.5 relative shrink-0">
                                  <span className="w-4 h-4 flex items-center justify-center border border-red-400 rounded-full text-[10px] font-bold">
                                    ✕
                                  </span>
                                </div>
                                <span className="text-sm">NO {item.options.removals}</span>
                              </div>
                            )}

                            {/* Dietary */}
                            {item.options?.allergens && (
                              <div className="flex items-center gap-2 text-emerald-400 font-medium bg-emerald-950/20 px-3 py-2 rounded-lg border border-emerald-500/20">
                                <span className="text-lg leading-none">🥬</span>
                                <span className="text-sm">{item.options.allergens}</span>
                              </div>
                            )}

                            {/* Notes - High Visibility Sticky Note Style */}
                            {(item.options?.note || item.notes) && (
                              <div className="flex flex-col gap-1 bg-yellow-300/10 border border-yellow-300/40 p-3 rounded-tr-xl rounded-bl-xl rounded-br-sm rounded-tl-sm relative mt-1">
                                <div className="flex items-center gap-2 text-yellow-500 font-bold text-xs uppercase tracking-wider mb-1">
                                  <ChefHat className="w-3 h-3" />
                                  Kitchen Note
                                </div>
                                <p className="text-yellow-100 font-medium italic text-base leading-snug">
                                  &quot;{item.options?.note || item.notes}&quot;
                                </p>
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
                      data-testid={`kitchen-start-cooking-${order.id}`}
                      className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <ChefHat className="w-5 h-5" /> Start Cooking
                    </button>
                  )}
                  {order.status === 'cooking' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      data-testid={`kitchen-mark-ready-${order.id}`}
                      className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" /> Mark Ready
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'served')}
                      data-testid={`kitchen-mark-served-${order.id}`}
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
          <div
            className="col-span-full flex flex-col items-center justify-center py-20 text-neutral-600"
            data-testid="kitchen-empty-state"
          >
            <Clock className="w-16 h-16 mb-4 opacity-20" />
            <h2 className="text-xl font-medium">No active orders</h2>
            <p>Waiting for new orders...</p>
          </div>
        )}
      </div>
    </div>
  );
}
