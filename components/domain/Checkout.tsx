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
  const tax = subtotal * 0.08; // Mock 8% tax
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
            className="fixed bottom-4 left-4 right-4 z-50 bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_-10px_60px_-15px_rgba(0,0,0,0.3)] max-h-[85vh] flex flex-col border border-white/50 overflow-hidden ring-1 ring-black/5"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-3.5 border-b border-gray-100/50 bg-white/50">
              <h2 className="text-lg font-serif font-bold text-foreground">Your Order</h2>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100 rounded-full transition-all active:scale-95"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Cart Items - Scrollable & Grouped */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
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
                <div key={category} className="space-y-1.5">
                  <h3 className="font-medium text-[10px] text-muted-foreground/60 uppercase tracking-[0.15em] pl-1">
                    {category}
                  </h3>
                  <div className="space-y-1.5">
                    {items.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-center gap-2 py-2 px-3 rounded-xl bg-white/60 border border-transparent hover:border-border/40 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm leading-tight truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground/70 mt-0.5">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 bg-neutral-100/80 p-0.5 rounded-lg shrink-0">
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            className={cn(
                              "w-7 h-7 rounded-md flex items-center justify-center transition-all",
                              item.quantity === 1
                                ? "bg-white text-destructive hover:bg-destructive/10 shadow-sm"
                                : "bg-white text-foreground hover:bg-white/80 shadow-sm"
                            )}
                          >
                            {item.quantity === 1 ? (
                              <Trash2 className="w-3 h-3" />
                            ) : (
                              <Minus className="w-3 h-3" />
                            )}
                          </button>
                          <span className="font-mono font-bold text-xs w-5 text-center text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-md bg-foreground text-background flex items-center justify-center hover:opacity-90 transition-all shadow-sm"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <span className="font-semibold text-sm text-foreground tabular-nums shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer - Total & Pay */}
            <div className="px-5 pt-3 pb-4 border-t border-border/30 bg-neutral-50/80 backdrop-blur-md">
              {/* Compact breakdown */}
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 px-0.5">
                <span>Subtotal ${subtotal.toFixed(2)}</span>
                <span className="mx-1.5 text-border">·</span>
                <span>Tax ${tax.toFixed(2)}</span>
                <span className="flex-1" />
                <span className="font-bold text-foreground text-base tabular-nums">${total.toFixed(2)}</span>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className={cn(
                  "w-full py-3 bg-foreground text-background font-bold rounded-xl text-sm tracking-tight",
                  "shadow-lg shadow-black/5 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200",
                  "flex items-center justify-center gap-2",
                  isProcessing && "opacity-70 cursor-not-allowed"
                )}
              >
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Pay ${total.toFixed(2)}
                  </>
                )}
              </button>
              {error && <p className="text-destructive font-medium text-xs text-center mt-2 animate-in fade-in slide-in-from-bottom-2">{error}</p>}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
