"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2 } from "lucide-react";

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
  imageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800", // Default foodie image
  onAdd,
  quantity = 0,
  onUpdateQuantity,
}: DinerMenuItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group relative overflow-hidden rounded-[2rem] bg-white transition-all duration-500 h-full",
        "flex flex-row md:flex-col", 
        // Soft Modern Shadow - No Hard Borders
        quantity > 0 
          ? "ring-2 ring-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)]" 
          : "shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1"
      )}
    >
      {/* Image Container */}
      <div className="w-1/3 min-w-[120px] md:w-full md:aspect-[4/3] relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 z-10" />
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 absolute inset-0 md:static"
        />
        
        {/* Quantity Badge on Image */}
        {quantity > 0 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 left-2 md:top-4 md:right-4 md:left-auto bg-white/90 backdrop-blur-md text-foreground font-bold px-3 py-1 rounded-full shadow-lg text-xs md:text-sm z-20 flex items-center gap-1.5 border border-white/50"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {quantity} in cart
          </motion.div>
        )}
      </div>
      
      {/* Content Container */}
      <div className="flex-1 p-4 md:p-6 flex flex-col justify-between bg-gradient-to-b from-white to-neutral-50/50">
        <div>
          <div className="flex justify-between items-start mb-2 md:mb-3 gap-3">
            <h3 className="font-serif text-lg md:text-2xl font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {name}
            </h3>
            <span className="font-sans font-bold text-lg md:text-xl text-foreground/90 bg-neutral-100 px-2 py-1 rounded-lg tabular-nums">
              ${price}
            </span>
          </div>
          
          <p className="text-muted-foreground text-xs md:text-base leading-relaxed mb-4 line-clamp-2 md:line-clamp-3 font-medium">
            {description}
          </p>
        </div>

        {quantity > 0 && onUpdateQuantity ? (
          <div className="flex items-center gap-2 md:gap-3 p-1.5 md:p-2 rounded-xl md:rounded-2xl bg-white shadow-sm border border-neutral-100 mt-auto">
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateQuantity(quantity - 1);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-colors bg-neutral-100 text-destructive hover:bg-destructive hover:text-white"
            >
              {quantity === 1 ? <Trash2 className="w-3.5 h-3.5 md:w-5 md:h-5" /> : <Minus className="w-3.5 h-3.5 md:w-5 md:h-5" />}
            </motion.button>

            <div className="flex-1 flex items-center justify-center overflow-hidden">
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
              className="w-8 h-8 md:w-12 md:h-12 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center hover:brightness-110 transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4 md:w-6 md:h-6" />
            </motion.button>
          </div>
        ) : (
          <motion.button
            onClick={onAdd}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2.5 md:py-4 bg-foreground text-background font-bold rounded-xl md:rounded-2xl flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all duration-300 text-sm md:text-base mt-auto group/btn md:shadow-lg md:shadow-neutral-200"
          >
            <Plus className="w-4 h-4 transition-transform group-hover/btn:rotate-90" />
            Add <span className="hidden md:inline">to Order</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
