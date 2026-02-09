"use client";

import { Checkout } from "@/components/domain/Checkout";
import { DinerMenuItem } from "@/components/domain/DinerMenuItem";
import { useTableSession } from "@/components/providers/TableSessionProvider";
import { AnimatePresence, motion } from "framer-motion";
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
       <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 transition-all duration-300 shadow-sm">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex justify-between items-center h-14">
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
             </div>
           </div>

           {/* Sticky Category Navigation */}
           <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 gap-2 hide-scrollbar mask-gradient-x">
             {categories.map((category) => (
               <a
                 key={category}
                 href={`#${category}`}
                 onClick={(e) => {
                   e.preventDefault();
                   document.getElementById(category)?.scrollIntoView({ behavior: "smooth", block: "start" });
                 }}
                 className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50 snap-start"
               >
                 {category}
               </a>
             ))}
           </div>
         </div>
       </header>

       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
         {categories.map((category) => (
           <section key={category} id={category} className="scroll-mt-28">
             <div className="flex items-center gap-4 mb-4">
               <h2 className="text-2xl font-serif font-bold text-foreground/90">{category}</h2>
               <div className="h-px flex-1 bg-border/40" />
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

       {/* Floating Cart Trigger */}
       <AnimatePresence>
         {itemCount > 0 && (
           <motion.div
             initial={{ y: 100, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             exit={{ y: 100, opacity: 0 }}
             className="fixed bottom-6 right-6 z-50"
           >
             <motion.button
               onClick={() => setIsCartOpen(true)}
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="flex items-center gap-4 bg-primary text-primary-foreground px-6 py-4 rounded-full shadow-2xl shadow-primary/40 hover:shadow-primary/50 transition-all cursor-pointer border border-primary-foreground/10 z-50 backdrop-blur-none"
             >
               <div className="relative">
                 <ShoppingBag className="w-6 h-6" />
                 <span className="absolute -top-1 -right-1 flex h-3 w-3">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                 </span>
               </div>
               <div className="flex flex-col items-start leading-none gap-0.5">
                 <span className="font-bold text-base">View Order</span>
                 <div className="flex items-center gap-1.5 text-xs text-primary-foreground/90 font-medium">
                   <span>{itemCount} items</span>
                   <span className="w-1 h-1 rounded-full bg-primary-foreground/50" />
                   <span>${(session?.cart.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0).toFixed(2)}</span>
                 </div>
               </div>
             </motion.button>
           </motion.div>
         )}
       </AnimatePresence>

       <Checkout isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
     </div>
  );
}
