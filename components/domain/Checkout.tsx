'use client';

import { useTableSession } from '@/components/providers/TableSessionProvider';
import { CheckoutFooter } from '@/components/domain/checkout/CheckoutFooter';
import {
  type GroupedCartItem,
  groupCartItems,
  groupItemsByUser,
} from '@/features/cart/domain/grouping';
import {
  computeOrdersSubtotal,
  computeSubtotal,
  formatCurrency,
} from '@/features/cart/domain/money';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { cn } from '@/lib/utils';
import { CartItem } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  ChefHat,
  Clock,
  Minus,
  Plus,
  SlidersHorizontal,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

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
  const [success, setSuccess] = useState<string | null>(null);
  const cartItems = useMemo(() => session?.cart ?? [], [session?.cart]);
  const orders = useMemo(() => session?.orders ?? [], [session?.orders]);

  const cartSubtotal = useMemo(() => computeSubtotal(cartItems), [cartItems]);
  const ordersTotal = useMemo(() => computeOrdersSubtotal(orders), [orders]);
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
    setSuccess(null);
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
    setSuccess(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      clearCart();
      setSuccess('Payment successful. (Simulated)');
      onClose();
    } catch (err) {
      setError('Payment failed. Please try again.');
      console.error('Payment Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const toTestIdFragment = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'unassigned';

  const groupedCartItems = useMemo(() => groupCartItems(cartItems), [cartItems]);
  const groupedPendingByUser = useMemo(
    () => groupItemsByUser(groupedCartItems),
    [groupedCartItems],
  );

  const groupedKitchenOrders = useMemo(
    () =>
      sortedOrders.map((order) => {
        const groups = groupCartItems(order.items);
        return { order, userGroups: groupItemsByUser(groups) };
      }),
    [sortedOrders],
  );

  if (!hasCartItems && !hasOrders) {
    return null;
  }

  const handleIncrement = (group: GroupedCartItem) => {
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

  const handleDecrement = (group: GroupedCartItem) => {
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
                    {groupedKitchenOrders.map(({ order, userGroups }) => (
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
                        <div className="space-y-2 pl-2 border-l-2 border-border/50">
                          {userGroups.map((userGroup) => (
                            <div key={`${order.id}-${userGroup.key}`} className="space-y-1">
                              <div
                                data-testid={`checkout-kitchen-user-group-${toTestIdFragment(userGroup.label)}`}
                                className="flex items-center justify-between pr-2 py-1"
                              >
                                <span className="text-[10px] font-medium text-amber-900/60 dark:text-amber-100/60 bg-amber-100/50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-md flex items-center gap-1 w-fit">
                                  <User className="w-3 h-3 opacity-70" />
                                  {userGroup.label}
                                </span>
                                <span className="text-[9px] text-muted-foreground/70 tabular-nums">
                                  {userGroup.totalQuantity} item
                                  {userGroup.totalQuantity > 1 ? 's' : ''}
                                </span>
                              </div>

                              {userGroup.groups.map((group) => {
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
                                      <div className="min-w-0 flex-1 space-y-1">
                                        <div className="flex items-baseline gap-2 min-w-0">
                                          <span className="text-xs font-medium text-foreground/80">
                                            {group.count}x
                                          </span>
                                          <span className="text-xs text-foreground/70 truncate">
                                            {item.name}
                                          </span>
                                        </div>
                                        {intensityText && (
                                          <span className={intensityClass}>{intensityText}</span>
                                        )}
                                      </div>
                                      <div className="w-[72px] shrink-0 text-right leading-tight space-y-0.5">
                                        <span className="block text-xs font-medium text-foreground/50 tabular-nums">
                                          ${formatCurrency(item.price * group.count)}
                                        </span>
                                        <span className="block text-[10px] text-muted-foreground/70 tabular-nums">
                                          ${formatCurrency(item.price)} ea
                                        </span>
                                      </div>
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
                          ))}
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

                    <div className="space-y-2">
                      {groupedPendingByUser.map((userGroup) => (
                        <div key={userGroup.key} className="space-y-1.5">
                          <div
                            data-testid={`checkout-pending-user-group-${toTestIdFragment(userGroup.label)}`}
                            className="flex items-center justify-between px-1"
                          >
                            <span className="text-[10px] font-medium text-amber-900/60 dark:text-amber-100/60 bg-amber-100/50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-md flex items-center gap-1 w-fit">
                              <User className="w-3 h-3 opacity-70" />
                              {userGroup.label}
                            </span>
                            <span className="text-[9px] text-muted-foreground/70 tabular-nums">
                              {userGroup.totalQuantity} item{userGroup.totalQuantity > 1 ? 's' : ''}
                            </span>
                          </div>

                          {userGroup.groups.map((group) => {
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
                                    <div className="flex flex-1 flex-col gap-0.5 min-w-0">
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
                                      {intensityText && (
                                        <span className={intensityClass}>{intensityText}</span>
                                      )}
                                    </div>
                                    <div className="w-[78px] shrink-0 text-right leading-tight space-y-0.5">
                                      <span className="block font-bold text-[13px] text-foreground tabular-nums">
                                        ${formatCurrency(item.price * group.count)}
                                      </span>
                                      <span className="block text-[10px] text-muted-foreground/70 font-medium tabular-nums">
                                        ${formatCurrency(item.price)} ea
                                      </span>
                                    </div>
                                  </div>

                                  {/* Customization Options Display */}
                                  {(item.options && Object.keys(item.options).length > 0) ||
                                  displayNote ? (
                                    <div className="mb-1.5 space-y-0.5 bg-muted/40 p-2 rounded-lg border border-border/50 text-[10px]">
                                      {item.options?.removals && (
                                        <div className="text-red-600 dark:text-red-400">
                                          <span className="font-semibold text-foreground/70">
                                            No:
                                          </span>{' '}
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
                      ))}
                    </div>
                  </div>{' '}
                  {/* close amber wrapper */}
                </div>
              )}
            </div>
            {/* Added testid to footer container, but actually let's add it to the main motion div */}

            <CheckoutFooter
              isOnline={isOnline}
              hasCartItems={hasCartItems}
              hasOrders={hasOrders}
              isProcessing={isProcessing}
              pendingItemCount={cartItems.length}
              ordersTotal={ordersTotal}
              cartSubtotal={cartSubtotal}
              grandSubtotal={grandSubtotal}
              onPay={handlePayment}
              onSend={handleSendToKitchen}
              error={error}
              success={success}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

Checkout.displayName = 'Checkout';
