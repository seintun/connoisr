"use client";

import { motion } from "framer-motion";
import { ArrowRight, Smartphone, Zap } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section
      className="relative min-h-[90dvh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 bg-background"
      data-testid="hero-section"
    >
      {/* Abstract Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-secondary/20 via-background to-background opacity-50" />

      <div className="container max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8 text-center lg:text-left pt-20 lg:pt-0"
          >
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-bold tracking-tight text-foreground leading-[1.1] break-words">
                Dining at the <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                  speed of thought
                </span>
                .
              </h1>
              <p className="text-lg sm:text-2xl text-muted-foreground font-sans max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Experience the <strong>&quot;3-Tap Rule&quot;</strong>. From scan to order in seconds. No friction, just flow.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/table/demo" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  data-testid="hero-try-demo-btn"
                  className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 select-none touch-manipulation"
                >
                  <Smartphone className="w-5 h-5" />
                  Try the Demo
                </motion.button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  data-testid="hero-learn-more-btn"
                  className="w-full sm:w-auto px-8 py-4 bg-secondary/50 text-secondary-foreground rounded-full font-medium text-lg backdrop-blur-sm border border-white/10 flex items-center justify-center gap-2 hover:bg-secondary/70 transition-colors select-none touch-manipulation"
                >
                  Learn More
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </div>

            <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-sm text-muted-foreground font-sans">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span>Lightning Fast</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
                <span>99.9% Uptime</span>
              </div>
            </div>
          </motion.div>

          {/* Visual/Demo Placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="hidden lg:block relative"
          >
            <div className="relative z-10 glass-card p-2 rounded-2xl transform rotate-[-5deg] hover:rotate-0 transition-transform duration-500 max-w-sm mx-auto">
              {/* Mock Mobile UI */}
              <div className="bg-background rounded-xl overflow-hidden shadow-inner border border-border aspect-[9/19.5]">
                <div className="h-full w-full bg-muted/20 flex flex-col">
                  {/* Status Bar */}
                  <div className="h-6 w-full flex justify-between px-4 items-center text-[10px] font-medium text-muted-foreground">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-current rounded-full opacity-20" />
                      <div className="w-3 h-3 bg-current rounded-full opacity-20" />
                      <div className="w-3 h-3 bg-current rounded-full" />
                    </div>
                  </div>
                  {/* Header */}
                  <div className="p-4 flex justify-between items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10" />
                    <div className="h-2 w-20 bg-muted-foreground/20 rounded-full" />
                    <div className="w-8 h-8 rounded-full bg-muted-foreground/10" />
                  </div>
                  {/* Hero Image */}
                  <div className="mx-4 h-48 rounded-lg bg-primary/5 animate-pulse" />
                  {/* Content Lines */}
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-3/4 bg-muted-foreground/20 rounded-full" />
                    <div className="h-3 w-1/2 bg-muted-foreground/10 rounded-full" />
                    <div className="h-3 w-full bg-muted-foreground/10 rounded-full" />
                    <div className="h-3 w-5/6 bg-muted-foreground/10 rounded-full" />
                  </div>
                 {/* Floating CTA */}
                  <div className="mt-auto p-4">
                     <div className="h-12 w-full bg-primary rounded-full shadow-lg shadow-primary/20 flex items-center justify-center text-primary-foreground font-bold text-sm">
                        Slide to Order
                     </div>
                  </div>
                </div>
              </div>
            </div>
             {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/30 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
