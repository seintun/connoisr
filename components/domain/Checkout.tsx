"use client";

import { useTableSession } from "@/components/providers/TableSessionProvider";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, CreditCard, Receipt } from "lucide-react";
import { useState } from "react";

export function Checkout() {
  const { session, clearCart } = useTableSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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

    // Simulate a premium "Payment Sheet" experience
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      clearCart();
      setIsOpen(false);
      alert("Payment successful! (Simulated)");
    } catch (err) {
      setError("Payment failed. Please try again.");
      console.error("Payment Error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Backdrop for open drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Main Drawer/Bar */}
      <motion.div
        layout
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-white/20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300",
          isOpen ? "rounded-t-3xl h-[85vh]" : "rounded-t-2xl pb-safe"
        )}
      >
        {/* Handle Bar */}
        <div 
            className="flex justify-center pt-3 pb-1 cursor-pointer w-full"
            onClick={() => setIsOpen(!isOpen)}
        >
          <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
        </div>

        {/* Content Container */}
        <div className="px-6 pb-6 flex flex-col h-full">
            
          {/* Header / Summary Bar */}
          <div 
            className="flex justify-between items-center mb-6 cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Total</p>
                <p className="text-xl font-serif font-bold text-foreground">
                    ${total.toFixed(2)}
                </p>
              </div>
            </div>
            
            <button 
                className={cn(
                    "p-2 rounded-full hover:bg-black/5 transition-colors",
                    !isOpen && "rotate-180"
                )}
            >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex-1 overflow-y-auto hidden-scrollbar"
              >
                <div className="space-y-6">
                    {/* Order List */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg">Your Order</h3>
                        {session.cart.map((item) => (
                            <div key={item.menuItemId} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono font-bold bg-muted px-2 py-1 rounded text-xs">{item.quantity}x</span>
                                    <span className="font-medium text-foreground">{item.name}</span>
                                </div>
                                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Breakdown */}
                    <div className="bg-muted/30 p-4 rounded-xl space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Tax (8%)</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border/50 mt-2">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Button */}
          <div className={cn("mt-auto pt-4", isOpen ? "pb-8" : "pb-4")}>
            <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl text-lg shadow-lg shadow-primary/25 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
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

        </div>
      </motion.div>
    </>
  );
}
