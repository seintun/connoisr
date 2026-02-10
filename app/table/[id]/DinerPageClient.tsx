"use client";

import { DinerMenuItem } from "@/components/domain/DinerMenuItem";
import { FloatingCart } from "@/components/domain/FloatingCart";
import { MenuHeader } from "@/components/domain/MenuHeader";
import { IdentityModal } from "@/components/onboarding/IdentityModal";
import { useTableSession } from "@/components/providers/TableSessionProvider";
import { useIdentity } from "@/context/IdentityContext";
import { useMenuPrefetch } from "@/hooks/useMenuPrefetch";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { CartItem } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";

const Checkout = dynamic(
  () => import("@/components/domain/Checkout").then(mod => ({ default: mod.Checkout })),
  { ssr: false }
);

const CustomizationDrawer = dynamic(
  () => import("@/components/domain/CustomizationDrawer").then(mod => ({ default: mod.CustomizationDrawer })),
  { ssr: false }
);

import { MENU_ITEMS } from "@/lib/menu";

export default function DinerPageClient() {
  const { session, addItem, updateItemQuantity, removeItem } = useTableSession();
  const { userName } = useIdentity();
  const { isReady } = useMenuPrefetch(session?.tableId || "1");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const isOnline = useOnlineStatus();

  const [selectedItemForCustomization, setSelectedItemForCustomization] = useState<(typeof MENU_ITEMS)[0] | null>(null);

  // Memoize categories to avoid recomputing on every render
  const categories = useMemo(
    () => Array.from(new Set(MENU_ITEMS.map(item => item.category))),
    []
  );

  // Helper to find item quantity in cart - only counts UNMODIFIED items for CURRENT user
  const getItemQuantity = useCallback((menuItemId: string) => {
    return session?.cart.find(i => 
      i.menuItemId === menuItemId && 
      !i.isCustomized && 
      i.orderedByName === userName
    )?.quantity || 0;
  }, [session?.cart, userName]);

  const handleUpdateQuantity = useCallback((menuItemId: string, newQuantity: number) => {
    // Find the cart item ID for the UNMODIFIED version of this menu item for CURRENT user
    const cartItemId = session?.cart.find(i => 
      i.menuItemId === menuItemId && 
      !i.isCustomized && 
      i.orderedByName === userName
    )?.id;
    
    if (!cartItemId) {
        if (newQuantity > 0) {
            const item = MENU_ITEMS.find(i => i.id === menuItemId);
            if (item) {
                addItem({
                    menuItemId: item.id,
                    name: item.name,
                    category: item.category,
                    price: item.price,
                    tags: item.tags,
                    quantity: newQuantity,
                    orderedByName: userName || undefined,
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
  }, [session?.cart, addItem, removeItem, updateItemQuantity, userName]);

  // Memoize derived values
  const itemCount = useMemo(
    () => session?.cart.reduce((acc, item) => acc + item.quantity, 0) || 0,
    [session?.cart]
  );

  const cartTotal = useMemo(
    () => (session?.cart.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
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
      tags: item.tags,
      quantity: 1,
      orderedByName: userName || undefined,
    });
  }, [addItem, userName]);

  const handleModifyItem = useCallback((item: typeof MENU_ITEMS[number]) => {
    setSelectedItemForCustomization(item);
  }, []);

  const handleAddToCartFromDrawer = useCallback((customizedItem: Partial<CartItem>) => {
      if (customizedItem.menuItemId) {
          addItem({ ...customizedItem, orderedByName: userName || undefined } as any);
      }
      setSelectedItemForCustomization(null);
  }, [addItem, userName]);

  const showMenu = !!userName && isReady;

  return (
    <>
      <AnimatePresence mode="wait">
        {!userName && (
          <IdentityModal
            key="identity-modal"
            tableId={session?.tableId || "1"}
            prefetchProgress={isReady}
          />
        )}
      </AnimatePresence>

      {showMenu && (
        <motion.div
          key="menu-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="min-h-screen bg-background pb-32"
        >
       <MenuHeader 
          categories={categories} 
          tableId={session?.tableId?.toString()} 
          onCategoryClick={handleCategoryClick}
       />

       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
         {categories.map((category) => (
           <section key={category} id={category} className="scroll-mt-28 transition-all duration-500">
             <div className="flex items-center gap-3 mb-4">
               <h2 className="text-xl font-serif font-bold text-foreground/90 tracking-tight">{category}</h2>
               <div className="h-px flex-1 bg-gradient-to-r from-border/40 to-transparent" />
             </div>
             
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
               {MENU_ITEMS.filter(item => item.category === category).map((item, index) => (
                 <DinerMenuItem
                   key={item.id}
                   {...item}
                   quantity={getItemQuantity(item.id)}
                   onUpdateQuantity={(qty) => handleUpdateQuantity(item.id, qty)}
                   onAdd={() => handleAddItem(item)}
                   onModify={() => handleModifyItem(item)}
                    priority={index < 4}
                 />
               ))}
             </div>
           </section>
         ))}
       </main>

        {/* Floating Cart Trigger */}
        <FloatingCart
          itemCount={itemCount}
          cartTotal={cartTotal}
          isOnline={isOnline}
          hasOrders={(session?.orders?.length ?? 0) > 0}
          orderTotal={((session?.orders || []).reduce((a, o) => a + o.total, 0) * 1.08).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          orderedItemCount={(session?.orders || []).reduce((a, o) => a + o.items.reduce((c, d) => c + d.quantity, 0), 0)}
          onOpen={() => setIsCartOpen(true)}
        />

        <Checkout isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        
        <CustomizationDrawer 
            isOpen={!!selectedItemForCustomization}
            onClose={() => setSelectedItemForCustomization(null)}
            item={selectedItemForCustomization}
            onAddToCart={handleAddToCartFromDrawer}
        />
      </motion.div>
      )}
    </>
  );
}
