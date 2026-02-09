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
        "group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 border border-border h-full",
        "flex flex-row md:flex-col", // Responsive layout: Row on mobile, Col on desktop
        quantity > 0 ? "ring-2 ring-primary shadow-glow" : "hover:shadow-glow"
      )}
    >
      {/* Image Container */}
      <div className="w-1/3 min-w-[120px] md:w-full md:aspect-[4/3] relative overflow-hidden shrink-0">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 absolute inset-0 md:static"
        />
        
        {/* Quantity Badge on Image - Mobile refined position */}
        {quantity > 0 && (
          <div className="absolute top-2 left-2 md:top-3 md:right-3 md:left-auto bg-primary text-white font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full shadow-lg text-xs md:text-sm">
            {quantity}<span className="hidden md:inline"> in cart</span>
          </div>
        )}
      </div>
      
      {/* Content Container */}
      <div className="flex-1 p-3 md:p-4 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-1 md:mb-2 gap-2">
            <h3 className="font-serif text-base md:text-xl font-bold text-foreground leading-tight line-clamp-2">
              {name}
            </h3>
            <span className="font-sans font-bold text-primary text-base md:text-lg whitespace-nowrap">
              ${price}
            </span>
          </div>
          
          <p className="text-muted-foreground text-xs md:text-sm leading-relaxed mb-3 line-clamp-2 md:line-clamp-3">
            {description}
          </p>
        </div>

        {quantity > 0 && onUpdateQuantity ? (
          <div className="flex items-center gap-2 md:gap-3 p-1.5 md:p-2 rounded-xl md:rounded-2xl bg-muted/50 border border-primary/10 mt-auto">
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateQuantity(quantity - 1);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors bg-white shadow-sm border border-border text-destructive hover:bg-destructive hover:text-white hover:border-destructive"
            >
              {quantity === 1 ? <Trash2 className="w-3 h-3 md:w-4 md:h-4" /> : <Minus className="w-3 h-3 md:w-4 md:h-4" />}
            </motion.button>

            <div className="flex-1 flex items-center justify-center overflow-hidden">
               <motion.span
                key={quantity}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="font-bold text-lg md:text-xl text-primary"
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
              className="w-8 h-8 md:w-10 md:h-10 bg-success text-success-foreground font-bold rounded-full flex items-center justify-center hover:brightness-110 transition-all shadow-md shadow-success/20"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
            </motion.button>
          </div>
        ) : (
          <motion.button
            onClick={onAdd}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2 md:py-3 bg-primary text-primary-foreground font-bold rounded-lg md:rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/25 text-sm md:text-base mt-auto"
          >
            <Plus className="w-4 h-4" />
            Add <span className="hidden md:inline">to Order</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
