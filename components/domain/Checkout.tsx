"use client";

import { useTableSession } from "@/components/providers/TableSessionProvider";
import { MENU_ITEMS, TAG_EMOJIS } from "@/lib/menu";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChefHat, Clock, CreditCard, Minus, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Checkout({ isOpen, onClose }: CheckoutProps) {
  const { session, clearCart, updateItemQuantity, sendOrder } = useTableSession();
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
      return () => { if (cartTimerRef.current) clearInterval(cartTimerRef.current); };
    } else {
      cartAddedAtRef.current = null;
      setIdleMinutes(0);
      if (cartTimerRef.current) clearInterval(cartTimerRef.current);
    }
  }, [session?.cart.length]);

  if (!session) return null;

  const cartSubtotal = session.cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  
  const ordersTotal = (session.orders || []).reduce((acc, order) => acc + order.total, 0);
  const grandSubtotal = cartSubtotal + ordersTotal;
  const tax = grandSubtotal * 0.08;
  const total = grandSubtotal + tax;

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
      setError("Failed to send order. Please try again.");
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
      // In a real app, we'd mark orders as paid in the backend
      clearCart(); // Clear any remaining cart items
      // We might want to clear the session or mark status as paid
      // session.orders = []; // This would need a clearSession method
      location.reload(); // Simple reset for prototype
      alert("Payment successful! (Simulated)");
    } catch (err) {
      setError("Payment failed. Please try again.");
      console.error("Payment Error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const groupItems = (items: typeof session.cart) => {
    return Object.entries(
      items.reduce((groups, item) => {
        const category = item.category || 
          MENU_ITEMS.find(m => m.id === item.menuItemId)?.category || 
          "Other";
          
        if (!groups[category]) groups[category] = [];
        groups[category].push(item);
        return groups;
      }, {} as Record<string, typeof items>)
    );
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
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="fixed bottom-0 left-0 right-0 sm:bottom-4 sm:left-4 sm:right-4 z-50 bg-card/95 backdrop-blur-2xl rounded-t-[1.75rem] sm:rounded-[2rem] shadow-[0_-8px_40px_-10px_rgba(0,0,0,0.5)] max-h-[85vh] flex flex-col border border-border/50 overflow-hidden ring-1 ring-black/5"
          >
            {/* Header */}
            <div className="pt-2 pb-0 shrink-0">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20 mx-auto mb-2" />
              <div className="flex justify-between items-center px-5 pb-3 border-b border-border/40">
                <h2 className="text-base font-serif font-bold text-foreground">Your Table</h2>
                <button 
                  onClick={onClose}
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
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Kitchen Orders</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {(session.orders || []).map((order) => (
                      <div key={order.id} className="opacity-80 grayscale-[0.3]">
                          <div className="flex items-center gap-2 mb-2 px-1">
                            <CheckCircle2 className={cn("w-3 h-3", 
                              order.status === 'ordered' ? 'text-blue-500' :
                              order.status === 'cooking' ? 'text-orange-500' :
                              order.status === 'ready' ? 'text-green-500' :
                              'text-muted-foreground'
                            )} />
                            <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md uppercase">
                              {order.status === 'ordered' ? 'Order Placed' :
                               order.status === 'cooking' ? 'Preparing' :
                               order.status === 'ready' ? 'Ready to Serve' :
                               order.status} • {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        <div className="space-y-1 pl-2 border-l-2 border-border/50">
                           {order.items.map((item) => (
                             <div key={item.id} className="py-1 pr-2">
                               <div className="flex justify-between items-baseline">
                                 <div className="flex items-baseline gap-2">
                                   <span className="text-xs font-medium text-foreground/80">{item.quantity}x</span>
                                   <span className="text-xs text-foreground/70">{item.name}</span>
                                   {item.orderedByName && (
                                     <span className="text-[9px] text-muted-foreground/60 font-medium">· {item.orderedByName}</span>
                                   )}
                                 </div>
                                 <span className="text-xs font-medium text-foreground/50">${(item.price * item.quantity).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                               </div>
                               {/* Customization Options */}
                               {item.options && Object.keys(item.options).length > 0 && (
                                 <div className="pl-6 pb-2 space-y-0.5">
                                   {item.options.spiciness && (
                                     <div className="text-[10px] text-orange-600 flex items-center gap-1">
                                       <span className="font-semibold">Spiciness:</span> {item.options.spiciness}
                                     </div>
                                   )}
                                   {item.options.removals && (
                                      <div className="text-[10px] text-red-500/80 flex items-start gap-1">
                                        <span className="font-semibold shrink-0">No:</span> 
                                        <span className="line-through opacity-80">{item.options.removals}</span>
                                      </div>
                                   )}
                                   {item.options.allergens && (
                                     <div className="text-[10px] text-emerald-600 flex items-center gap-1">
                                       <span className="font-semibold">Dietary:</span> {item.options.allergens}
                                     </div>
                                   )}
                                   {item.options.note && (
                                     <div className="text-[10px] text-indigo-500/90 flex items-start gap-1 italic">
                                       <span className="font-semibold not-italic">Note:</span> "{item.options.note}"
                                     </div>
                                   )}
                                 </div>
                               )}
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
                        <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Pending</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-amber-600/80 dark:text-amber-400/60 font-medium">Not sent to kitchen</span>
                        <button
                          onClick={clearCart}
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
                        <span className="text-[10px] text-orange-700 dark:text-orange-300 font-medium">Waiting {idleMinutes} min — ready to send?</span>
                      </motion.div>
                    )}

                    {groupItems(session.cart).map(([category, items]) => (
                      <div key={category} className="space-y-1">
                        <h4 className="font-medium text-[10px] text-muted-foreground/50 uppercase tracking-[0.15em] px-0.5">
                          {category}
                        </h4>
                        <div className="space-y-1">
                          {items.map((item) => (
                            <div 
                              key={item.id} 
                              className="p-2 rounded-xl bg-card border border-amber-200/50 dark:border-amber-500/20 shadow-sm relative overflow-hidden group"
                            >
                              {/* Background dash pattern for "draft" feel */}
                              <div className="absolute inset-0 border-2 border-dashed border-amber-300/40 dark:border-amber-500/20 rounded-xl pointer-events-none" />

                              <div className="relative">
                                {/* Row 1: Name & Total Price */}
                                <div className="flex justify-between items-start mb-1 gap-2">
                                  <span className="font-semibold text-[13px] text-foreground leading-tight line-clamp-1 break-all">
                                    {item.name}
                                  </span>
                                  <span className="font-bold text-[13px] text-foreground tabular-nums shrink-0">
                                    ${(item.price * item.quantity).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                  </span>
                                </div>

                                {/* Row 2: Tags & Unit Price */}
                                <div className="flex justify-between items-center mb-1.5 min-h-[16px]">
                                   <div className="flex flex-wrap gap-1">
                                      {/* Reusing existing tag logic */}
                                      {(() => {
                                        const menuDef = MENU_ITEMS.find(i => i.id === item.menuItemId);
                                        const tags = menuDef?.tags || item.tags || [];
                                        
                                        return tags.map(tag => {
                                          let colorClass = "bg-secondary text-secondary-foreground border-border/50";
                                          if (["Spicy"].includes(tag)) colorClass = "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20";
                                          else if (["Vegetarian", "Vegan"].includes(tag)) colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
                                          else if (["GF", "Gluten Free"].includes(tag)) colorClass = "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
                                          else if (["Seafood", "Shellfish"].includes(tag)) colorClass = "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
                                          else if (["Sweet"].includes(tag)) colorClass = "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-500/10 dark:text-pink-400 dark:border-pink-500/20";
                                          else if (["Alcohol"].includes(tag)) colorClass = "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20";
                                          else if (["Nuts", "Nut Free"].includes(tag)) colorClass = "bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-500/10 dark:text-stone-400 dark:border-stone-500/20";

                                          const emoji = TAG_EMOJIS[tag];

                                          return (
                                            <span key={tag} className={cn("text-[9px] px-1.5 py-0.5 rounded border flex items-center gap-0.5 font-medium leading-none", colorClass)}>
                                              {emoji && <span className="opacity-80 scale-75">{emoji}</span>}
                                              <span>{tag}</span>
                                            </span>
                                          )
                                        })
                                      })()}
                                   </div>
                                   
                                   <span className="text-[10px] text-muted-foreground/70 font-medium tabular-nums">
                                     ${item.price.toLocaleString('en-US', {minimumFractionDigits: 2})} ea
                                   </span>
                                </div>

                                {/* Customization Options Display */}
                                {item.options && Object.keys(item.options).length > 0 && (
                                   <div className="mb-1.5 space-y-0.5 bg-muted/40 p-2 rounded-lg border border-border/50 text-[10px]">
                                     {item.options.spiciness && <div className="text-orange-600 dark:text-orange-400"><span className="font-semibold text-foreground/70">Spiciness:</span> {item.options.spiciness}</div>}
                                     {item.options.removals && <div className="text-red-600 dark:text-red-400"><span className="font-semibold text-foreground/70">No:</span> {item.options.removals}</div>}
                                     {item.options.allergens && <div className="text-emerald-600 dark:text-emerald-400"><span className="font-semibold text-foreground/70">Dietary:</span> {item.options.allergens}</div>}
                                     {item.options.note && <div className="text-indigo-600 dark:text-indigo-400 italic">"{item.options.note}"</div>}
                                   </div>
                                )}

                                {/* Row 3: User Badge, Custom Badge & Controls */}
                                <div className="flex justify-between items-end">
                                   <div className="flex items-center gap-1.5 pb-0.5">
                                      {item.orderedByName && (
                                        <span className="text-[10px] font-medium text-amber-900/40 dark:text-amber-100/40 bg-amber-100/50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-md">
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
                                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                        className={cn(
                                          "w-7 h-7 rounded-md flex items-center justify-center transition-all active:scale-95 shadow-sm",
                                          item.quantity === 1
                                            ? "bg-white dark:bg-zinc-800 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            : "bg-white dark:bg-zinc-800 text-muted-foreground hover:text-foreground"
                                        )}
                                      >
                                        {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                                      </button>
                                      
                                      <span className="font-mono font-bold text-xs w-6 text-center text-foreground tabular-nums">
                                        {item.quantity}
                                      </span>

                                      <button 
                                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                        className="w-7 h-7 rounded-md bg-foreground text-background flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-sm"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                </div>
                              </div>
                            </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  </div> {/* close amber wrapper */}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 pt-2.5 pb-5 sm:pb-4 border-t border-border/40 bg-card/95 shrink-0">
               <div className="space-y-1.5 text-[11px] text-muted-foreground mb-3 px-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Ordered: {(session.orders||[]).reduce((a,b)=>a+b.items.reduce((c,d)=>c+d.quantity,0),0)} items</span>
                  <span className="font-semibold text-xs">Total Due: <span className="text-red-500 font-bold">${(ordersTotal * 1.08).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></span>
                </div>
                {hasCartItems && (
                  <div className="flex items-center justify-between pt-1 border-t border-border/30">
                    <span className="font-medium">+ {session.cart.reduce((a,b)=>a+b.quantity,0)} pending items</span>
                    <span className="font-medium">Grand Total: <span className="text-foreground font-bold">${(grandSubtotal * 1.08).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {/* Pay Bill Button - Always visible if there are orders, distinct style */}
                {hasOrders && (
                   <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className={cn(
                      "flex-1 h-12 border border-border/50 bg-secondary/50 text-foreground font-semibold rounded-2xl text-[13px]",
                      "active:scale-[0.98] transition-all duration-200 hover:bg-secondary/80",
                      "flex items-center justify-center gap-1.5 whitespace-nowrap px-4",
                      isProcessing && "opacity-60 cursor-not-allowed"
                    )}
                   >
                     <CreditCard className="w-4 h-4 shrink-0" />
                     <span>Pay ${(ordersTotal * 1.08).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                   </button>
                )}

                {/* Send to Kitchen Button - Only if cart has items */}
                {hasCartItems ? (
                  <button
                    onClick={handleSendToKitchen}
                    disabled={isProcessing}
                    className={cn(
                      "flex-[2] h-12 bg-foreground text-background font-semibold rounded-2xl text-[15px]",
                      "shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15",
                      "active:scale-[0.98] transition-all duration-200",
                      "flex items-center justify-center gap-2.5",
                      isProcessing && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <>
                        <ChefHat className="w-4 h-4 opacity-70" />
                        <span>Send to Kitchen</span>
                      </>
                    )}
                  </button>
                ) : (
                  // If no cart items but has orders, the Pay button should probably take full width or be consistent
                  !hasCartItems && hasOrders && (
                     <div className="hidden" /> // Pay button takes clear precedence via flex-1 above
                  )
                )}
              </div>
              
              {/* If no cart items, make Pay full width */}
              {!hasCartItems && hasOrders && (
                 <style dangerouslySetInnerHTML={{__html: `button:has(.lucide-credit-card) { flex: 1 1 100% !important; background: #000; color: #fff; border: none; }`}} />
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
