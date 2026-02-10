"use client";

import { motion } from "framer-motion";
import { ChefHat, Clock, LayoutGrid, WifiOff } from "lucide-react";

const features = [
  {
    icon: ChefHat,
    title: "Orchestration, Not Just Display",
    description:
      "The KDS doesn't just show orders. It choreographs the kitchen. Intelligent routing, timing, and prep flow.",
    color: "text-primary",
  },
  {
    icon: WifiOff,
    title: "Offline-First Resilience",
    description:
      "Internet down? Dinner service isn't. Full PWA capabilities mean you never stop taking orders, even when the cloud vanishes.",
    color: "text-secondary-foreground",
  },
  {
    icon: Clock,
    title: "Sync in Milliseconds",
    description:
      "Real-time state management across all devices. When a server updates an order, the kitchen sees it instantly.",
    color: "text-primary",
  },
  {
    icon: LayoutGrid,
    title: "Service as a Material",
    description:
      "Interfaces that feel like physical objects. Tactile, responsive, and designed to disappear into the workflow.",
    color: "text-secondary-foreground",
  },
];

export function FeatureShowcase() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="glass-card p-8 rounded-2xl group transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 select-none touch-manipulation active:bg-muted/50"
            >
              <div className="bg-muted w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-3 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground font-sans leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
