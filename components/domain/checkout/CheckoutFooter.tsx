'use client';

import { computeGrandTotal, computeTax, formatCurrency } from '@/features/cart/domain/money';
import { cn } from '@/lib/utils';
import { ChefHat, CreditCard, WifiOff } from 'lucide-react';

interface CheckoutFooterProps {
  isOnline: boolean;
  hasCartItems: boolean;
  hasOrders: boolean;
  isProcessing: boolean;
  pendingItemCount: number;
  ordersTotal: number;
  cartSubtotal: number;
  grandSubtotal: number;
  onPay: () => void;
  onSend: () => void;
  error?: string | null;
  success?: string | null;
}

export function CheckoutFooter({
  isOnline,
  hasCartItems,
  hasOrders,
  isProcessing,
  pendingItemCount,
  ordersTotal,
  cartSubtotal,
  grandSubtotal,
  onPay,
  onSend,
  error,
  success,
}: CheckoutFooterProps) {
  return (
    <div
      className={cn(
        'px-3 pt-2 pb-3 border-t border-border/40 bg-card/95 shrink-0 transition-transform duration-200',
        !isOnline && '-translate-y-6',
      )}
    >
      <div className="flex justify-between items-end">
        <div className="flex flex-col text-[10px] text-muted-foreground leading-tight space-y-0.5 w-1/2">
          <div className="flex justify-between gap-2">
            <span>Subtotal</span>
            <span>${formatCurrency(ordersTotal)}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Tax (8%)</span>
            <span>${formatCurrency(computeTax(ordersTotal))}</span>
          </div>
        </div>

        <div className="flex flex-col items-end leading-none">
          <span className="text-[10px] text-muted-foreground font-medium mb-0.5">Total Due</span>
          <span className="font-bold text-red-500 text-sm">
            ${formatCurrency(computeGrandTotal(ordersTotal))}
          </span>
        </div>
      </div>

      {hasCartItems && (
        <div className="mt-2 pt-2 border-t border-dashed border-border/40 flex justify-between items-center text-[10px]">
          <span className="text-muted-foreground font-medium">
            + {pendingItemCount} pending (${formatCurrency(cartSubtotal)})
          </span>
          <div className="flex gap-1 items-baseline">
            <span className="font-medium text-muted-foreground">Grand Total:</span>
            <span className="font-bold text-foreground text-xs">
              ${formatCurrency(computeGrandTotal(grandSubtotal))}
            </span>
          </div>
        </div>
      )}

      <div className="mt-2 flex gap-2">
        {hasOrders && (
          <button
            onClick={onPay}
            disabled={isProcessing || !isOnline}
            data-testid="pay-bill-btn"
            className={cn(
              'h-10 border border-border/50 bg-secondary/50 text-foreground font-semibold rounded-xl text-xs',
              'active:scale-[0.98] transition-all duration-200 hover:bg-secondary/80',
              'flex items-center justify-center gap-1.5 whitespace-nowrap px-3',
              'disabled:pointer-events-none disabled:cursor-not-allowed',
              (isProcessing || !isOnline) && 'opacity-60 cursor-not-allowed',
              hasCartItems ? 'flex-1' : 'w-full',
            )}
          >
            <CreditCard className="w-3.5 h-3.5 shrink-0" />
            <span>
              {!isOnline
                ? 'Pay (Offline)'
                : `Pay $${formatCurrency(computeGrandTotal(ordersTotal))}`}
            </span>
          </button>
        )}

        {hasCartItems && (
          <button
            onClick={onSend}
            disabled={isProcessing || !isOnline}
            data-testid="send-order-btn"
            className={cn(
              'flex-[2] h-10 bg-foreground text-background font-semibold rounded-xl text-sm',
              'shadow-md hover:shadow-lg',
              'active:scale-[0.98] transition-all duration-200',
              'flex items-center justify-center gap-2',
              'disabled:pointer-events-none disabled:cursor-not-allowed',
              (isProcessing || !isOnline) && 'opacity-60 cursor-not-allowed',
            )}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                <span>Sending...</span>
              </div>
            ) : (
              <>
                {!isOnline ? (
                  <>
                    <WifiOff className="w-4 h-4 opacity-70" />
                    <span>Send Disabled</span>
                  </>
                ) : (
                  <>
                    <ChefHat className="w-4 h-4 opacity-70" />
                    <span>Send Order</span>
                  </>
                )}
              </>
            )}
          </button>
        )}
      </div>

      {!isOnline && (
        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium text-center mt-1">
          Send and Pay are unavailable offline.
        </p>
      )}

      {success && (
        <p className="text-emerald-600 dark:text-emerald-400 font-medium text-xs text-center mt-2">
          {success}
        </p>
      )}

      {error && (
        <p className="text-red-500 font-medium text-xs text-center mt-2 animate-in fade-in slide-in-from-bottom-2">
          {error}
        </p>
      )}
    </div>
  );
}

CheckoutFooter.displayName = 'CheckoutFooter';
