"use client";

import { Checkout } from "@/components/domain/Checkout";
import { DinerMenuItem } from "@/components/domain/DinerMenuItem";
import { MenuHeader } from "@/components/domain/MenuHeader";
import { useTableSession } from "@/components/providers/TableSessionProvider";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { MENU_ITEMS } from "@/lib/menu";

export default function DinerPage() {
  const { session, addItem, updateItemQuantity, removeItem } = useTableSession();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Memoize categories to avoid recomputing on every render
  const categories = useMemo(
    () => Array.from(new Set(MENU_ITEMS.map(item => item.category))),
    []
  );

  // Helper to find item quantity in cart
  const getItemQuantity = useCallback((menuItemId: string) => {
    return session?.cart.find(item => item.menuItemId === menuItemId)?.quantity || 0;
  }, [session?.cart]);

  // Helper to get cart item ID for updates
  const getCartItemId = useCallback((menuItemId: string) => {
    return session?.cart.find(item => item.menuItemId === menuItemId)?.id;
  }, [session?.cart]);

  const handleUpdateQuantity = useCallback((menuItemId: string, newQuantity: number) => {
    const cartItemId = session?.cart.find(item => item.menuItemId === menuItemId)?.id;
    if (!cartItemId) {
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
  }, [session?.cart, addItem, removeItem, updateItemQuantity]);

  // Memoize derived values
  const itemCount = useMemo(
    () => session?.cart.reduce((acc, item) => acc + item.quantity, 0) || 0,
    [session?.cart]
  );

  const cartTotal = useMemo(
    () => (session?.cart.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0).toFixed(2),
    [session?.cart]
  );

  const handleCategoryClick = useCallback((category: string) => {
    const element = document.getElementById(category);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  const handleAddItem = useCallback((item: typeof MENU_ITEMS[number]) => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      quantity: 1,
    });
  }, [addItem]);

  return (
     <div className="min-h-screen bg-background pb-32">
       <MenuHeader 
          categories={categories} 
          tableId={session?.tableId?.toString()} 
          onCategoryClick={handleCategoryClick}
       />

       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
         {categories.map((category) => (
           <section key={category} id={category} className="scroll-mt-24 transition-all duration-500">
             <div className="flex items-center gap-4 mb-6">
               <h2 className="text-2xl font-serif font-bold text-foreground/90 tracking-tight">{category}</h2>
               <div className="h-px flex-1 bg-gradient-to-r from-border/60 to-transparent" />
             </div>
             
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
               {MENU_ITEMS.filter(item => item.category === category).map((item) => (
                 <DinerMenuItem
                   key={item.id}
                   {...item}
                   quantity={getItemQuantity(item.id)}
                   onUpdateQuantity={(qty) => handleUpdateQuantity(item.id, qty)}
                   onAdd={() => handleAddItem(item)}
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
             className="fixed bottom-10 right-6 z-50"
           >
             <motion.button
               onClick={() => setIsCartOpen(true)}
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="flex items-center gap-3 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-2xl shadow-primary/40 hover:shadow-primary/50 transition-all cursor-pointer border border-primary-foreground/10 z-50 backdrop-blur-none"
             >
               <div className="relative">
                 <ShoppingBag className="w-5 h-5" />
                 <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                 </span>
               </div>
               <div className="flex flex-col items-start leading-none gap-0.5">
                 <span className="font-bold text-sm">View Order</span>
                 <div className="flex items-center gap-1.5 text-[10px] text-primary-foreground/90 font-medium">
                   <span>{itemCount} items</span>
                   <span className="w-1 h-1 rounded-full bg-primary-foreground/50" />
                   <span>${cartTotal}</span>
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
