import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp)/,
        handler: "CacheFirst",
        options: {
          cacheName: "external-images",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          },
        },
      },
      {
        urlPattern: /\/_next\/image\?url=.+/,
        handler: "CacheFirst",
        options: {
          cacheName: "next-images",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          },
        },
      },
      {
        urlPattern: /\/_next\/static\/.+/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "next-static",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24 Hours
          },
        },
      },
      {
        urlPattern: /\/api\/.*/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "api-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24 Hours
          },
        },
      },
      {
        urlPattern: ({ request, url, event }: any) => {
          return request.mode === "navigate";
        },
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "pages",
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
};

export default withPWA(nextConfig);
