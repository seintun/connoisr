"use client";

import { TAG_EMOJIS } from "@/lib/menu";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const ImageLightbox = dynamic(
  () =>
    import("@/components/domain/ImageLightbox").then((mod) => ({
      default: mod.ImageLightbox,
    })),
  { ssr: false },
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
  priority?: boolean;
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
  priority = false,
}: DinerMenuItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative overflow-hidden rounded-[2rem] bg-card transition-all duration-300 h-full",
        "flex flex-row md:flex-col",
        "border border-border/60",
        quantity > 0
          ? "ring-2 ring-primary/20 shadow-md"
          : "shadow-sm hover:shadow-md hover:-translate-y-0.5",
      )}
    >
      <MenuItemImage
        name={name}
        imageUrl={imageUrl}
        quantity={quantity}
        description={description}
        priority={priority}
      />

      <div className="flex-1 p-3 md:p-5 flex flex-col justify-between bg-gradient-to-b from-card to-card/50">
        <div>
          <div className="flex justify-between items-start mb-1 md:mb-2 gap-2">
            <h3 className="font-serif text-base md:text-xl font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {name}
            </h3>
            <span className="font-sans font-bold text-sm md:text-lg text-foreground/90 bg-muted px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-md tabular-nums tracking-tight">
              ${price.toLocaleString("en-US")}
            </span>
          </div>

          <p className="text-muted-foreground text-[10px] md:text-sm leading-relaxed mb-3 line-clamp-2 md:line-clamp-3 font-medium opacity-80">
            {description}
          </p>

          {/* Tags Display - Above Add */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.map((tag) => {
                // Dynamic colors for tags
                let colorClass =
                  "bg-secondary text-secondary-foreground border-border/50";

                if (["Spicy"].includes(tag))
                  colorClass =
                    "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20";
                else if (["Vegetarian", "Vegan"].includes(tag))
                  colorClass =
                    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
                else if (["GF", "Gluten Free"].includes(tag))
                  colorClass =
                    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
                else if (["Seafood", "Shellfish"].includes(tag))
                  colorClass =
                    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
                else if (["Sweet"].includes(tag))
                  colorClass =
                    "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-500/10 dark:text-pink-400 dark:border-pink-500/20";
                else if (["Alcohol"].includes(tag))
                  colorClass =
                    "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20";
                else if (["Nuts", "Nut Free"].includes(tag))
                  colorClass =
                    "bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-500/10 dark:text-stone-400 dark:border-stone-500/20";

                return (
                  <span
                    key={tag}
                    className={cn(
                      "text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border flex items-center gap-1",
                      colorClass,
                    )}
                  >
                    <span className="opacity-80 scale-90">
                      {TAG_EMOJIS[tag]}
                    </span>
                    {tag}
                  </span>
                );
              })}
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

const MenuItemImage = React.memo(function MenuItemImage({
  name,
  imageUrl,
  quantity,
  description,
  priority = false,
}: {
  name: string;
  imageUrl: string;
  quantity: number;
  description: string;
  priority?: boolean;
}) {
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
          isImageOpen && "z-[100]",
        )}
        onClick={() => setIsImageOpen(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 z-10" />
        <Image
          src={imageUrl}
          alt={name}
          fill
          priority={priority}
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

const MenuItemControls = React.memo(function MenuItemControls({
  quantity,
  onAdd,
  onModify,
  onUpdateQuantity,
}: {
  quantity: number;
  onAdd: () => void;
  onModify: () => void;
  onUpdateQuantity?: (q: number) => void;
}) {
  return (
    <div className="flex items-stretch gap-1.5 mt-auto">
      {/* Add button OR Quantity Stepper */}
      {quantity > 0 && onUpdateQuantity ? (
        <div className="flex-1 flex items-center gap-1.5 md:gap-2 p-1 rounded-lg md:rounded-xl bg-card shadow-sm border border-border/50">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateQuantity(quantity - 1);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-7 h-7 md:w-10 md:h-10 rounded-md md:rounded-lg flex items-center justify-center transition-colors bg-muted text-destructive hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
          >
            {quantity === 1 ? (
              <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
            ) : (
              <Minus className="w-3.5 h-3.5 md:w-4 md:h-4" />
            )}
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
            className="w-7 h-7 md:w-10 md:h-10 rounded-md md:rounded-lg flex items-center justify-center transition-colors bg-muted text-success hover:bg-success hover:text-success-foreground cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </motion.button>
        </div>
      ) : (
        <motion.button
          onClick={onAdd}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-2 md:py-3 bg-primary text-primary-foreground font-semibold rounded-lg md:rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all duration-300 text-xs md:text-sm group/btn shadow-sm hover:shadow-md cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 transition-transform group-hover/btn:rotate-90" />
          <span>Add</span>
        </motion.button>
      )}

      {/* Customize - always visible */}
      <motion.button
        onClick={onModify}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="py-2 md:py-3 px-2.5 md:px-3 bg-secondary text-secondary-foreground rounded-lg md:rounded-xl flex items-center justify-center gap-1.5 hover:bg-secondary/80 transition-all duration-200 cursor-pointer border border-border/50"
        title="Customize"
      >
        <span className="text-sm md:text-base">✏️ Modify</span>
      </motion.button>
    </div>
  );
});
