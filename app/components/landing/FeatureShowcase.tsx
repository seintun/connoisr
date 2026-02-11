'use client';

import { motion } from 'framer-motion';
import { ChefHat, Clock, LayoutGrid, WifiOff } from 'lucide-react';

const features = [
  {
    icon: ChefHat,
    title: 'Orchestration, Not Just Display',
    description:
      "The KDS doesn't just show orders. It choreographs the kitchen. Intelligent routing, timing, and prep flow.",
    color: 'text-primary',
  },
  {
    icon: WifiOff,
    title: 'Offline-First Resilience',
    description:
      "Internet down? Dinner service isn't. Full PWA capabilities mean you never stop taking orders, even when the cloud vanishes.",
    color: 'text-secondary-foreground',
  },
  {
    icon: Clock,
    title: 'Sync in Milliseconds',
    description:
      'Real-time state management across all devices. When a server updates an order, the kitchen sees it instantly.',
    color: 'text-primary',
  },
  {
    icon: LayoutGrid,
    title: 'Service as a Material',
    description:
      'Interfaces that feel like physical objects. Tactile, responsive, and designed to disappear into the workflow.',
    color: 'text-secondary-foreground',
  },
];

export function FeatureShowcase() {
  return (
    <section id="features" className="py-24 relative bg-background" data-testid="feature-showcase">
      <div className="container max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 pb-24">
          {features.map((feature, index) => (
            <div
              key={index}
              data-testid={`feature-card-${index}`}
              className="sticky transition-all duration-500 will-change-transform"
              style={{
                top: `calc(10vh + ${index * 1.5}rem)`,
                zIndex: index + 1,
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="glass-card p-8 sm:p-10 rounded-3xl border border-white/10 dark:border-white/5 backdrop-blur-xl shadow-2xl bg-card/50"
              >
                <div className="flex items-start gap-6">
                  <div className="shrink-0 bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center">
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold mb-3 text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-muted-foreground font-sans leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

FeatureShowcase.displayName = 'FeatureShowcase';
