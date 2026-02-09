# TempoDine 🍽️

> **Vibrant Modernist Dining.** A high-performance, real-time Progressive Web App (PWA) designed for modern, high-volume dining environments.

![TempoDine Banner](/Users/seintun/.gemini/antigravity/brain/781b0f27-bc3c-46eb-ba12-5e14bde9e159/landing_page_1770629440830.png)

## Overview

TempoDine is built with **Next.js 14+**, **TypeScript**, and **Tailwind CSS v4**. It features a "Product-Led" design philosophy, balancing a beautiful, vibrant user experience for guests with high-utility tools for staff.

### Core Interfaces

*   **Diner PWA (The "Fresh Bistro" Experience)**: A guest-facing, zero-auth flow. Focus on "Time-to-Table" with a <3-tap path from scan to order.
    *   *Route:* `/table/[id]`
*   **Kitchen Display System (KDS)**: A real-time dashboard where **Color = Priority**. Functional color theory helps staff manage orders without reading fine print.
    *   *Route:* `/admin/kds`

## Aesthetics: Vibrant Modernism ✨

We've pivoted from dark mode to a "Fresh Bistro" aesthetic:
*   **Palette**: Pure Frost (`#F8FAFC`), Zesty Coral (`#FF6B4A`), and Electric Indigo (`#6366F1`).
*   **Typography**: `Outfit` (Headers) and `Plus Jakarta Sans` (Body).
*   **UI Polish**: Glassmorphism, `rounded-2xl` components, and ambient glows.

## Features

*   **Real-Time State**: Orders sync instantly between Diner and Kitchen interfaces.
*   **Smart KDS**: Orders change color based on wait time (Coral -> Indigo -> Amber -> Emerald).
*   **Offline-First**: Built with PWA capabilities in mind.
*   **Frictionless Checkout**: Integrated Web Payment API support (simulated).

## Tech Stack

*   **Framework**: Next.js 14 (App Router)
*   **Styling**: Tailwind CSS v4 + shadcn/ui
*   **State**: React Query + Context API (LocalStorage persistence)
*   **Animation**: Framer Motion

## Getting Started

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed development setup and guidelines.

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## License

MIT
