"use client";

import { Checkout } from "@/components/domain/Checkout";
import { DinerMenuItem } from "@/components/domain/DinerMenuItem";
import { useTableSession } from "@/components/providers/TableSessionProvider";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";

const MENU_ITEMS = [
  {
    id: "item-1",
    name: "Truffle Risotto",
    price: 28,
    description: "Arborio rice, black truffle, parmesan crisp",
    imageUrl: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "item-2",
    name: "Pan-Seared Scallops",
    price: 32,
    description: "Cauliflower purée, brown butter, capers",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "item-3",
    name: "Wagyu Beef Carpaccio",
    price: 24,
    description: "Mustard seed, pickled shallot, rye cracker",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800",
  },
];

export default function DinerPage() {
  const { session, addItem } = useTableSession();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const itemCount = session?.cart.reduce((acc, item) => acc + item.quantity, 0) || 0;

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

      {/* Menu Section */}
      <section>
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-serif font-bold mb-6 text-foreground/90"
        >
          Chef's Signatures
        </motion.h2>
        <div className="grid gap-6 md:grid-cols-2">
          {MENU_ITEMS.map((item) => (
            <DinerMenuItem
              key={item.id}
              {...item}
              onAdd={() =>
                addItem({
                  menuItemId: item.id,
                  name: item.name,
                  price: item.price,
                  quantity: 1,
                })
              }
            />
          ))}
        </div>
      </section>

      {/* Checkout Sheet - Opens on cart click */}
      <Checkout isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
