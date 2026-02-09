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
            <div className="flex justify-between items-center p-6 border-b border-gray-100/50 bg-white/50">
              <h2 className="text-2xl font-serif font-bold text-foreground">Your Order</h2>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center hover:bg-neutral-100 rounded-full transition-all active:scale-95"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Cart Items - Scrollable & Grouped */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
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
                <div key={category} className="space-y-4">
                  <h3 className="font-serif font-bold text-lg text-muted-foreground/80 uppercase tracking-widest text-xs pl-1">
                    {category}
                  </h3>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex justify-between items-center py-3 px-4 rounded-2xl bg-white/50 border border-transparent hover:border-border/50 transition-colors group"
                      >
                        <div className="flex-1 pr-4">
                          <p className="font-bold text-foreground text-base leading-tight">{item.name}</p>
                          <p className="text-sm font-medium text-muted-foreground mt-0.5">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 bg-neutral-100 p-1 rounded-xl">
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm",
                              item.quantity === 1
                                ? "bg-white text-destructive hover:bg-destructive/10"
                                : "bg-white text-foreground hover:bg-white/80"
                            )}
                          >
                            {item.quantity === 1 ? (
                              <Trash2 className="w-4 h-4" />
                            ) : (
                              <Minus className="w-4 h-4" />
                            )}
                          </button>
                          <span className="font-mono font-bold text-base w-6 text-center text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center hover:opacity-90 transition-all shadow-sm"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <span className="font-bold text-lg text-foreground ml-4 w-20 text-right tabular-nums">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer - Total & Pay */}
            <div className="p-6 border-t border-border/50 bg-neutral-50/80 backdrop-blur-md">
              {/* Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-base px-2">
                  <span className="text-muted-foreground font-medium">Subtotal</span>
                  <span className="font-bold tabular-nums">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base px-2">
                  <span className="text-muted-foreground font-medium">Tax (8%)</span>
                  <span className="font-bold tabular-nums">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-foreground pt-4 border-t border-dashed border-gray-200 px-2 mt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className={cn(
                  "w-full py-4 bg-foreground text-background font-bold rounded-2xl text-xl tracking-tight",
                  "shadow-xl shadow-black/5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300",
                  "flex items-center justify-center gap-3",
                  isProcessing && "opacity-70 cursor-not-allowed"
                )}
              >
                {isProcessing ? (
                  "Processing Payment..."
                ) : (
                  <>
                    <CreditCard className="w-6 h-6" />
                    Pay ${total.toFixed(2)}
                  </>
                )}
              </button>
              {error && <p className="text-destructive font-medium text-sm text-center mt-3 animate-in fade-in slide-in-from-bottom-2">{error}</p>}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
