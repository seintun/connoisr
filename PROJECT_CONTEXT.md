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

## Design & Aesthetic (Vibrant Modernism)

### Palette
- **Background**: `#F8FAFC` (Pure Frost)
- **Primary/Brand**: `#FF6B4A` (Zesty Coral)
- **Staff Action**: `#6366F1` (Electric Indigo)
- **Success**: `#10B981` (Emerald)

### Functional KDS Colors
Border/Glow logic based on ticket age:
- **New**: Coral
- **In-Progress**: Indigo
- **Delayed**: Amber (`#F59E0B`)
- **Ready**: Emerald

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
(Planned) Configure a Service Worker for offline menu caching.

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
