"use client";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

import { useIdentity } from "@/context/IdentityContext";

interface MenuHeaderProps {
  categories: string[];
  tableId?: string;
  onCategoryClick: (category: string) => void;
}

export function MenuHeader({
  categories,
  tableId,
  onCategoryClick,
}: MenuHeaderProps) {
  const { userName } = useIdentity();
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [displayText, setDisplayText] = useState("");
  const navRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);

  // Typewriter effect
  useEffect(() => {
    const targetText = userName
      ? `${userName} is ordering`
      : `${APP_NAME} is ready`;
    let i = 0;
    setDisplayText("");

    const timer = setInterval(() => {
      if (i < targetText.length) {
        setDisplayText((prev) => targetText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [userName]);

  // Auto-scroll the nav pill into center view
  const scrollNavTo = (category: string) => {
    const navItem = document.getElementById(`nav-${category}`);
    if (navItem && navRef.current) {
      const container = navRef.current;
      const scrollLeft =
        navItem.offsetLeft -
        container.offsetWidth / 2 +
        navItem.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  };

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      // Skip scroll spy while a click-triggered scroll is in progress
      if (isProgrammaticScroll.current) return;
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        let currentSection = categories[0];

        // Find the last category that has its top above the threshold (active section)
        for (const category of categories) {
          const element = document.getElementById(category);
          if (element) {
            const rect = element.getBoundingClientRect();
            // 150px threshold allows for the header height + some buffer
            // Since we scroll to offset 80, this ensures we capture it even if slightly off
            if (rect.top <= 150) {
              currentSection = category;
            }
          }
        }

        setActiveCategory((prev) => {
          if (prev !== currentSection) {
            scrollNavTo(currentSection);
            return currentSection;
          }
          return prev;
        });

        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories]);

  const handleCategoryClick = (category: string) => {
    // Immediately set active state and scroll nav
    setActiveCategory(category);
    scrollNavTo(category);

    // Suppress scroll spy during the programmatic scroll
    isProgrammaticScroll.current = true;
    onCategoryClick(category);

    // Re-enable scroll spy after the smooth scroll finishes
    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 1000);
  };

  return (
    <>
      {/* Brand Bar - Scrolls away naturally */}
      <div className="bg-background w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white font-serif font-bold text-xl shadow-lg shadow-primary/30 transform -rotate-3">
                C
              </div>
              <div className="flex flex-col gap-0.5">
                <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight leading-none">
                  {APP_NAME}
                </h1>
                <p className="text-xs text-muted-foreground font-medium tracking-wide h-4 flex items-center">
                  {displayText}
                  <span className="inline-block w-[1.5px] h-3 bg-primary/70 ml-0.5 animate-pulse" />
                </p>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {tableId && (
                <div className="flex px-2.5 py-1 bg-secondary/10 text-secondary-foreground/80 rounded-full text-[10px] font-bold uppercase tracking-wider border border-secondary/20 items-center gap-1.5 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                  Table {tableId}
                </div>
              )}
              <ThemeToggle />
            </div>
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
                    : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
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
