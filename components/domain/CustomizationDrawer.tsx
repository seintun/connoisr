"use client";

import { cn } from "@/lib/utils";
import { CartItem } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { ChefHat, Flame, X } from "lucide-react";
import { useEffect, useState } from "react";

interface CustomizationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    tags?: string[];
  } | null;
  initialOptions?: {
    spiciness?: string;
    allergens?: string;
    removals?: string;
    note?: string;
    [key: string]: string | undefined;
  };
  onAddToCart: (customizedItem: Partial<CartItem>) => void;
  maxQuantity?: number;
}

const SPICINESS_LEVELS = [
  { value: 1, label: "1", color: "bg-emerald-500" },
  { value: 2, label: "2", color: "bg-yellow-500" },
  { value: 3, label: "3", color: "bg-orange-500" },
  { value: 4, label: "4", color: "bg-orange-600" },
  { value: 5, label: "5", color: "bg-red-600" },
];

const INTENSITY_PRESETS = [
  { value: 0, label: "None" },
  { value: 50, label: "Light" },
  { value: 100, label: "Regular" },
  { value: 150, label: "Extra" },
  { value: 200, label: "Max" },
];

export function CustomizationDrawer({
  isOpen,
  onClose,
  item,
  initialOptions,
  onAddToCart,
  maxQuantity,
}: CustomizationDrawerProps) {
  // Parse initial intensity from "100%" string if present
  const initialIntensity = initialOptions?.intensity 
    ? parseInt(initialOptions.intensity.replace('%', '')) 
    : 100;

  const [intensity, setIntensity] = useState(initialIntensity);
  const [chefNote, setChefNote] = useState(initialOptions?.note || "");
  const [quantity, setQuantity] = useState(1);

  // Reset state when item changes or drawer opens/closes (handled somewhat by key or mounting, but let's be safe if we reuse)
  // Actually, useState initial value only runs once. If we recycle the drawer, we need useEffect.
  useEffect(() => {
    if (isOpen) {
        const initInt = initialOptions?.intensity 
            ? parseInt(initialOptions.intensity.replace('%', '')) 
            : 100;
        setIntensity(initInt);
        setChefNote(initialOptions?.note || "");
        setQuantity(1);
    }
  }, [isOpen, initialOptions]);

  const handleAddToCart = () => {
    if (!item) return;

    const options: Record<string, string> = {};
    
    if (intensity !== 100) {
      // Convert intensity to readable label if it matches a preset, else use percentage
      const preset = INTENSITY_PRESETS.find(p => p.value === intensity);
      const label = preset ? preset.label : `${intensity}%`; // e.g. "Extra", "Light", or "125%"

      if (item.tags?.includes("Spicy")) {
         options.spiciness = label; 
      } else if (item.tags?.includes("Sweet")) {
         options.sweetness = label;
      } else {
         options.intensity = label;
      }
    }

    if (chefNote.trim()) options.note = chefNote.trim();

    onAddToCart({
      menuItemId: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      tags: item.tags,
      quantity,
      options,
      isCustomized: true,
    });

    // Reset state
    setIntensity(100);
    setChefNote("");
    setQuantity(1);
    onClose();
  };

  if (!item) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[60]"
          />

          {/* Modern Drawer */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl z-[70] max-h-[92vh] overflow-y-auto shadow-2xl border-t border-border/40"
            data-testid="customization-drawer"
          >
            {/* Handle Bar */}
            <div className="w-8 h-1 bg-border/60 rounded-full mx-auto mt-3 mb-4" />

            {/* Compact Header Section */}
            <div className="px-6 pb-4 pt-0">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h2 
                    data-testid="drawer-title"
                    className="text-xl font-semibold text-foreground truncate leading-snug"
                  >
                    {item.name}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {item.description}
                  </p>
                </div>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  data-testid="customization-drawer-close-btn"
                  className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-foreground/60" />
                </motion.button>
              </div>
            </div>

            {/* Content Section */}
            <div className="space-y-4 px-6 pb-32">
              {/* Spiciness/Sweetness Intensity */}
              {(item.tags?.includes("Spicy") ||
                item.tags?.includes("Sweet")) && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                      <Flame
                        className={cn(
                          "w-3.5 h-3.5",
                          item.tags?.includes("Sweet")
                            ? "text-pink-500"
                            : "text-orange-500",
                        )}
                      />
                      {item.tags?.includes("Sweet") ? "Sweetness" : "Spiciness"}
                    </h3>
                    <span className="text-xs font-bold bg-primary/10 px-2 py-1 rounded-lg text-primary">
                      {intensity}%
                    </span>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {INTENSITY_PRESETS.map((preset) => (
                      <motion.button
                        key={preset.value}
                        onClick={() => setIntensity(preset.value)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        data-testid={`customization-intensity-${preset.value}`}
                        className={cn(
                          "py-2 px-1 rounded-lg text-xs font-semibold transition-colors duration-200",
                          intensity === preset.value
                            ? item.tags?.includes("Sweet")
                              ? "bg-pink-500 text-white"
                              : "bg-orange-500 text-white"
                            : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border/40",
                        )}
                      >
                        {preset.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chef's Note */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                  <ChefHat className="w-3.5 h-3.5 text-indigo-500" />{" "}
                  Chef&apos;s Note
                </h3>
                <div className="relative">
                  <textarea
                    value={chefNote}
                    onChange={(e) => setChefNote(e.target.value.slice(0, 100))}
                    data-testid="customization-chef-note"
                    className="w-full bg-muted/60 border border-border/40 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all resize-none h-20"
                    placeholder="Extra crispy? Sauce on side?"
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-muted-foreground/70 font-mono bg-background/80 px-1.5 py-0.5 rounded">
                    {chefNote.length}/100
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-background via-background to-transparent z-[80]">
              <div className="max-w-lg mx-auto flex items-center gap-3">
                {/* Quantity Selector */}
                <div className="flex items-center gap-1.5 bg-muted/80 rounded-xl p-1.5 border border-border/30">
                  <motion.button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    data-testid="customization-qty-decrement"
                    className="w-8 h-8 rounded-lg bg-background shadow-xs flex items-center justify-center text-foreground hover:bg-background/80 transition-colors text-sm font-bold"
                  >
                    −
                  </motion.button>
                  <span 
                    className="font-bold text-sm w-5 text-center tabular-nums text-foreground"
                    data-testid="drawer-quantity"
                  >
                    {quantity}
                  </span>
                  <motion.button
                    onClick={() => setQuantity(prev => maxQuantity ? Math.min(maxQuantity, prev + 1) : prev + 1)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    data-testid="customization-qty-increment"
                    className={cn(
                      "w-8 h-8 rounded-lg bg-background shadow-xs flex items-center justify-center text-foreground transition-colors text-sm font-bold",
                      maxQuantity && quantity >= maxQuantity 
                        ? "opacity-50 cursor-not-allowed" 
                        : "hover:bg-background/80"
                    )}
                    disabled={maxQuantity ? quantity >= maxQuantity : false}
                  >
                    +
                  </motion.button>
                </div>

                {/* Add to Order Button */}
                <motion.button
                  onClick={handleAddToCart}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  data-testid="customization-add-to-order-btn"
                  className="flex-1 h-11 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:bg-primary/95 transition-colors duration-200"
                >
                  <span className="text-sm">Add to Order</span>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-lg font-mono">
                    ${(item.price * quantity).toFixed(2)}
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
