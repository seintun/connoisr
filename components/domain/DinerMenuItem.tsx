"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface DinerMenuItemProps {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  onAdd: () => void;
  quantity?: number;
  onUpdateQuantity?: (quantity: number) => void;
}

export function DinerMenuItem({
  id,
  name,
  price,
  description,
  imageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
  onAdd,
  quantity = 0,
  onUpdateQuantity,
}: DinerMenuItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative overflow-hidden rounded-[2rem] bg-white transition-all duration-300 h-full",
        "flex flex-row md:flex-col",
        "border border-neutral-200/60",
        quantity > 0
          ? "ring-2 ring-primary/20 shadow-md"
          : "shadow-sm hover:shadow-md hover:-translate-y-0.5"
      )}
    >
      <MenuItemImage 
        name={name} 
        imageUrl={imageUrl} 
        quantity={quantity} 
        description={description} 
      />

      <div className="flex-1 p-3 md:p-6 flex flex-col justify-between bg-gradient-to-b from-white to-neutral-50/50">
        <div>
          <div className="flex justify-between items-start mb-1.5 md:mb-3 gap-2">
            <h3 className="font-serif text-base md:text-2xl font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {name}
            </h3>
            <span className="font-sans font-bold text-base md:text-xl text-foreground/90 bg-neutral-100 px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg tabular-nums">
              ${price}
            </span>
          </div>

          <p className="text-muted-foreground text-[10px] md:text-base leading-relaxed mb-3 line-clamp-2 md:line-clamp-3 font-medium">
            {description}
          </p>
        </div>

        <MenuItemControls 
          quantity={quantity} 
          onAdd={onAdd} 
          onUpdateQuantity={onUpdateQuantity} 
        />
      </div>
    </motion.div>
  );
}

// Sub-components

function MenuItemImage({ name, imageUrl, quantity, description }: { name: string, imageUrl: string, quantity: number, description: string }) {
  const [isImageOpen, setIsImageOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsImageOpen(false);
    };
    if (isImageOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isImageOpen]);

  return (
    <>
      <div
        className={cn(
          "w-1/3 min-w-[120px] md:w-full md:aspect-[4/3] relative overflow-hidden shrink-0 cursor-zoom-in",
          isImageOpen && "z-[100]" // Keep context if needed, though modal is fixed.
        )}
        onClick={() => setIsImageOpen(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 z-10" />
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 absolute inset-0 md:static"
        />
        
        {quantity > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-2 left-2 md:top-3 md:left-3 bg-white/95 backdrop-blur-sm text-foreground font-bold px-2.5 py-1 rounded-lg text-xs md:text-sm z-20 flex items-center gap-1.5 shadow-sm border border-black/5"
          >
            <span className="text-primary">{quantity}x</span>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isImageOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsImageOpen(false);
            }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
          >
            <div
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                onClick={() => setIsImageOpen(false)}
                className="absolute top-4 right-4 md:top-8 md:right-8 z-50 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </motion.button>

              <img
                src={imageUrl}
                alt={name}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              />

              <div className="absolute bottom-4 left-0 right-0 text-center text-white/90 p-4">
                <h3 className="text-xl md:text-3xl font-serif font-bold mb-1">{name}</h3>
                <p className="text-white/70 text-sm md:text-lg max-w-2xl mx-auto line-clamp-2 md:line-clamp-none">
                  {description}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MenuItemControls({ quantity, onAdd, onUpdateQuantity }: { quantity: number, onAdd: () => void, onUpdateQuantity?: (q: number) => void }) {
  if (quantity > 0 && onUpdateQuantity) {
    return (
      <div className="flex items-center gap-2 md:gap-3 p-1 md:p-2 rounded-xl md:rounded-2xl bg-white shadow-sm border border-neutral-100 mt-auto w-full">
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onUpdateQuantity(quantity - 1);
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center transition-colors bg-neutral-100 text-destructive hover:bg-red-500 hover:text-white cursor-pointer"
        >
          {quantity === 1 ? <Trash2 className="w-4 h-4 md:w-5 md:h-5" /> : <Minus className="w-4 h-4 md:w-5 md:h-5" />}
        </motion.button>

        <div className="flex-1 flex items-center justify-center overflow-hidden px-2 md:px-0">
          <motion.span
            key={quantity}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="font-bold text-lg md:text-2xl text-foreground"
          >
            {quantity}
          </motion.span>
        </div>

        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onUpdateQuantity(quantity + 1);
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center transition-colors bg-neutral-100 text-emerald-600 hover:bg-emerald-600 hover:text-white cursor-pointer"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
        </motion.button>
      </div>
    );
  }

  return (
    <motion.button
      onClick={onAdd}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="w-full py-2.5 md:py-4 bg-foreground text-background font-bold rounded-xl md:rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white transition-all duration-300 text-sm md:text-base mt-auto group/btn md:shadow-lg md:shadow-neutral-200 cursor-pointer border border-transparent hover:border-emerald-700/20"
    >
      <Plus className="w-4 h-4 transition-transform group-hover/btn:rotate-90" />
      Add <span className="md:inline">to Order</span>
    </motion.button>
  );
}
