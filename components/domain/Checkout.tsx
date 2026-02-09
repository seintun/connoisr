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

    // Basic Web Payment API Implementation
    if (window.PaymentRequest) {
      try {
        const supportedInstruments = [
          {
            supportedMethods: "basic-card",
            data: {
              supportedNetworks: ["visa", "mastercard"],
            },
          },
        ];

        const details = {
          total: {
            label: "Total",
            amount: {
              currency: "USD",
              value: total.toFixed(2),
            },
          },
          displayItems: session?.cart.map((item) => ({
            label: `${item.quantity}x ${item.name}`,
            amount: {
              currency: "USD",
              value: (item.price * item.quantity).toFixed(2),
            },
          })),
        };

        const request = new PaymentRequest(supportedInstruments, details);
        const response = await request.show();
        
        // Simulate payment processing
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        await response.complete("success");
        clearCart();
        alert("Payment successful!");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Payment failed");
        console.error("Payment Error:", err);
      }
    } else {
      // Fallback for browsers without Web Payment API
      alert("Web Payment API not supported in this browser. Fallback checkout...");
      // Simulate successful checkout for demo
      setTimeout(() => {
        clearCart();
        alert("Order placed (simulated)!");
      }, 1000);
    }
    setIsProcessing(false);
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
