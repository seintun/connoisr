"use client";

import { useTableSession } from "@/components/providers/TableSessionProvider";
import { MENU_ITEMS, TAG_EMOJIS } from "@/lib/menu";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChefHat, Clock, CreditCard, Minus, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Checkout({ isOpen, onClose }: CheckoutProps) {
  const { session, clearCart, updateItemQuantity, sendOrder } = useTableSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            className="fixed bottom-0 left-0 right-0 sm:bottom-4 sm:left-4 sm:right-4 z-50 bg-white/95 backdrop-blur-2xl rounded-t-[1.75rem] sm:rounded-[2rem] shadow-[0_-8px_40px_-10px_rgba(0,0,0,0.25)] max-h-[85vh] flex flex-col border border-white/50 overflow-hidden ring-1 ring-black/5"
          >
            {/* Header */}
            <div className="pt-2 pb-0 shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-300/80 mx-auto mb-2" />
              <div className="flex justify-between items-center px-5 pb-3 border-b border-gray-100/60">
                <h2 className="text-base font-serif font-bold text-foreground">Your Table</h2>
                <button 
                  onClick={onClose}
                  className="w-9 h-9 flex items-center justify-center hover:bg-neutral-100 rounded-full transition-all active:scale-95 -mr-1"
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
                            <span className="text-[10px] font-medium text-muted-foreground bg-neutral-100 px-1.5 py-0.5 rounded-md uppercase">
                              {order.status === 'ordered' ? 'Order Placed' :
                               order.status === 'cooking' ? 'Preparing' :
                               order.status === 'ready' ? 'Ready to Serve' :
                               order.status} • {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        <div className="space-y-1 pl-2 border-l-2 border-neutral-100">
                           {order.items.map((item) => (
                             <div key={item.id} className="py-1 pr-2">
                               <div className="flex justify-between items-baseline">
                                 <div className="flex items-baseline gap-2">
                                   <span className="text-xs font-medium text-foreground/80">{item.quantity}x</span>
                                   <span className="text-xs text-foreground/70">{item.name}</span>
                                 </div>
                                 <span className="text-xs font-medium text-foreground/50">${(item.price * item.quantity).toFixed(2)}</span>
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
                  <div className="flex items-center gap-2 px-1 mb-1">
                    <ChefHat className="w-4 h-4 text-orange-500" />
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">New Items</h3>
                  </div>
                  
                  {groupItems(session.cart).map(([category, items]) => (
                    <div key={category} className="space-y-1">
                      <h4 className="font-medium text-[10px] text-muted-foreground/50 uppercase tracking-[0.15em] px-1 mt-2">
                        {category}
                      </h4>
                      <div className="space-y-1">
                        {items.map((item) => (
                          <div 
                            key={item.id} 
                            className="py-2.5 px-3 rounded-xl bg-white/70 border border-gray-100/60 hover:border-border/40 transition-colors"
                          >
                            <div className="flex items-baseline justify-between gap-3 mb-1.5">
                              <span className="font-semibold text-[13px] text-foreground leading-tight line-clamp-1 flex-1 min-w-0 flex items-center gap-1.5">
                                {item.name}
                                {item.isCustomized && (
                                  <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-md border border-amber-200/60">🍽️ Custom</span>
                                )}
                              </span>
                              <span className="font-semibold text-[13px] text-foreground tabular-nums shrink-0">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                            


                            {/* Tags (Static) */}
                            {(() => {
                              const menuDef = MENU_ITEMS.find(i => i.id === item.menuItemId);
                              const tags = menuDef?.tags || item.tags || [];
                              if (tags.length === 0) return null;
                              
                              return (
                                <div className="flex flex-wrap gap-1 mb-2 ml-1">
                                  {tags.map(tag => (
                                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100/80 text-neutral-500 border border-neutral-200/50 flex items-center gap-1" title={tag}>
                                      <span className="grayscale opacity-70">{TAG_EMOJIS[tag]}</span>
                                      <span>{tag}</span>
                                    </span>
                                  ))}
                                </div>
                              );
                            })()}
                            
                            {/* Customization Options */}
                             {item.options && Object.keys(item.options).length > 0 && (
                               <div className="mb-2 space-y-0.5 bg-neutral-50/50 p-1.5 rounded-lg border border-neutral-100">
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
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-muted-foreground/60">
                                ${item.price.toFixed(2)} ea
                              </span>
                              <div className="flex items-center gap-0.5 bg-neutral-100/90 rounded-lg p-0.5">
                                <button
                                  onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                  className={cn(
                                    "w-8 h-8 rounded-md flex items-center justify-center transition-all active:scale-90",
                                    item.quantity === 1
                                      ? "bg-white text-red-400 hover:text-red-500 shadow-sm"
                                      : "bg-white text-foreground/70 hover:text-foreground shadow-sm"
                                  )}
                                >
                                  {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                                </button>
                                <span className="font-mono font-bold text-xs w-7 text-center text-foreground">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                  className="w-8 h-8 rounded-md bg-foreground text-background flex items-center justify-center hover:opacity-90 transition-all active:scale-90 shadow-sm"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 pt-2.5 pb-5 sm:pb-4 border-t border-gray-100/60 bg-gradient-to-b from-neutral-50/90 to-white/80 shrink-0">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground/60 mb-3 px-1">
                <span>Total Items: {session.cart.reduce((a,b)=>a+b.quantity,0) + (session.orders||[]).reduce((a,b)=>a+b.items.reduce((c,d)=>c+d.quantity,0),0)}</span>
                <div className="flex gap-2">
                   <span>Tax ${tax.toFixed(2)}</span>
                   <span className="font-bold text-foreground">Total ${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                {/* Pay Bill Button - Always visible if there are orders, distinct style */}
                {hasOrders && (
                   <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className={cn(
                      "flex-1 h-12 border border-foreground/10 bg-white text-foreground font-semibold rounded-2xl text-[14px]",
                      "active:scale-[0.98] transition-all duration-200",
                      "flex items-center justify-center gap-2",
                      isProcessing && "opacity-60 cursor-not-allowed"
                    )}
                   >
                     <CreditCard className="w-4 h-4" />
                     <span>Pay Bill</span>
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
