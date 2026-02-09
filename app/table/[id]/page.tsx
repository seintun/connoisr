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
     <div className="min-h-screen bg-background pb-32">
       {/* Modern Header */}
       <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 transition-all duration-300">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex justify-between items-center h-16">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-serif font-bold text-lg shadow-lg shadow-primary/30">
                 T
               </div>
               <h1 className="text-xl font-serif font-bold text-foreground tracking-tight">TempoDine</h1>
             </div>
             
             <div className="flex items-center gap-3">
               <div className="hidden sm:block px-4 py-1.5 bg-secondary/10 text-secondary rounded-full text-xs font-bold uppercase tracking-wider border border-secondary/20">
                 Table {session?.tableId}
               </div>
               
               {/* Cart Button */}
               <motion.button
                 onClick={() => setIsCartOpen(true)}
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 className="relative flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
               >
                 <ShoppingBag className="w-4 h-4" />
                 <span className="hidden sm:inline">Order</span>
                 {itemCount > 0 && (
                   <span className="bg-white text-primary rounded-full px-2 py-0.5 text-xs font-bold min-w-[20px]">
                     {itemCount}
                   </span>
                 )}
               </motion.button>
             </div>
           </div>

           {/* Sticky Category Navigation */}
           <div className="flex overflow-x-auto pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 py-3 gap-2 hide-scrollbar mask-gradient-x">
             {categories.map((category) => (
               <a
                 key={category}
                 href={`#${category}`}
                 onClick={(e) => {
                   e.preventDefault();
                   document.getElementById(category)?.scrollIntoView({ behavior: "smooth", block: "start" });
                 }}
                 className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50 snap-start"
               >
                 {category}
               </a>
             ))}
           </div>
         </div>
       </header>

       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
         {categories.map((category) => (
           <section key={category} id={category} className="scroll-mt-32">
             <div className="flex items-center gap-4 mb-8">
               <h2 className="text-3xl font-serif font-bold text-foreground">{category}</h2>
               <div className="h-px flex-1 bg-border/60" />
             </div>
             
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
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
       </main>

       <Checkout isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
     </div>
  );
}
