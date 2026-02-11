'use client';

import { useTableSession } from '@/components/providers/TableSessionProvider';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { cn } from '@/lib/utils';
import { CartItem } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  ChefHat,
  Clock,
  CreditCard,
  Minus,
  Plus,
  SlidersHorizontal,
  Trash2,
  User,
  WifiOff,
  X,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  onEditItem?: (item: CartItem) => void;
}

export function Checkout({ isOpen, onClose, onEditItem }: CheckoutProps) {
  const { session, clearCart, sendOrder, removeItem, addItem } = useTableSession();
  const isOnline = useOnlineStatus();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cartItems = useMemo(() => session?.cart ?? [], [session?.cart]);
  const orders = useMemo(() => session?.orders ?? [], [session?.orders]);

  const cartSubtotal = useMemo(
    () =>
      cartItems.reduce(
        (acc, item) => acc + item.price, // Quantity is always 1 per instance
        0,
      ),
    [cartItems],
  );
  const ordersTotal = useMemo(() => orders.reduce((acc, order) => acc + order.total, 0), [orders]);
  const grandSubtotal = cartSubtotal + ordersTotal;

  const hasCartItems = cartItems.length > 0;
  const hasOrders = orders.length > 0;
  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => b.createdAt - a.createdAt),
    [orders],
  );

  const handleSendToKitchen = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network
      sendOrder();
      // Close to signal "done"
      onClose();
    } catch (err) {
      setError('Failed to send order. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // In a real app, we'd mark orders as paid in the backend
      clearCart();
      location.reload(); // Simple reset for prototype
      alert('Payment successful! (Simulated)');
    } catch (err) {
      setError('Payment failed. Please try again.');
      console.error('Payment Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  type GroupedItem = { key: string; item: CartItem; count: number; instances: CartItem[] };

  const formatCurrency = (value: number) =>
    value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Group instances by display identity
  const groupInstances = useCallback((items: CartItem[]): GroupedItem[] => {
    const groups: Record<string, GroupedItem> = {};

    items.forEach((item) => {
      const optionsKey = JSON.stringify(item.options || {});
      const notesKey = item.notes || '';
      const key = `${item.menuItemId}|${optionsKey}|${notesKey}|${item.orderedByName || ''}|${item.isCustomized ? 'custom' : 'standard'}`;

      if (!groups[key]) {
        groups[key] = { key, item, count: 0, instances: [] };
      }
      groups[key].count++;
      groups[key].instances.push(item);
    });

    return Object.values(groups);
  }, []);

  const groupedCartItems = useMemo(() => groupInstances(cartItems), [cartItems, groupInstances]);

  const groupedKitchenOrders = useMemo(
    () => sortedOrders.map((order) => ({ order, groups: groupInstances(order.items) })),
    [sortedOrders, groupInstances],
  );

  if (!hasCartItems && !hasOrders) {
    return null;
  }

  const handleIncrement = (group: { item: CartItem; count: number; instances: CartItem[] }) => {
    // To increment, we just add a duplicate of one of the instances
    const template = group.instances[0];
    addItem({
      menuItemId: template.menuItemId,
      name: template.name,
      category: template.category,
      price: template.price,
      tags: template.tags,
      options: template.options,
      isCustomized: template.isCustomized,
      orderedByName: template.orderedByName,
      quantity: 1, // Add 1 new instance
    });
  };

  const handleDecrement = (group: { item: CartItem; count: number; instances: CartItem[] }) => {
    // Remove the last instance in the group
    const instanceToRemove = group.instances[group.instances.length - 1];
    if (instanceToRemove) {
      removeItem(instanceToRemove.instanceId);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Cart Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 sm:bottom-4 sm:left-4 sm:right-4 z-50 bg-card/95 backdrop-blur-2xl rounded-t-[1.75rem] sm:rounded-[2rem] shadow-[0_-8px_40px_-10px_rgba(0,0,0,0.5)] max-h-[92vh] flex flex-col border border-border/50 overflow-hidden ring-1 ring-black/5"
            data-testid="checkout-sheet"
          >
            {/* Header */}
            <div className="pt-2 pb-0 shrink-0">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20 mx-auto mb-2" />
              <div className="flex justify-between items-center px-5 pb-3 border-b border-border/40">
                <h2 className="text-base font-serif font-bold text-foreground">Your Table</h2>
                <button
                  onClick={onClose}
                  data-testid="checkout-close-btn"
                  className="w-9 h-9 flex items-center justify-center hover:bg-secondary rounded-full transition-all active:scale-95 -mr-1"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-6 overscroll-contain flex flex-col">
              {/* Previous Orders */}
              {hasOrders && (
                <div className="space-y-3 order-2">
                  {hasCartItems && <div className="h-px bg-border/40 my-2" />}
                  <div className="flex items-center gap-2 px-1">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Kitchen Orders
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {groupedKitchenOrders.map(({ order, groups }) => (
                      <div key={order.id} className="opacity-80 grayscale-[0.3]">
                        <div className="flex items-center gap-2 mb-2 px-1">
                          <CheckCircle2
                            className={cn(
                              'w-3 h-3',
                              order.status === 'ordered'
                                ? 'text-blue-500'
                                : order.status === 'cooking'
                                  ? 'text-orange-500'
                                  : order.status === 'ready'
                                    ? 'text-green-500'
                                    : 'text-muted-foreground',
                            )}
                          />
                          <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md uppercase">
                            {order.status === 'ordered'
                              ? 'Order Placed'
                              : order.status === 'cooking'
                                ? 'Preparing'
                                : order.status === 'ready'
                                  ? 'Ready to Serve'
                                  : order.status}{' '}
                            •{' '}
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="space-y-1 pl-2 border-l-2 border-border/50">
                          {groups.map((group) => {
                            const item = group.item;
                            const displayNote = item.notes || item.options?.note;
                            const intensityText = item.options?.spiciness
                              ? `Spiciness: ${item.options.spiciness}`
                              : item.options?.sweetness
                                ? `Sweetness: ${item.options.sweetness}`
                                : null;
                            const intensityClass = item.options?.sweetness
                              ? 'text-[10px] text-pink-600 font-medium truncate'
                              : 'text-[10px] text-orange-600 font-medium truncate';
                            return (
                              <div key={group.key} className="py-1 pr-2">
                                <div className="flex justify-between items-start gap-2">
                                  <div className="min-w-0 space-y-1">
                                    <div className="flex items-baseline gap-2 min-w-0">
                                      <span className="text-xs font-medium text-foreground/80">
                                        {group.count}x
                                      </span>
                                      <span className="text-xs text-foreground/70 truncate">
                                        {item.name}
                                      </span>
                                      {item.orderedByName && (
                                        <span className="text-[10px] font-medium text-amber-900/40 dark:text-amber-100/40 bg-amber-100/50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                                          <User className="w-3 h-3 opacity-70" />
                                          {item.orderedByName}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center justify-between gap-2">
                                      {intensityText ? (
                                        <span className={intensityClass}>{intensityText}</span>
                                      ) : (
                                        <span />
                                      )}
                                      <span className="text-[10px] text-muted-foreground/70 tabular-nums shrink-0">
                                        ${formatCurrency(item.price)} ea
                                      </span>
                                    </div>
                                  </div>
                                  <span className="text-xs font-medium text-foreground/50 tabular-nums shrink-0">
                                    ${formatCurrency(item.price * group.count)}
                                  </span>
                                </div>

                                {(item.isCustomized || item.options || displayNote) && (
                                  <div className="pl-6 pt-1 space-y-1">
                                    {item.options?.removals && (
                                      <div className="text-[10px] text-red-500/80 flex items-start gap-1">
                                        <span className="font-semibold shrink-0">No:</span>
                                        <span className="line-through opacity-80">
                                          {item.options.removals}
                                        </span>
                                      </div>
                                    )}
                                    {item.options?.allergens && (
                                      <div className="text-[10px] text-emerald-600 flex items-center gap-1">
                                        <span className="font-semibold">Dietary:</span>{' '}
                                        {item.options.allergens}
                                      </div>
                                    )}
                                    {displayNote && (
                                      <div className="text-[10px] text-indigo-500/90 flex items-start gap-1 italic">
                                        <span className="font-semibold not-italic">Note:</span>{' '}
                                        &quot;{displayNote}&quot;
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Cart */}
              {hasCartItems && (
                <div className="space-y-2 order-1">
                  {/* Amber-tinted pending section */}
                  <div className="rounded-lg bg-amber-50/60 dark:bg-amber-500/5 border border-amber-200/40 dark:border-amber-500/10 p-2 space-y-1.5">
                    {/* Combined header + inline hint */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="relative">
                          <ChefHat className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                          Pending
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-amber-600/80 dark:text-amber-400/60 font-medium">
                          Not sent to kitchen
                        </span>
                        <button
                          onClick={clearCart}
                          data-testid="checkout-clear-all-btn"
                          className="text-[10px] text-red-500/70 hover:text-red-600 dark:text-red-400/60 dark:hover:text-red-400 font-medium underline underline-offset-2 transition-colors"
                        >
                          Clear all
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {groupedCartItems.map((group) => {
                        const item = group.item;
                        const displayNote = item.notes || item.options?.note;
                        const intensityText = item.options?.spiciness
                          ? `Spiciness: ${item.options.spiciness}`
                          : item.options?.sweetness
                            ? `Sweetness: ${item.options.sweetness}`
                            : null;
                        const intensityClass = item.options?.sweetness
                          ? 'text-[10px] text-pink-600 dark:text-pink-400 font-medium truncate'
                          : 'text-[10px] text-orange-600 dark:text-orange-400 font-medium truncate';
                        return (
                          <div
                            key={group.key}
                            data-testid={`cart-group-${item.name}`}
                            className="p-2 rounded-xl bg-card border border-amber-200/50 dark:border-amber-500/20 shadow-sm relative overflow-hidden group"
                          >
                            {/* Background dash pattern for "draft" feel */}
                            <div className="absolute inset-0 border-2 border-dashed border-amber-300/40 dark:border-amber-500/20 rounded-xl pointer-events-none" />

                            <div className="relative">
                              {/* Row 1: Name & Total Price & Edit Button */}
                              <div className="flex justify-between items-start mb-1 gap-2">
                                <div className="flex flex-col gap-0.5 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-[13px] text-foreground leading-tight line-clamp-1 break-all">
                                      {item.name}
                                    </span>
                                    {onEditItem && (
                                      <button
                                        onClick={() => onEditItem(group.instances[0])}
                                        data-testid="modify-item-btn"
                                        className="h-5 px-1.5 flex items-center justify-center rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors active:scale-95 flex-shrink-0 gap-1"
                                        title={
                                          group.count > 1
                                            ? 'Modify one of these items'
                                            : 'Edit item details'
                                        }
                                      >
                                        <SlidersHorizontal className="w-3 h-3" />
                                        <span className="text-[9px] font-medium leading-none pb-px">
                                          {group.count > 1 ? 'Modify one' : 'Modify'}
                                        </span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <span className="font-bold text-[13px] text-foreground tabular-nums shrink-0">
                                  ${formatCurrency(item.price * group.count)}
                                </span>
                              </div>

                              {/* Row 2: Unit Price */}
                              <div className="flex justify-between items-center mb-1.5 min-h-[16px] gap-2">
                                {intensityText ? (
                                  <span className={intensityClass}>{intensityText}</span>
                                ) : (
                                  <span />
                                )}
                                <span className="text-[10px] text-muted-foreground/70 font-medium tabular-nums">
                                  ${formatCurrency(item.price)} ea
                                </span>
                              </div>

                              {/* Customization Options Display */}
                              {(item.options && Object.keys(item.options).length > 0) ||
                              displayNote ? (
                                <div className="mb-1.5 space-y-0.5 bg-muted/40 p-2 rounded-lg border border-border/50 text-[10px]">
                                  {item.options?.removals && (
                                    <div className="text-red-600 dark:text-red-400">
                                      <span className="font-semibold text-foreground/70">No:</span>{' '}
                                      {item.options.removals}
                                    </div>
                                  )}
                                  {item.options?.allergens && (
                                    <div className="text-emerald-600 dark:text-emerald-400">
                                      <span className="font-semibold text-foreground/70">
                                        Dietary:
                                      </span>{' '}
                                      {item.options.allergens}
                                    </div>
                                  )}
                                  {displayNote && (
                                    <div className="text-indigo-600 dark:text-indigo-400 italic">
                                      &quot;{displayNote}&quot;
                                    </div>
                                  )}
                                </div>
                              ) : null}

                              {/* Row 3: User Badge, Custom Badge & Controls */}
                              <div className="flex justify-between items-end">
                                <div className="flex items-center gap-1.5 pb-0.5">
                                  {item.orderedByName && (
                                    <span className="text-[10px] font-medium text-amber-900/40 dark:text-amber-100/40 bg-amber-100/50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                      <User className="w-3 h-3 opacity-70" />
                                      {item.orderedByName}
                                    </span>
                                  )}

                                  {item.isCustomized ? (
                                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-md border border-amber-200/60 w-fit">
                                      🍽️ Custom
                                    </span>
                                  ) : null}
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-0.5 bg-muted/60 rounded-lg p-0.5 ml-auto">
                                  <button
                                    onClick={() => handleDecrement(group)}
                                    data-testid={`checkout-item-decrement-${item.menuItemId}`}
                                    className={cn(
                                      'w-7 h-7 rounded-md flex items-center justify-center transition-all active:scale-95 shadow-sm',
                                      group.count === 1
                                        ? 'bg-white dark:bg-zinc-800 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                        : 'bg-white dark:bg-zinc-800 text-muted-foreground hover:text-foreground',
                                    )}
                                  >
                                    {group.count === 1 ? (
                                      <Trash2 className="w-3.5 h-3.5" />
                                    ) : (
                                      <Minus className="w-3.5 h-3.5" />
                                    )}
                                  </button>

                                  <span
                                    className="font-mono font-bold text-xs w-6 text-center text-foreground tabular-nums"
                                    data-testid="item-quantity"
                                  >
                                    {group.count}
                                  </span>

                                  <button
                                    onClick={() => handleIncrement(group)}
                                    data-testid={`checkout-item-increment-${item.menuItemId}`}
                                    className="w-7 h-7 rounded-md bg-foreground text-background flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-sm"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>{' '}
                  {/* close amber wrapper */}
                </div>
              )}
            </div>
            {/* Added testid to footer container, but actually let's add it to the main motion div */}

            {/* Footer */}
            <div
              className={cn(
                'px-3 pt-2 pb-3 border-t border-border/40 bg-card/95 shrink-0 transition-transform duration-200',
                !isOnline && '-translate-y-6',
              )}
            >
              <div className="flex justify-between items-end">
                {/* Left Side: Breakdown */}
                <div className="flex flex-col text-[10px] text-muted-foreground leading-tight space-y-0.5 w-1/2">
                  <div className="flex justify-between gap-2">
                    <span>Subtotal</span>
                    <span>
                      $
                      {ordersTotal.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Tax (8%)</span>
                    <span>
                      $
                      {(ordersTotal * 0.08).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                {/* Right Side: Total */}
                <div className="flex flex-col items-end leading-none">
                  <span className="text-[10px] text-muted-foreground font-medium mb-0.5">
                    Total Due
                  </span>
                  <span className="font-bold text-red-500 text-sm">
                    $
                    {(ordersTotal * 1.08).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              {hasCartItems && (
                <div className="mt-2 pt-2 border-t border-dashed border-border/40 flex justify-between items-center text-[10px]">
                  <span className="text-muted-foreground font-medium">
                    + {cartItems.length} pending ($
                    {cartItems
                      .reduce((a, b) => a + b.price, 0)
                      .toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    )
                  </span>
                  <div className="flex gap-1 items-baseline">
                    <span className="font-medium text-muted-foreground">Grand Total:</span>
                    <span className="font-bold text-foreground text-xs">
                      $
                      {(grandSubtotal * 1.08).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-2 flex gap-2">
                {/* Pay Bill Button - Always visible if there are orders, distinct style */}
                {hasOrders && (
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing || !isOnline}
                    data-testid="pay-bill-btn"
                    className={cn(
                      'flex-1 h-10 border border-border/50 bg-secondary/50 text-foreground font-semibold rounded-xl text-xs',
                      'active:scale-[0.98] transition-all duration-200 hover:bg-secondary/80',
                      'flex items-center justify-center gap-1.5 whitespace-nowrap px-3',
                      'disabled:pointer-events-none disabled:cursor-not-allowed',
                      (isProcessing || !isOnline) && 'opacity-60 cursor-not-allowed',
                    )}
                  >
                    <CreditCard className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {!isOnline
                        ? 'Pay (Offline)'
                        : `Pay $${(ordersTotal * 1.08).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`}
                    </span>
                  </button>
                )}

                {/* Send to Kitchen Button - Only if cart has items */}
                {hasCartItems ? (
                  <button
                    onClick={handleSendToKitchen}
                    disabled={isProcessing || !isOnline}
                    data-testid="send-order-btn"
                    className={cn(
                      'flex-[2] h-10 bg-foreground text-background font-semibold rounded-xl text-sm',
                      'shadow-md hover:shadow-lg',
                      'active:scale-[0.98] transition-all duration-200',
                      'flex items-center justify-center gap-2',
                      'disabled:pointer-events-none disabled:cursor-not-allowed',
                      (isProcessing || !isOnline) && 'opacity-60 cursor-not-allowed',
                    )}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <>
                        {!isOnline ? (
                          <>
                            <WifiOff className="w-4 h-4 opacity-70" />
                            <span>Send Disabled</span>
                          </>
                        ) : (
                          <>
                            <ChefHat className="w-4 h-4 opacity-70" />
                            <span>Send Order</span>
                          </>
                        )}
                      </>
                    )}
                  </button>
                ) : (
                  // If no cart items but has orders, the Pay button should probably take full width or be consistent
                  !hasCartItems &&
                  hasOrders && (
                    <div className="hidden" /> // Pay button takes clear precedence via flex-1 above
                  )
                )}
              </div>

              {!isOnline && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium text-center mt-1">
                  Send and Pay are unavailable offline.
                </p>
              )}

              {/* If no cart items, make Pay full width */}
              {!hasCartItems && hasOrders && (
                <style
                  dangerouslySetInnerHTML={{
                    __html: `button:has(.lucide-credit-card) { flex: 1 1 100% !important; background: #000; color: #fff; border: none; }`,
                  }}
                />
              )}

              {error && (
                <p className="text-red-500 font-medium text-xs text-center mt-2 animate-in fade-in slide-in-from-bottom-2">
                  {error}
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
