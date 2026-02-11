'use client';

import { Coffee, Wine } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(() => process.env.NODE_ENV === 'test');

  // Avoid hydration mismatch
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-full border border-border/40 bg-background/50 ${className}`}
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      data-testid="theme-toggle-btn"
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/40 bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground shadow-sm overflow-hidden ${className}`}
      aria-label="Toggle theme"
      type="button"
    >
      {isDark ? (
        <Wine className="h-4 w-4 text-indigo-400" />
      ) : (
        <Coffee className="h-4 w-4 text-amber-600" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

ThemeToggle.displayName = 'ThemeToggle';
