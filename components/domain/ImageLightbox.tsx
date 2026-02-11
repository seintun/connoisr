'use client';

import { optimizeUnsplashUrl } from '@/lib/image';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';

interface ImageLightboxProps {
  imageUrl: string;
  cachedImageUrl?: string;
  name: string;
  description: string;
  onClose: () => void;
}

export function ImageLightbox({
  imageUrl,
  cachedImageUrl,
  name,
  description,
  onClose,
}: ImageLightboxProps) {
  const zoomImageUrl = useMemo(
    () => optimizeUnsplashUrl(imageUrl, { width: 1280, quality: 68 }),
    [imageUrl],
  );
  const imageSources = useMemo(
    () =>
      [zoomImageUrl, cachedImageUrl, imageUrl].filter(
        (src, index, all): src is string => Boolean(src) && all.indexOf(src) === index,
      ),
    [zoomImageUrl, cachedImageUrl, imageUrl],
  );
  const [sourceIndex, setSourceIndex] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
      data-testid="image-lightbox"
    >
      <div
        className="relative w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          onClick={onClose}
          data-testid="image-lightbox-close"
          className="absolute top-4 right-4 md:top-8 md:right-8 z-50 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </motion.button>

        <Image
          src={imageSources[sourceIndex]}
          alt={name}
          fill
          unoptimized
          className="object-contain rounded-xl shadow-2xl"
          onError={() => {
            setSourceIndex((prev) => (prev < imageSources.length - 1 ? prev + 1 : prev));
          }}
        />

        <div className="absolute bottom-4 left-0 right-0 text-center text-white/90 p-4">
          <h3 className="text-xl md:text-3xl font-serif font-bold mb-1">{name}</h3>
          <p className="text-white/70 text-sm md:text-lg max-w-2xl mx-auto line-clamp-2 md:line-clamp-none">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

ImageLightbox.displayName = 'ImageLightbox';
