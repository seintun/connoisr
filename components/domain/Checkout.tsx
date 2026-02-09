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
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.2)] max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-border/50">
              <h2 className="text-xl font-serif font-bold text-foreground">Your Order</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Cart Items - Scrollable & Grouped */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {Object.entries(
                session.cart.reduce((groups, item) => {
                  // Fallback to looking up category from MENU_ITEMS if missing in cart item
                  const category = item.category || 
                    MENU_ITEMS.find(m => m.id === item.menuItemId)?.category || 
                    "Other";
                    
                  if (!groups[category]) groups[category] = [];
                  groups[category].push(item);
                  return groups;
                }, {} as Record<string, typeof session.cart>)
              ).map(([category, items]) => (
                <div key={category} className="space-y-3">
                  <h3 className="font-serif font-bold text-lg text-primary/80 border-b border-border/50 pb-1">
                    {category}
                  </h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex justify-between items-center py-2 group"
                      >
                        <div className="flex-1 pr-4">
                          <p className="font-medium text-foreground text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center transition-colors",
                              item.quantity === 1
                                ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                : "bg-muted hover:bg-muted/80"
                            )}
                          >
                            {item.quantity === 1 ? (
                              <Trash2 className="w-3.5 h-3.5" />
                            ) : (
                              <Minus className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <span className="font-mono font-bold text-base w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <span className="font-bold text-foreground ml-3 w-16 text-right tabular-nums">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer - Total & Pay */}
            <div className="p-5 border-t border-border/50 bg-white/50">
              {/* Breakdown */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border/50">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className={cn(
                  "w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl text-lg",
                  "shadow-lg shadow-primary/25 hover:opacity-90 active:scale-[0.98] transition-all",
                  "flex items-center justify-center gap-2",
                  isProcessing && "opacity-70 cursor-not-allowed"
                )}
              >
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pay ${total.toFixed(2)}
                  </>
                )}
              </button>
              {error && <p className="text-destructive text-sm text-center mt-2">{error}</p>}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
