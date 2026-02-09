# Contributing(to TempoDine)

We welcome contributions to TempoDine! This document outlines the standards and setup required to work on the project.

## Development Setup

### Prerequisites
*   Node.js 20+ (LTS)
*   npm 10+ or yarn

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-org/tempodine.git
    cd tempodine
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the development server**:
    ```bash
    npm run dev
    ```

4.  **Build for Production**:
    To test PWA features (Service Worker, Manifest), you must run a production build.
    ```bash
    # Turbopack is currently incompatible with the PWA plugin
    npx next build --webpack
    npm start
    ```

4.  **Open the application**:
    *   Landing: `http://localhost:3000`
    *   Diner App: `http://localhost:3000/table/1`

## Project Structure

*   `app/`: Next.js App Router pages and layouts.
*   `components/domain/`: Business logic components (e.g., `DinerMenuItem`, `Checkout`).
*   `components/ui/`: Reusable primitive components.
*   `hooks/`: Custom React hooks (e.g., `useOrderTimer`, `useTableSession`).
*   `lib/`: Utility functions and constants.
*   `types/`: TypeScript definitions.

## Aesthetic Guidelines (Vibrant Modernism)

### Mobile First Philosophy 📱
All diner-facing components must be optimized for mobile devices first.
*   **Compactness**: Maximize vertical screen real estate. Avoid excessive padding on cards.
*   **Touch Targets**: Interactive elements (buttons, inputs) must be at least 44px height/width or span `w-full`.
*   **Gestures**: Support natural swipes and taps (e.g., tap backdrop to dismiss).

### Styling
*   **Tailwind CSS v4**: usage of `@theme` and CSS variables in `app/globals.css`.
*   **Colors**: Use semantic variables (e.g., `--primary`, `--muted-foreground`).
*   **Motion**: Transitions should be snappy (`duration-200` to `duration-300`) or spring-based for a premium feel.

## Git Workflow

*   **Branching**: Create feature branches from `develop` (e.g., `feat/add-menu-search`).
*   **Commits**: Use conventional commits (e.g., `feat: ...`, `fix: ...`, `chore: ...`).


