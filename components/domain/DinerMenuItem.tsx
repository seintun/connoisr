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
        "group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 border border-border",
        quantity > 0 ? "ring-2 ring-primary shadow-glow" : "hover:shadow-glow"
      )}
    >
      <div className="aspect-[4/3] w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Quantity Badge on Image */}
        {quantity > 0 && (
          <div className="absolute top-3 right-3 bg-primary text-white font-bold px-3 py-1 rounded-full shadow-lg text-sm">
            {quantity} in cart
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif text-xl font-bold text-foreground leading-tight">
            {name}
          </h3>
          <span className="font-sans font-bold text-primary text-lg">
            ${price}
          </span>
        </div>
        
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
          {description}
        </p>

        {quantity > 0 && onUpdateQuantity ? (
          <div className="flex items-center gap-2">
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateQuantity(quantity - 1);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors bg-destructive/10 text-destructive hover:bg-destructive/20"
            >
              {quantity === 1 ? <Trash2 className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
            </motion.button>

            <div className="flex-1 h-12 bg-primary/5 rounded-xl flex items-center justify-center font-bold text-lg text-primary">
              {quantity}
            </div>

            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateQuantity(quantity + 1);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 bg-success text-success-foreground font-bold rounded-xl flex items-center justify-center hover:opacity-90 transition-colors shadow-lg shadow-success/25"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
        ) : (
          <motion.button
            onClick={onAdd}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 bg-primary/10 text-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add to Order
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
