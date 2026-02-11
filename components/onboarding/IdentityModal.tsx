'use client';

import { useIdentity } from '@/context/IdentityContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface IdentityModalProps {
  tableId: string;
  prefetchProgress: boolean; // true = menu data is ready
}

export function IdentityModal({ tableId, prefetchProgress }: IdentityModalProps) {
  const { setIdentity, joinAsGuest } = useIdentity();
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input on mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length > 0) {
      setIdentity(name.trim());
    }
  };

  const handleGuest = () => {
    joinAsGuest();
  };

  return (
    <motion.div
      key="identity-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed inset-0 z-[100] flex items-center justify-center select-none"
      data-testid="identity-modal"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Glassmorphism backdrop */}
      <div className="absolute inset-0 backdrop-blur-xl bg-white/60 dark:bg-black/60" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="relative w-full max-w-sm mx-4 overflow-hidden"
      >
        {/* Main content */}
        <div className="rounded-3xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md shadow-2xl shadow-black/10 border border-white/60 dark:border-white/10 p-8 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B4A] to-[#FF8A6A] flex items-center justify-center shadow-lg shadow-[#FF6B4A]/30 overflow-hidden p-2">
              <Image
                src="/apple-touch-icon.png"
                alt="Connoisr logo"
                width={48}
                height={48}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight">
              Welcome to Table {tableId}
            </h1>
            <p className="text-sm text-muted-foreground">Enter your name to start ordering</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="identity-form">
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your first name"
              maxLength={20}
              autoComplete="given-name"
              className={cn(
                'w-full h-14 px-5 rounded-2xl text-lg font-medium',
                'bg-neutral-100 dark:bg-neutral-800',
                'border-2 border-transparent',
                'focus:border-[#FF6B4A] focus:ring-0 focus:outline-none',
                'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
                'text-foreground transition-colors duration-200',
              )}
              data-testid="identity-name-input"
            />

            {/* Start Dining CTA */}
            <button
              type="submit"
              disabled={name.trim().length === 0}
              data-testid="identity-start-btn"
              className={cn(
                'w-full h-14 rounded-2xl font-bold text-base text-white',
                'bg-[#FF6B4A] hover:bg-[#FF5533]',
                'active:scale-[0.98] transition-all duration-200',
                'shadow-lg shadow-[#FF6B4A]/30',
                'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
                'flex items-center justify-center gap-2',
              )}
            >
              Start Dining
              <span className="text-lg">→</span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border/40" />
            <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wider font-medium">
              or
            </span>
            <div className="h-px flex-1 bg-border/40" />
          </div>

          {/* Guest button */}
          <button
            onClick={handleGuest}
            data-testid="identity-guest-btn"
            className={cn(
              'w-full h-12 rounded-2xl font-semibold text-sm',
              'bg-transparent border-2 border-[#6366F1]/30 hover:border-[#6366F1]/60',
              'text-[#6366F1] hover:bg-[#6366F1]/5',
              'active:scale-[0.98] transition-all duration-200',
              'flex items-center justify-center gap-2',
            )}
          >
            <Sparkles className="w-4 h-4" />
            Join as Guest
          </button>

          {/* Prefetch progress bar */}
          <div className="pt-1">
            <div className="h-1 w-full rounded-full bg-neutral-200/60 dark:bg-neutral-700/40 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#FF6B4A] to-[#6366F1]"
                initial={{ width: '10%' }}
                animate={{ width: prefetchProgress ? '100%' : '60%' }}
                transition={{ duration: prefetchProgress ? 0.3 : 2, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground/50 text-center mt-1.5 font-medium">
              {prefetchProgress ? 'Menu ready ✓' : 'Loading menu…'}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
