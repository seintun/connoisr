# 🚀 Master Prompt: Project TempoDine

## Role
You are a **Senior Full-Stack Architect and Lead Developer**. Your mission is to architect TempoDine, a high-performance, real-time Progressive Web App (PWA) designed for modern, high-volume dining environments.

## Task
Develop the technical architecture and UI components for TempoDine using **Next.js 16+ (App Router)**, **TypeScript**, **React 19**, and **Tailwind CSS v4**.

## Core Interfaces & Strategic Goals

### Diner PWA (The "Fresh Bistro" Experience)
A guest-facing, zero-auth flow. Focus on "Time-to-Table" by ensuring a <3-tap path from QR scan to order. Use Glassmorphism and vibrant colors to stimulate appetite.

### Kitchen Display System (KDS) (The "High-Velocity" Board)
A real-time dashboard where **Color = Priority**. (Currently deprioritized for initial Diner MVP focus).

## Design & Aesthetic (Modern Fine Dining)

### Design Concept
Moving away from "tech" colors towards materials found in physical luxury spaces: **Stone, Gold, Slate, and Crisp Linen**.

### Palette

#### Dark Mode ("Midnight Slate")
*Best for: Evening service, modern bar atmosphere.*
- **Background**: `hsl(224 71% 4%)` (Deepest Blue/Black)
- **Foreground**: `hsl(210 40% 98%)` (Crisp White)
- **Primary / Accent**: `hsl(217 91% 60%)` (Electric Indigo)
- **Surface**: `hsl(222 47% 11%)` (Dark Slate)
- **Border**: `hsl(217 33% 20%)` (Cool Grey)

#### Light Mode ("Alabaster & Ink")
*Best for: Lunch service, readability.*
- **Background**: `hsl(40 20% 99%)` (Warm Alabaster)
- **Foreground**: `hsl(240 10% 3.9%)` (Deep Ink)
- **Primary**: `hsl(45 93% 47%)` (Champagne Gold) or Deep Bronze
- **Surface**: Pure White

### Functional Colors
- **Success**: Emerald (retained for clarity)
- **Error**: Burnt Sienna or Muted Red (less jarring than bright red)

### Typography
- **Headers**: Outfit (for a friendly, modern feel)
- **Body/UI**: Plus Jakarta Sans (for maximum legibility)

### UI Polish
- **Glassmorphism**: `.glass-card` utilities for overlays.
- **Smart Components**: "Pulse" indicators for activity.
- **Mobile First**: Compact layouts with `w-full` touch targets.

## Technical Requirements

### Real-Time Sync
(Planned) Implement a pattern for real-time state updates.

### PWA Essentials
**Status**: ✅ Implemented

**Architecture**:
- **Dev**: Turbopack (default, faster)
- **Build**: Webpack (PWA compatible)
- Empty `turbopack: {}` silences compatibility warnings

**Implementation**:
- **Plugin**: `@ducanh2912/next-pwa`
- **Manifest**: Dynamic `app/manifest.ts`
- **Offline Page**: `app/~offline/page.tsx`
- **Network Indicator**: `components/domain/NetworkStatus.tsx`

**Caching Strategy**:
- **Images**: CacheFirst (30 days)
- **Static Assets**: StaleWhileRevalidate (24 hours)
- **Pages/API**: StaleWhileRevalidate (24 hours)
### State Management
Use Context API + `useLocalStorage` for lightweight, persistent cart state on the client.

### Checkout
Integration-ready simulation for Web Payment API flow.

## Requested Output

1.  **globals.css**: Setup Tailwind v4 with vibrant CSS variables and HSL logical colors.
2.  **Core Components**:
    -   `FloatingCart.tsx`: A persistent "Smart Pill" tracking real-time totals and triggering checkout.
    -   `DinerMenuItem.tsx`: A highly optimized component with sub-components (`MenuItemImage`, `MenuItemControls`) for maintainability. Features an **Instant Image Viewer**.
    -   `TableLayout.tsx`: The root layout handling the dynamic QR routing (e.g., `/table/[id]`).
