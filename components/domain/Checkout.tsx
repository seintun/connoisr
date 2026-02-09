"use client";

import { useTableSession } from "@/components/providers/TableSessionProvider";
import { useState } from "react";

export function Checkout() {
  const { session, clearCart } = useTableSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = session?.cart.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    // Simulate a premium "Payment Sheet" experience since basic-card is deprecated
    // In a real app, this would use Stripe Elements or a similar SDK
    try {
        // Arbitrary delay to simulate network request
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // Success logic
        clearCart();
        alert("Payment successful! (Simulated)");
    } catch (err) {
        setError("Payment failed. Please try again.");
        console.error("Payment Error:", err);
    } finally {
        setIsProcessing(false);
    }
  };

  if (!session || session.cart.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="text-xl font-bold font-serif text-primary">
            ${total.toFixed(2)}
          </div>
        </div>
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-sm active:scale-95 transition-transform disabled:opacity-50"
        >
          {isProcessing ? "Processing..." : "Pay & Order"}
        </button>
      </div>
      {error && (
        <div className="text-destructive text-sm mt-2 text-center">{error}</div>
      )}
    </div>
  );
}
