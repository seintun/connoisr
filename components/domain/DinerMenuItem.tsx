"use client";

import { TAG_EMOJIS } from "@/lib/menu";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const ImageLightbox = dynamic(
  () => import("@/components/domain/ImageLightbox").then(mod => ({ default: mod.ImageLightbox })),
  { ssr: false }
);

interface DinerMenuItemProps {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  onAdd: () => void;
  onModify: () => void;
  quantity?: number;
  onUpdateQuantity?: (quantity: number) => void;
  tags?: string[];
}

export const DinerMenuItem = React.memo(function DinerMenuItem({
  id,
  name,
  price,
  description,
  imageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
  onAdd,
  onModify,
  quantity = 0,
  onUpdateQuantity,
  tags = [],
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

      <div className="flex-1 p-3 md:p-5 flex flex-col justify-between bg-gradient-to-b from-white to-neutral-50/50">
        <div>
          <div className="flex justify-between items-start mb-1 md:mb-2 gap-2">
            <h3 className="font-serif text-base md:text-xl font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {name}
            </h3>
            <span className="font-sans font-bold text-sm md:text-lg text-foreground/90 bg-neutral-100/80 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-md tabular-nums tracking-tight">
              ${price}
            </span>
          </div>

          <p className="text-muted-foreground text-[10px] md:text-sm leading-relaxed mb-3 line-clamp-2 md:line-clamp-3 font-medium opacity-80">
            {description}
          </p>
          
          {/* Tags Display - Above Add */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.map(tag => (
                <span key={tag} className="text-[10px] uppercase font-bold text-foreground/70 bg-neutral-100/80 px-2 py-0.5 rounded-md border border-black/5 flex items-center gap-1">
                  <span>{TAG_EMOJIS[tag]}</span>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <MenuItemControls 
          quantity={quantity} 
          onAdd={onAdd} 
          onModify={onModify}
          onUpdateQuantity={onUpdateQuantity} 
        />
      </div>
    </motion.div>
  );
});

// Sub-components

const MenuItemImage = React.memo(function MenuItemImage({ name, imageUrl, quantity, description }: { name: string, imageUrl: string, quantity: number, description: string }) {
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
          "w-1/3 min-w-[110px] md:w-full md:aspect-[4/3] relative overflow-hidden shrink-0 cursor-zoom-in",
          isImageOpen && "z-[100]"
        )}
        onClick={() => setIsImageOpen(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 z-10" />
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 768px) 33vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        
        {quantity > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-2 left-2 md:top-3 md:left-3 bg-white/95 backdrop-blur-sm text-foreground font-bold px-2 py-0.5 rounded-md text-[10px] md:text-xs z-20 flex items-center gap-1 shadow-sm border border-black/5"
          >
            <span className="text-primary">{quantity}x</span>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isImageOpen && (
          <ImageLightbox
            imageUrl={imageUrl}
            name={name}
            description={description}
            onClose={() => setIsImageOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
});

const MenuItemControls = React.memo(function MenuItemControls({ quantity, onAdd, onModify, onUpdateQuantity }: { quantity: number, onAdd: () => void, onModify: () => void, onUpdateQuantity?: (q: number) => void }) {
  if (quantity > 0 && onUpdateQuantity) {
    return (
      <div className="flex items-center gap-1.5 md:gap-2 p-1 rounded-lg md:rounded-xl bg-white shadow-sm border border-neutral-100 mt-auto w-full">
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onUpdateQuantity(quantity - 1);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-7 h-7 md:w-10 md:h-10 rounded-md md:rounded-lg flex items-center justify-center transition-colors bg-neutral-50 text-destructive hover:bg-red-500 hover:text-white cursor-pointer"
        >
          {quantity === 1 ? <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Minus className="w-3.5 h-3.5 md:w-4 md:h-4" />}
        </motion.button>

        <div className="flex-1 flex items-center justify-center overflow-hidden px-1">
          <motion.span
            key={quantity}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="font-bold text-base md:text-xl text-foreground tabular-nums"
          >
            {quantity}
          </motion.span>
        </div>

        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onUpdateQuantity(quantity + 1);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-7 h-7 md:w-10 md:h-10 rounded-md md:rounded-lg flex items-center justify-center transition-colors bg-neutral-50 text-emerald-600 hover:bg-emerald-600 hover:text-white cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 mt-auto">
      <motion.button
        onClick={onAdd}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex-1 py-2 md:py-3 bg-foreground text-background font-semibold rounded-lg md:rounded-xl flex items-center justify-center gap-2 hover:bg-primary transition-all duration-300 text-xs md:text-sm group/btn shadow-sm hover:shadow-md cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5 transition-transform group-hover/btn:rotate-90" />
        <span>Add</span>
      </motion.button>
      <motion.button
        onClick={onModify}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="py-2 md:py-3 px-2.5 md:px-3 bg-neutral-100 text-foreground/70 rounded-lg md:rounded-xl flex items-center justify-center hover:bg-neutral-200 hover:text-foreground transition-all duration-200 cursor-pointer border border-neutral-200/60"
        title="Customize"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 md:w-4 md:h-4" />
      </motion.button>
    </div>
  );
});
