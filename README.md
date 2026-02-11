# Connoisr 🍽️

> **Vibrant Modernist Dining.** A high-performance, real-time Progressive Web App (PWA) designed for modern, high-volume dining environments.

## Overview

Connoisr is built with **Next.js 16+**, **TypeScript**, and **Tailwind CSS v4**. It features a "Product-Led" design philosophy, balancing a beautiful, vibrant user experience for guests with high-utility tools for staff.

### Core Interfaces

- **Diner PWA (The "Fresh Bistro" Experience)**: A guest-facing, zero-auth flow. Focus on "Time-to-Table" with a <3-tap path from scan to order.
  - _Route:_ `/table/[id]`
- **Kitchen Display System (KDS)**: A real-time dashboard where **Color = Priority**. Functional color theory helps staff manage orders without reading fine print.
  - _Route:_ `/kitchen`

### Repo Architecture

- `app/`: Next.js App Router routes and page-level shells (`/table/[id]`, `/kitchen`, landing).
- `components/domain/`: Feature-critical UI (menu cards, checkout sheet, customization drawer, KDS ticket).
- `components/providers/` + `context/`: session and identity state boundaries.
- `hooks/`: sync and timer logic (`useKitchenOrders`, `useOrderTimer`, `useOnlineStatus`).
- `lib/`: menu data/constants/utils.
- `tests/e2e/`: Playwright cross-flow coverage (diner <-> kitchen synchronization, modify edge cases).
- `__tests__/`: Vitest unit/component coverage for reducers/hooks/components.

## Aesthetics: Modern Fine Dining 🥂

We've pivoted to a premium "Modern Fine Dining" aesthetic, featuring materials found in physical luxury spaces: **Stone, Gold, Slate, and Crisp Linen**.

- **Dark Mode ("Midnight Slate")**: Deepest Blue/Black (`hsl(224 71% 4%)`) backgrounds with Electric Indigo (`hsl(217 91% 60%)`) accents. Modern, high-contrast, and tech-forward.
- **Light Mode ("Alabaster & Ink")**: Warm Alabaster (`hsl(40 20% 99%)`) with sharp Deep Ink text. designed for clarity during lunch service.
- **Typography**: `Outfit` (Headers) and `Plus Jakarta Sans` (Body).
- **UI Polish**: Glassmorphism, subtle borders, and refined transitions.

## Features

- **Real-Time State**: Orders sync instantly between Diner and Kitchen interfaces.
- **Table Isolation**: Each table has its own isolated order session, ensuring data privacy and correct order tracking.
- **Functional KDS**: Orders change color based on status and customization (Emerald for Standard, Amber for Custom).
- **Instance-Based Cart**: Precise item tracking allows for individual customizations even within large orders.
- **Offline-First**: Fully capable PWA with service worker caching and offline fallback.
- **Installable**: Add to home screen support on iOS and Android.
- **Frictionless Checkout**: Integrated Web Payment API support (simulated).

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion 12
- **PWA**: @ducanh2912/next-pwa
- **Icons**: Lucide React

## Key Features

### 🛒 Smart Floating Cart

A persistent, non-intrusive "Smart Pill" that tracks order totals in real-time.

- **Pulse Animation**: Subtle "alive" indicators when items are added.
- **Glassmorphism**: Premium blurred backdrop for context retention.

### 🖼️ Instant Image Viewer

Immersive full-screen visual experience for menu items.

- **Instant Load**: Zero-latency opening of high-res food imagery.
- **Keyboard Support**: `Esc` to dismiss for desktop power users.

### 📱 Mobile-First Design

Optimized for the "Fresh Bistro" experience on any device.

- **Compact Cards**: Maximized screen real estate for menu browsing.
- **Touch Targets**: Full-width action buttons for easy one-handed use.

## Getting Started

### Quick Start

```bash
npm install
npm run dev
```

Development uses **Turbopack** (faster builds). Open [http://localhost:3000](http://localhost:3000).

### Running Tests

```bash
npm run test:unit            # Run components/unit tests (Vitest)
npm run test:e2e:smoke       # Fast critical-path e2e on Chromium (@smoke only)
npm run test:e2e:chromium    # Full e2e on Chromium
npm run test:e2e:full        # Full e2e matrix (includes mobile emulation)
```

Recommended workflow:
- Local commit: unit tests (handled by `pre-commit`)
- Local push: unit + e2e smoke only when UI/e2e files changed (handled by `pre-push`)
- PR CI: full Chromium e2e when UI paths change
- Nightly CI: full matrix regression run

### CI / QA Pipeline

- GitHub Actions workflow: `.github/workflows/ci.yml`
- Pipeline design + conventions: `docs/qa/CI_TESTING_PIPELINE.md`
- Vercel integration:
  - Set required status checks from `CI` in GitHub branch protection.
  - In Vercel, enable "Wait for checks to pass" before production promotion.

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
