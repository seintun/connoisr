'use client';

import { TAG_EMOJIS } from '@/lib/menu';
import { optimizeUnsplashUrl } from '@/lib/image';
import { cn } from '@/lib/utils';
import { ImageLightbox } from '@/components/domain/ImageLightbox';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';

interface DinerMenuItemProps {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  onAdd: () => void;
  quantity?: number;
  onUpdateQuantity?: (quantity: number) => void;
  tags?: string[];
  priority?: boolean;
}

export const DinerMenuItem = React.memo(function DinerMenuItem({
  id,
  name,
  price,
  description,
  imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=60&w=640',
  onAdd,
  quantity = 0,
  onUpdateQuantity,
  tags = [],
  priority = false,
}: DinerMenuItemProps) {
  const cardImageUrl = useMemo(
    () =>
      optimizeUnsplashUrl(imageUrl, {
        width: priority ? 720 : 540,
        quality: 58,
      }),
    [imageUrl, priority],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      data-testid={`menu-item-card-${id}`}
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-card transition-all duration-300 h-full',
        'flex flex-row md:flex-col',
        'border border-border/50',
        quantity > 0
          ? 'ring-2 ring-primary/20 shadow-md'
          : 'shadow-sm hover:shadow-lg hover:-translate-y-0.5',
      )}
    >
      <MenuItemImage
        name={name}
        imageUrl={cardImageUrl}
        quantity={quantity}
        description={description}
        priority={priority}
      />

      <div className="flex-1 p-3 md:p-4 flex flex-col justify-between min-h-fit">
        {/* Header Row: Title + Price */}
        <div className="mb-2 md:mb-2.5">
          <div className="flex justify-between items-baseline gap-2 mb-1.5">
            <h3 className="font-semibold text-sm md:text-lg text-foreground leading-tight group-hover:text-primary transition-colors duration-300 flex-1 min-w-0">
              <span className="line-clamp-2">{name}</span>
            </h3>
            <span className="font-bold text-xs md:text-base text-primary bg-primary/8 px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg tabular-nums flex-shrink-0">
              ${price.toLocaleString('en-US')}
            </span>
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-[11px] md:text-xs leading-snug mb-2 line-clamp-2 font-medium opacity-75">
            {description}
          </p>

          {/* Tags - Compact */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map((tag) => {
                let colorClass = 'bg-secondary text-secondary-foreground border-border/50';

                if (['Spicy'].includes(tag))
                  colorClass =
                    'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20';
                else if (['Vegetarian', 'Vegan'].includes(tag))
                  colorClass =
                    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
                else if (['GF', 'Gluten Free'].includes(tag))
                  colorClass =
                    'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
                else if (['Seafood', 'Shellfish'].includes(tag))
                  colorClass =
                    'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
                else if (['Sweet'].includes(tag))
                  colorClass =
                    'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-500/10 dark:text-pink-400 dark:border-pink-500/20';
                else if (['Alcohol'].includes(tag))
                  colorClass =
                    'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20';
                else if (['Nuts', 'Nut Free'].includes(tag))
                  colorClass =
                    'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-500/10 dark:text-stone-400 dark:border-stone-500/20';

                return (
                  <span
                    key={tag}
                    className={cn(
                      'text-[9px] md:text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md border flex items-center gap-0.5',
                      colorClass,
                    )}
                  >
                    <span className="opacity-75 scale-75 origin-left">{TAG_EMOJIS[tag]}</span>
                    {tag}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <MenuItemControls
          quantity={quantity}
          onAdd={onAdd}
          onUpdateQuantity={onUpdateQuantity}
          id={id}
        />
      </div>
    </motion.div>
  );
});

// Sub-components

const MenuItemImage = React.memo(function MenuItemImage({
  name,
  imageUrl,
  quantity,
  description,
  priority = false,
}: {
  name: string;
  imageUrl: string;
  quantity: number;
  description: string;
  priority?: boolean;
}) {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [resolvedImageSrc, setResolvedImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsImageOpen(false);
    };
    if (isImageOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImageOpen]);

  return (
    <>
      <div
        className={cn(
          'w-1/3 min-w-[100px] md:w-full md:aspect-[4/3] relative overflow-hidden shrink-0 cursor-zoom-in group select-none touch-manipulation',
          isImageOpen && 'z-[100]',
        )}
        data-touchable="true"
        data-testid={`menu-item-image-trigger-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
        onClick={() => setIsImageOpen(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
        <Image
          src={imageUrl}
          alt={name}
          fill
          quality={58}
          priority={priority}
          sizes="(max-width: 640px) 40vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          onLoad={(event) => {
            const img = event.currentTarget as HTMLImageElement;
            if (img.currentSrc) {
              setResolvedImageSrc(img.currentSrc);
            }
          }}
        />

        {quantity > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-2 left-2 md:top-2.5 md:left-2.5 bg-white/95 backdrop-blur-sm text-foreground font-bold px-2 py-1 rounded-lg text-[9px] md:text-xs z-20 flex items-center gap-1 shadow-md border border-black/10"
          >
            <span className="text-primary font-bold">{quantity}×</span>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isImageOpen && (
          <ImageLightbox
            imageUrl={imageUrl}
            cachedImageUrl={resolvedImageSrc ?? undefined}
            name={name}
            description={description}
            onClose={() => setIsImageOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
});

const MenuItemControls = React.memo(function MenuItemControls({
  quantity,
  onAdd,
  onUpdateQuantity,
  id,
}: {
  quantity: number;
  onAdd: () => void;
  onUpdateQuantity?: (q: number) => void;
  id?: string;
}) {
  return (
    <div className="flex items-stretch gap-1.5 md:gap-2 mt-auto">
      {/* Add OR Quantity Stepper */}
      {quantity > 0 && onUpdateQuantity ? (
        <div className="flex-1 flex items-center gap-1 p-1 rounded-lg md:rounded-lg bg-muted/50 border border-border/40">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateQuantity(quantity - 1);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            className="w-6 h-6 md:w-8 md:h-8 rounded-md flex items-center justify-center transition-colors bg-background text-destructive hover:bg-destructive/10 cursor-pointer"
            data-testid={`decrement-item-${id}`}
          >
            {quantity === 1 ? (
              <Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
            ) : (
              <Minus className="w-3 h-3 md:w-3.5 md:h-3.5" />
            )}
          </motion.button>

          <div className="flex-1 flex items-center justify-center">
            <motion.span
              key={quantity}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="font-bold text-sm md:text-base text-foreground tabular-nums"
              data-testid={`item-quantity-${id}`}
            >
              {quantity}
            </motion.span>
          </div>

          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateQuantity(quantity + 1);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            data-testid={`increment-item-${id}`}
            className="w-6 h-6 md:w-8 md:h-8 rounded-md flex items-center justify-center transition-colors bg-background text-success hover:bg-success/10 cursor-pointer"
          >
            <Plus className="w-3 h-3 md:w-3.5 md:h-3.5" />
          </motion.button>
        </div>
      ) : (
        <motion.button
          onClick={onAdd}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          data-testid={`add-item-${id}`}
          className="flex-1 py-2 md:py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg md:rounded-lg flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-all duration-300 text-xs md:text-sm group/btn shadow-sm hover:shadow-md cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform group-hover/btn:rotate-90" />
          <span>Add</span>
        </motion.button>
      )}
    </div>
  );
});
