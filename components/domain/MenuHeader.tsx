"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface MenuHeaderProps {
  categories: string[];
  tableId?: string;
  onCategoryClick: (category: string) => void;
}

export function MenuHeader({ categories, tableId, onCategoryClick }: MenuHeaderProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Simple scroll spy logic
      let currentSection = categories[0];
      for (const category of categories) {
        const element = document.getElementById(category);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Offset for header height (approx 80px now)
          if (rect.top <= 120 && rect.bottom >= 120) {
            currentSection = category;
            break;
          }
        }
      }
      setActiveCategory(currentSection);
      
      // Auto-scroll the nav item into view
      const navItem = document.getElementById(`nav-${currentSection}`);
      if (navItem && navRef.current) {
          const container = navRef.current;
          const scrollLeft = navItem.offsetLeft - container.offsetWidth / 2 + navItem.offsetWidth / 2;
          container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories]);

  const handleCategoryClick = (category: string) => {
      onCategoryClick(category);
      // Wait for scroll to potentially happen then set active
      setTimeout(() => setActiveCategory(category), 300);
  };

  return (
    <>
       {/* Brand Bar - Scrolls away naturally */}
      <div className="bg-background w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white font-serif font-bold text-xl shadow-lg shadow-primary/30 transform -rotate-3">
                T
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight leading-none">
                  TempoDine
                </h1>
                <p className="text-xs text-muted-foreground font-medium tracking-wide">
                  Modern Dining Experience
                </p>
              </div>
            </div>

            {tableId && (
              <div className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-bold uppercase tracking-wider border border-secondary/20 backdrop-blur-sm">
                Table {tableId}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Category Navigation */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
            ref={navRef}
            className="flex overflow-x-auto py-3 -mx-4 px-4 sm:mx-0 sm:px-0 gap-3 hide-scrollbar select-none snap-x"
            >
            {categories.map((category) => (
                <button
                key={category}
                id={`nav-${category}`}
                onClick={() => handleCategoryClick(category)}
                className={cn(
                    "whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 snap-start flex-shrink-0 border-2",
                    activeCategory === category
                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/25 scale-100"
                    : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                >
                {category}
                </button>
            ))}
            </div>
        </div>
      </div>
    </>
  );
}
