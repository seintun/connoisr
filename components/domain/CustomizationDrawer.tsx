"use client";

import { cn } from "@/lib/utils";
import { CartItem } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { ChefHat, Flame } from "lucide-react";
import { useState } from "react";

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
  onAddToCart: (customizedItem: Partial<CartItem>) => void;
}

const SPICINESS_LEVELS = [
  { value: 0, label: "Mild", color: "bg-emerald-500" },
  { value: 1, label: "Medium", color: "bg-yellow-500" },
  { value: 2, label: "Hot", color: "bg-orange-500" },
  { value: 3, label: "Extra Hot", color: "bg-red-600" },
];




export function CustomizationDrawer({ isOpen, onClose, item, onAddToCart }: CustomizationDrawerProps) {
  const [spiciness, setSpiciness] = useState(0);
  const [chefNote, setChefNote] = useState("");
  const [quantity, setQuantity] = useState(1);


  const handleAddToCart = () => {
    if (!item) return;

    const options: Record<string, string> = {};
    if (spiciness > 0) options.spiciness = SPICINESS_LEVELS[spiciness].label;
    if (chefNote.trim()) options.note = chefNote.trim();

    onAddToCart({
      menuItemId: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      quantity,
      options,
    });
    
    // Reset state
    setSpiciness(0);
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
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-background rounded-t-[2.5rem] p-6 z-[70] max-h-[90vh] overflow-y-auto shadow-2xl border-t border-white/20"
          >
            {/* Handle Bar */}
            <div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mb-6" />

            <div className="space-y-8 pb-32">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-1">{item.name}</h2>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
                <div className="text-xl font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  ${item.price}
                </div>
              </div>

              {/* Spiciness/Sweetness Slider */}
              {(item.tags?.includes("Spicy") || item.tags?.includes("Sweet")) && (
                <div>
                  <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Flame className={cn("w-4 h-4", item.tags?.includes("Sweet") ? "text-pink-500" : "text-orange-500")} /> 
                    {item.tags?.includes("Sweet") ? "Sweetness Level" : "Spiciness Level"}
                  </h3>
                  <div className="flex justify-between bg-neutral-100 p-1.5 rounded-2xl relative">
                     <motion.div 
                      className={cn("absolute top-1.5 bottom-1.5 rounded-xl shadow-sm transition-colors duration-300", 
                        item.tags?.includes("Sweet") ? "bg-pink-500" : SPICINESS_LEVELS[spiciness].color
                      )}
                      initial={false}
                      animate={{ 
                          left: `${spiciness * 25}%`,
                          width: '25%'
                       }}
                     />
                    
                    {SPICINESS_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setSpiciness(level.value)}
                        className={cn(
                          "flex-1 py-3 text-sm font-bold rounded-xl relative z-10 transition-colors duration-300",
                          spiciness === level.value ? "text-white" : "text-neutral-500 hover:text-neutral-700"
                        )}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}



              {/* Chef's Note */}
              <div>
                <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-indigo-500" /> Chef's Note
                </h3>
                <div className="relative">
                  <textarea
                    value={chefNote}
                    onChange={(e) => setChefNote(e.target.value.slice(0, 100))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-24"
                    placeholder="Extra crispy? Sauce on side?"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-muted-foreground font-mono">
                    {chefNote.length}/100
                  </div>
                </div>
              </div>

              {/* Chef's Note */}

            </div>

            {/* Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent z-[80]">
              
              <div className="flex items-center gap-4 max-w-md mx-auto">
                <div className="flex items-center gap-3 bg-neutral-100 rounded-xl p-1.5 h-14">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-11 h-full rounded-lg bg-white shadow-sm flex items-center justify-center text-foreground hover:bg-neutral-50 transition-colors"
                  >
                    -
                  </button>
                  <span className="font-bold text-lg w-4 text-center tabular-nums">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-11 h-full rounded-lg bg-white shadow-sm flex items-center justify-center text-foreground hover:bg-neutral-50 transition-colors"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-14 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-neutral-800 transition-colors active:scale-95 duration-200"
                >
                  <span className="text-lg">Add to Order</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
                    ${(item.price * quantity).toFixed(2)}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
