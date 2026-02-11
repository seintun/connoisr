'use client';

import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

import { useIdentity } from '@/context/IdentityContext';

interface MenuHeaderProps {
  categories: string[];
  tableId?: string;
  onCategoryClick: (category: string) => void;
}

export function MenuHeader({ categories, tableId, onCategoryClick }: MenuHeaderProps) {
  const { userName } = useIdentity();
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [displayText, setDisplayText] = useState('');
  const navRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);
  const targetText = useMemo(
    () => (userName ? `${userName} is ordering` : `${APP_NAME} is ready`),
    [userName],
  );
  const isTyping = displayText.length < targetText.length;

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    setDisplayText('');

    const timer = setInterval(() => {
      if (i < targetText.length) {
        setDisplayText(targetText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [targetText]);

  // Auto-scroll the nav pill into center view
  const scrollNavTo = (category: string) => {
    const navItem = document.getElementById(`nav-${category}`);
    if (navItem && navRef.current) {
      const container = navRef.current;
      const scrollLeft = navItem.offsetLeft - container.offsetWidth / 2 + navItem.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
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

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
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

  const toTestIdFragment = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <>
      {/* Brand Bar - Scrolls away naturally */}
      <div className="bg-background w-full" data-testid="menu-header-brand-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex justify-between items-start min-h-12 gap-2">
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-lg shadow-primary/30 overflow-hidden">
                <Image
                  src="/apple-touch-icon.png"
                  alt={APP_NAME}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-serif font-bold text-foreground tracking-tight leading-none truncate">
                    {APP_NAME}
                  </h1>
                  {tableId && (
                    <div
                      data-testid="menu-header-table-badge"
                      className="flex px-2 py-0.5 bg-secondary/10 text-secondary-foreground/80 rounded-full text-[10px] font-bold uppercase tracking-wider border border-secondary/20 items-center gap-1 whitespace-nowrap shrink-0"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                      Table {tableId}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-medium tracking-wide leading-tight min-h-[1rem] max-w-[165px] sm:max-w-[260px] whitespace-normal break-words">
                  {displayText}
                  {isTyping && (
                    <span
                      data-testid="menu-header-typing-cursor"
                      className="inline-block w-[1.5px] h-3 bg-primary/70 ml-0.5 animate-pulse"
                    />
                  )}
                </p>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center shrink-0 pl-1">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Category Navigation */}
      <div
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm transition-all duration-300"
        data-testid="menu-header-category-nav"
      >
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
                data-testid={`menu-category-tab-${toTestIdFragment(category)}`}
                className={cn(
                  'whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 snap-start flex-shrink-0 border-2',
                  activeCategory === category
                    ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/25 scale-100'
                    : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
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

MenuHeader.displayName = 'MenuHeader';
