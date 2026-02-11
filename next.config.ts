import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp)/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'external-images',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          },
        },
      },
      {
        urlPattern: /\/_next\/image\?url=.+/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'next-images',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          },
        },
      },
      {
        urlPattern: /\/_next\/static\/.+/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'next-static',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24 Hours
          },
        },
      },
      {
        urlPattern: /\/api\/.*/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24 Hours
          },
        },
      },
      {
        urlPattern: ({ request }: { request: Request }) => request.mode === 'navigate',
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'pages',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24 Hours
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  /* config options here */
  // Enable Turbopack for dev (faster), but use webpack for builds (PWA compatibility)
  // The empty turbopack config silences the warning about webpack config
  turbopack: {},
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes: [320, 360, 375, 414, 540, 640, 750, 828, 1080, 1200],
    imageSizes: [96, 112, 128, 160, 192, 256, 320, 384],
    qualities: [55, 58, 60, 68, 75],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default withPWA(nextConfig);
