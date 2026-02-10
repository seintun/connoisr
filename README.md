# TempoDine 🍽️

> **Vibrant Modernist Dining.** A high-performance, real-time Progressive Web App (PWA) designed for modern, high-volume dining environments.

![TempoDine Banner](/Users/seintun/.gemini/antigravity/brain/781b0f27-bc3c-46eb-ba12-5e14bde9e159/landing_page_1770629440830.png)

## Overview

TempoDine is built with **Next.js 14+**, **TypeScript**, and **Tailwind CSS v4**. It features a "Product-Led" design philosophy, balancing a beautiful, vibrant user experience for guests with high-utility tools for staff.

### Core Interfaces

*   **Diner PWA (The "Fresh Bistro" Experience)**: A guest-facing, zero-auth flow. Focus on "Time-to-Table" with a <3-tap path from scan to order.
    *   *Route:* `/table/[id]`
*   **Kitchen Display System (KDS)**: A real-time dashboard where **Color = Priority**. Functional color theory helps staff manage orders without reading fine print.
    *   *Route:* `/kitchen`

## Aesthetics: Vibrant Modernism ✨

We've pivoted from dark mode to a "Fresh Bistro" aesthetic:
*   **Palette**: Pure Frost (`#F8FAFC`), Zesty Coral (`#FF6B4A`), and Electric Indigo (`#6366F1`).
*   **Typography**: `Outfit` (Headers) and `Plus Jakarta Sans` (Body).
*   **UI Polish**: Glassmorphism, `rounded-2xl` components, and ambient glows.

## Features

*   **Real-Time State**: Orders sync instantly between Diner and Kitchen interfaces.
*   **Smart KDS**: Orders change color based on wait time (Coral -> Indigo -> Amber -> Emerald).
*   **Offline-First**: Fully capable PWA with service worker caching and offline fallback.
*   **Installable**: Add to home screen support on iOS and Android.
*   **Frictionless Checkout**: Integrated Web Payment API support (simulated).

## Tech Stack

*   **Framework**: Next.js 16 (App Router)
*   **Core**: React 19
*   **Styling**: Tailwind CSS v4
*   **Animation**: Framer Motion 12
*   **PWA**: @ducanh2912/next-pwa
*   **Icons**: Lucide React

## Key Features

### 🛒 Smart Floating Cart
A persistent, non-intrusive "Smart Pill" that tracks order totals in real-time.
*   **Pulse Animation**: Subtle "alive" indicators when items are added.
*   **Glassmorphism**: Premium blurred backdrop for context retention.

### 🖼️ Instant Image Viewer
Immersive full-screen visual experience for menu items.
*   **Instant Load**: Zero-latency opening of high-res food imagery.
*   **Keyboard Support**: `Esc` to dismiss for desktop power users.

### 📱 Mobile-First Design
Optimized for the "Fresh Bistro" experience on any device.
*   **Compact Cards**: Maximized screen real estate for menu browsing.
*   **Touch Targets**: Full-width action buttons for easy one-handed use.

## Getting Started

### Quick Start
```bash
npm install
npm run dev
```

Development uses **Turbopack** (faster builds). Open [http://localhost:3000](http://localhost:3000).

### PWA Testing (Production Build)
```bash
npm run build  # Uses webpack (PWA compatible)
npm start
```

### Key Features
- **Offline-First**: Cached pages and images work without internet
- **Installable**: Add to home screen on mobile/desktop  
- **Smart Caching**: Images (30 days), Pages/API (24 hours)

> **Note**: PWA features only work in production builds. Dev mode disables service workers.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed development guidelines.
## License

MIT
