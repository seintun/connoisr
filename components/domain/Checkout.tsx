'use client';

import { useTableSession } from '@/components/providers/TableSessionProvider';
import { MENU_ITEMS, TAG_EMOJIS } from '@/lib/menu';
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
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  onEditItem?: (item: CartItem) => void;
}

export function Checkout({ isOpen, onClose, onEditItem }: CheckoutProps) {
  const { session, clearCart, sendOrder, removeItem, addItem } = useTableSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idleMinutes, setIdleMinutes] = useState(0);
  const cartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cartAddedAtRef = useRef<number | null>(null);

  // Track how long items have been sitting in the cart
  useEffect(() => {
    if (session && session.cart.length > 0) {
      if (!cartAddedAtRef.current) cartAddedAtRef.current = Date.now();
      cartTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - (cartAddedAtRef.current || Date.now())) / 60000);
        setIdleMinutes(elapsed);
      }, 30000); // Update every 30s
      return () => {
        if (cartTimerRef.current) clearInterval(cartTimerRef.current);
      };
    } else {
      cartAddedAtRef.current = null;
      setIdleMinutes(0);
      if (cartTimerRef.current) clearInterval(cartTimerRef.current);
    }
  }, [session]);

  if (!session) return null;

  const cartSubtotal = session.cart.reduce(
    (acc, item) => acc + item.price, // Quantity is always 1 per instance
    0,
  );

  const ordersTotal = (session.orders || []).reduce((acc, order) => acc + order.total, 0);
  const grandSubtotal = cartSubtotal + ordersTotal;

  const hasCartItems = session.cart.length > 0;
  const hasOrders = (session.orders || []).length > 0;

  if (!hasCartItems && !hasOrders) {
    return null;
  }

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

  const getItemTags = (item: CartItem) => {
    const menuDef = MENU_ITEMS.find((menuItem) => menuItem.id === item.menuItemId);
    return menuDef?.tags || item.tags || [];
  };

  // Group instances by display identity
  const groupInstances = (items: CartItem[]): GroupedItem[] => {
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
  };

  const groupedCartItems = groupInstances(session.cart);

  // Group by Category for display headers
  const getCategoryGroups = (groupedItems: GroupedItem[]) => {
    const catGroups: Record<string, typeof groupedItems> = {};

    groupedItems.forEach((group) => {
      const category = group.item.category;
      if (!catGroups[category]) catGroups[category] = [];
      catGroups[category].push(group);
    });

    return Object.entries(catGroups);
  };

  const categoryGroups = getCategoryGroups(groupedCartItems);

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
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-6 overscroll-contain">
              {/* Previous Orders */}
              {hasOrders && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Kitchen Orders
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {(session.orders || []).map((order) => (
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
                          {groupInstances(order.items).map((group) => {
                            const item = group.item;
                            const tags = getItemTags(item);
                            const displayNote = item.notes || item.options?.note;
                            return (
                              <div key={group.key} className="py-1 pr-2">
                                <div className="flex justify-between items-baseline gap-2">
                                  <div className="min-w-0">
                                    <div className="flex items-baseline gap-2 min-w-0">
                                      <span className="text-xs font-medium text-foreground/80">
                                        {group.count}x
                                      </span>
                                      <span className="text-xs text-foreground/70 truncate">
                                        {item.name}
                                      </span>
                                      {item.orderedByName && (
                                        <span className="text-[9px] text-muted-foreground/60 font-medium truncate">
                                          · {item.orderedByName}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground/70 tabular-nums">
                                      ${formatCurrency(item.price)} ea
                                    </div>
                                  </div>
                                  <span className="text-xs font-medium text-foreground/50 tabular-nums shrink-0">
                                    ${formatCurrency(item.price * group.count)}
                                  </span>
                                </div>

                                {(tags.length > 0 ||
                                  item.isCustomized ||
                                  item.options ||
                                  displayNote) && (
                                  <div className="pl-6 pt-1 space-y-1">
                                    {tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {tags.map((tag) => (
                                          <span
                                            key={tag}
                                            className="text-[9px] px-1.5 py-0.5 rounded border border-border/50 bg-muted/50 text-muted-foreground font-medium leading-none"
                                          >
                                            {TAG_EMOJIS[tag] ? `${TAG_EMOJIS[tag]} ` : ''}
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    {item.options?.spiciness && (
                                      <div className="text-[10px] text-orange-600 flex items-center gap-1">
                                        <span className="font-semibold">Spiciness:</span>{' '}
                                        {item.options.spiciness}
                                      </div>
                                    )}
                                    {item.options?.sweetness && (
                                      <div className="text-[10px] text-pink-600 flex items-center gap-1">
                                        <span className="font-semibold">Sweetness:</span>{' '}
                                        {item.options.sweetness}
                                      </div>
                                    )}
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
                <div className="space-y-2">
                  {hasOrders && <div className="h-px bg-border/40 my-4" />}
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

                    {/* Idle timer nudge */}
                    {idleMinutes >= 2 && (
                      <motion.div
                        initial={{ opacity: 0, y: -3 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-orange-100/80 dark:bg-orange-500/10 border border-orange-300/40 dark:border-orange-500/20"
                      >
                        <Clock className="w-3 h-3 text-orange-600 dark:text-orange-400 shrink-0" />
                        <span className="text-[10px] text-orange-700 dark:text-orange-300 font-medium">
                          Waiting {idleMinutes} min — ready to send?
                        </span>
                      </motion.div>
                    )}

                    {categoryGroups.map(([category, groups]) => (
                      <div key={category} className="space-y-1">
                        <h4 className="font-medium text-[10px] text-muted-foreground/50 uppercase tracking-[0.15em] px-0.5 mt-2">
                          {category}
                        </h4>
                        <div className="space-y-1">
                          {groups.map((group) => {
                            const item = group.item;
                            const displayNote = item.notes || item.options?.note;
                            const tags = getItemTags(item);
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

                                  {/* Row 2: Tags & Unit Price */}
                                  <div className="flex justify-between items-center mb-1.5 min-h-[16px]">
                                    <div className="flex flex-wrap gap-1">
                                      {tags.map((tag) => {
                                        let colorClass =
                                          'bg-secondary text-secondary-foreground border-border/50';
                                        if (['Spicy'].includes(tag))
                                          colorClass =
                                            'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20';
                                        else if (['Vegetarian', 'Vegan'].includes(tag))
                                          colorClass =
                                            'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
                                        else if (['GF', 'Gluten Free'].includes(tag))
                                          colorClass =
                                            'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
                                        else if (['Seafood', 'Shellfish'].includes(tag))
                                          colorClass =
                                            'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
                                        else if (['Sweet'].includes(tag))
                                          colorClass =
                                            'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-500/10 dark:text-pink-400 dark:border-pink-500/20';
                                        else if (['Alcohol'].includes(tag))
                                          colorClass =
                                            'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20';
                                        else if (['Nuts', 'Nut Free'].includes(tag))
                                          colorClass =
                                            'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-500/10 dark:text-stone-400 dark:border-stone-500/20';

                                        const emoji = TAG_EMOJIS[tag];

                                        return (
                                          <span
                                            key={tag}
                                            className={cn(
                                              'text-[9px] px-1.5 py-0.5 rounded border flex items-center gap-0.5 font-medium leading-none',
                                              colorClass,
                                            )}
                                          >
                                            {emoji && (
                                              <span className="opacity-80 scale-75">{emoji}</span>
                                            )}
                                            <span>{tag}</span>
                                          </span>
                                        );
                                      })}
                                    </div>

                                    <span className="text-[10px] text-muted-foreground/70 font-medium tabular-nums">
                                      ${formatCurrency(item.price)} ea
                                    </span>
                                  </div>

                                  {/* Customization Options Display */}
                                  {(item.options && Object.keys(item.options).length > 0) ||
                                  displayNote ? (
                                    <div className="mb-1.5 space-y-0.5 bg-muted/40 p-2 rounded-lg border border-border/50 text-[10px]">
                                      {item.options?.spiciness && (
                                        <div className="text-orange-600 dark:text-orange-400">
                                          <span className="font-semibold text-foreground/70">
                                            Spiciness:
                                          </span>{' '}
                                          {item.options.spiciness}
                                        </div>
                                      )}
                                      {item.options?.sweetness && (
                                        <div className="text-pink-600 dark:text-pink-400">
                                          <span className="font-semibold text-foreground/70">
                                            Sweetness:
                                          </span>{' '}
                                          {item.options.sweetness}
                                        </div>
                                      )}
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
                      </div>
                    ))}
                  </div>{' '}
                  {/* close amber wrapper */}
                </div>
              )}
            </div>
            {/* Added testid to footer container, but actually let's add it to the main motion div */}

            {/* Footer */}
            <div className="px-3 pt-2 pb-3 border-t border-border/40 bg-card/95 shrink-0">
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
                    + {session.cart.length} pending ($
                    {session.cart
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
                    disabled={isProcessing}
                    data-testid="pay-bill-btn"
                    className={cn(
                      'flex-1 h-10 border border-border/50 bg-secondary/50 text-foreground font-semibold rounded-xl text-xs',
                      'active:scale-[0.98] transition-all duration-200 hover:bg-secondary/80',
                      'flex items-center justify-center gap-1.5 whitespace-nowrap px-3',
                      isProcessing && 'opacity-60 cursor-not-allowed',
                    )}
                  >
                    <CreditCard className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Pay $
                      {(ordersTotal * 1.08).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </button>
                )}

                {/* Send to Kitchen Button - Only if cart has items */}
                {hasCartItems ? (
                  <button
                    onClick={handleSendToKitchen}
                    disabled={isProcessing}
                    data-testid="send-order-btn"
                    className={cn(
                      'flex-[2] h-10 bg-foreground text-background font-semibold rounded-xl text-sm',
                      'shadow-md hover:shadow-lg',
                      'active:scale-[0.98] transition-all duration-200',
                      'flex items-center justify-center gap-2',
                      isProcessing && 'opacity-60 cursor-not-allowed',
                    )}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <>
                        <ChefHat className="w-4 h-4 opacity-70" />
                        <span>Send Order</span>
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
