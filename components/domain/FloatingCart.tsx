"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import React from "react";

interface FloatingCartProps {
  itemCount: number;
  cartTotal: string;
  isOnline: boolean;
  hasOrders: boolean;
  orderTotal: string;
  orderedItemCount: number;
  onOpen: () => void;
}

export const FloatingCart = React.memo(function FloatingCart({
  itemCount,
  cartTotal,
  isOnline,
  hasOrders,
  orderTotal,
  orderedItemCount,
  onOpen,
}: FloatingCartProps) {
  const isVisible = itemCount > 0 || hasOrders;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{
            y: isOnline ? 0 : -36,
            opacity: 1,
          }}
          className="fixed bottom-4 right-4 z-50"
        >
          <motion.button
            onClick={onOpen}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-2xl shadow-primary/40 hover:shadow-primary/50 transition-all cursor-pointer border border-primary-foreground/10 z-50 backdrop-blur-none"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                </span>
              )}
            </div>
            <div className="flex flex-col items-start leading-none gap-0.5">
              <span className="font-bold text-sm">
                {itemCount > 0 ? "Review & Send" : `Pay $${orderTotal}`}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-primary-foreground/90 font-medium">
                {itemCount > 0 ? (
                  <>
                    <span>{itemCount} pending</span>
                    <span className="w-1 h-1 rounded-full bg-primary-foreground/50" />
                    <span>${cartTotal}</span>
                  </>
                ) : (
                  <span>{orderedItemCount} items ordered</span>
                )}
              </div>
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
