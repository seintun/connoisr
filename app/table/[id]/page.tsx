"use client";

import { Checkout } from "@/components/domain/Checkout";
import { DinerMenuItem } from "@/components/domain/DinerMenuItem";
import { useTableSession } from "@/components/providers/TableSessionProvider";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";

import { MENU_ITEMS } from "@/lib/menu";

export default function DinerPage() {
  const { session, addItem, updateItemQuantity, removeItem } = useTableSession();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Helper to find item quantity in cart
  const getItemQuantity = (menuItemId: string) => {
    return session?.cart.find(item => item.menuItemId === menuItemId)?.quantity || 0;
  };

  // Helper to get cart item ID for updates
  const getCartItemId = (menuItemId: string) => {
    return session?.cart.find(item => item.menuItemId === menuItemId)?.id;
  };

  const handleUpdateQuantity = (menuItemId: string, newQuantity: number) => {
    const cartItemId = getCartItemId(menuItemId);
    if (!cartItemId) {
        // Should catch cases where item was just removed but UI hasn't updated, or logic error
        // If updating from 0 to 1, use addItem instead
        if (newQuantity > 0) {
            const item = MENU_ITEMS.find(i => i.id === menuItemId);
            if (item) {
                addItem({
                    menuItemId: item.id,
                    name: item.name,
                    category: item.category,
                    price: item.price,
                    quantity: newQuantity,
                });
            }
        }
        return;
    }

    if (newQuantity <= 0) {
        removeItem(cartItemId);
    } else {
        updateItemQuantity(cartItemId, newQuantity);
    }
  };

  const itemCount = session?.cart.reduce((acc, item) => acc + item.quantity, 0) || 0;

  // Group items by category
  const categories = Array.from(new Set(MENU_ITEMS.map(item => item.category)));

  return (
    <div className="p-6 space-y-8 pb-24">
      {/* Header */}
      <header className="flex justify-between items-center glass-card p-4 rounded-2xl sticky top-4 z-30">
        <h1 className="text-2xl font-serif font-bold text-primary tracking-tight">TempoDine</h1>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-bold uppercase tracking-wider">
            Table {session?.tableId}
          </div>
          
          {/* Cart Button - Clickable */}
          <motion.button
            onClick={() => setIsCartOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-full font-bold text-sm hover:bg-primary/20 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            {itemCount > 0 && (
              <motion.span
                key={itemCount}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-glow"
              >
                {itemCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </header>

      {/* Menu Sections */}
      <div className="space-y-8">
        {categories.map((category) => (
          <section key={category}>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-xl font-serif font-bold mb-3 text-foreground/90 sticky top-20 z-20 bg-background/95 backdrop-blur-md py-3 border-b border-border/50 uppercase tracking-wide"
            >
              {category}
            </motion.h2>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6 items-stretch">
              {MENU_ITEMS.filter(item => item.category === category).map((item) => (
                <DinerMenuItem
                  key={item.id}
                  {...item}
                  quantity={getItemQuantity(item.id)}
                  onUpdateQuantity={(qty) => handleUpdateQuantity(item.id, qty)}
                  onAdd={() =>
                    addItem({
                      menuItemId: item.id,
                      name: item.name,
                      category: item.category,
                      price: item.price,
                      quantity: 1,
                    })
                  }
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Checkout Sheet - Opens on cart click */}
      <Checkout isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
