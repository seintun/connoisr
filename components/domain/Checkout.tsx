"use client";

import { useTableSession } from "@/components/providers/TableSessionProvider";
import { MENU_ITEMS } from "@/lib/menu";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { CreditCard, Minus, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Checkout({ isOpen, onClose }: CheckoutProps) {
  const { session, clearCart, updateItemQuantity } = useTableSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session || session.cart.length === 0) {
    return null;
  }

  const subtotal = session.cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      clearCart();
      onClose();
      alert("Payment successful! (Simulated)");
    } catch (err) {
      setError("Payment failed. Please try again.");
      console.error("Payment Error:", err);
    } finally {
      setIsProcessing(false);
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
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="fixed bottom-0 left-0 right-0 sm:bottom-4 sm:left-4 sm:right-4 z-50 bg-white/95 backdrop-blur-2xl rounded-t-[1.75rem] sm:rounded-[2rem] shadow-[0_-8px_40px_-10px_rgba(0,0,0,0.25)] max-h-[75vh] flex flex-col border border-white/50 overflow-hidden ring-1 ring-black/5"
          >
            {/* Drag handle + Header */}
            <div className="pt-2 pb-0">
              <div className="w-10 h-1 rounded-full bg-gray-300/80 mx-auto mb-2" />
              <div className="flex justify-between items-center px-5 pb-3 border-b border-gray-100/60">
                <h2 className="text-base font-serif font-bold text-foreground">Your Order</h2>
                <button 
                  onClick={onClose}
                  className="w-9 h-9 flex items-center justify-center hover:bg-neutral-100 rounded-full transition-all active:scale-95 -mr-1"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Cart Items - Scrollable & Grouped */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 overscroll-contain">
              {Object.entries(
                session.cart.reduce((groups, item) => {
                  const category = item.category || 
                    MENU_ITEMS.find(m => m.id === item.menuItemId)?.category || 
                    "Other";
                    
                  if (!groups[category]) groups[category] = [];
                  groups[category].push(item);
                  return groups;
                }, {} as Record<string, typeof session.cart>)
              ).map(([category, items]) => (
                <div key={category} className="space-y-1">
                  <h3 className="font-medium text-[10px] text-muted-foreground/50 uppercase tracking-[0.15em] px-1">
                    {category}
                  </h3>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <div 
                        key={item.id} 
                        className="py-2.5 px-3 rounded-xl bg-white/70 border border-gray-100/60 hover:border-border/40 transition-colors"
                      >
                        {/* Row 1: Name + Line total */}
                        <div className="flex items-baseline justify-between gap-3 mb-1.5">
                          <span className="font-semibold text-[13px] text-foreground leading-tight line-clamp-1 flex-1 min-w-0">
                            {item.name}
                          </span>
                          <span className="font-semibold text-[13px] text-foreground tabular-nums shrink-0">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        {/* Row 2: Unit price + Quantity stepper */}
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
                              {item.quantity === 1 ? (
                                <Trash2 className="w-3.5 h-3.5" />
                              ) : (
                                <Minus className="w-3.5 h-3.5" />
                              )}
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

            {/* Footer — Fluid & Modern */}
            <div className="px-4 pt-2.5 pb-5 sm:pb-4 border-t border-gray-100/60 bg-gradient-to-b from-neutral-50/90 to-white/80">
              {/* Subtotal + Tax info line */}
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60 mb-2.5 px-1">
                <span>Subtotal ${subtotal.toFixed(2)}</span>
                <span className="text-gray-200">•</span>
                <span>Tax ${tax.toFixed(2)}</span>
              </div>

              {/* Pay Button — contains the total */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className={cn(
                  "w-full h-12 bg-foreground text-background font-semibold rounded-2xl text-[15px]",
                  "shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15",
                  "active:scale-[0.98] transition-all duration-200",
                  "flex items-center justify-center gap-2.5",
                  isProcessing && "opacity-60 cursor-not-allowed"
                )}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    <span>Processing…</span>
                  </div>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 opacity-70" />
                    <span>Pay</span>
                    <span className="font-bold tabular-nums">${total.toFixed(2)}</span>
                  </>
                )}
              </button>
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
