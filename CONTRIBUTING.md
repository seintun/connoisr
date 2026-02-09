# Contributing(to TempoDine)

We welcome contributions to TempoDine! This document outlines the standards and setup required to work on the project.

## Development Setup

### Prerequisites
*   Node.js 18+
*   npm or yarn

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

4.  **Open the application**:
    *   Landing: `http://localhost:3000`
    *   Diner App: `http://localhost:3000/table/1`
    *   KDS: `http://localhost:3000/admin/kds`

## Project Structure

*   `app/`: Next.js App Router pages and layouts.
*   `components/domain/`: Business logic components (e.g., `KDSTicket`, `DinerMenuItem`).
*   `components/ui/`: Reusable primitive components (shadcn/ui).
*   `hooks/`: Custom React hooks (e.g., `useOrderTimer`, `useTableSession`).
*   `lib/`: Utility functions and constants.
*   `types/`: TypeScript definitions.

## Aesthetic Guidelines (Vibrant Modernism)

*   **Colors**: Use the CSS variables defined in `globals.css` (e.g., `bg-primary`, `text-foreground`).
*   **Components**: Use `rounded-2xl` for cards and containers.
*   **Glassmorphism**: Use the `.glass-card` utility for overlays and sticky headers.
*   **Animations**: Use `Framer Motion` for interactions (e.g., enter/exit animations, hover states).

## Git Workflow

*   **Branching**: Create feature branches from `develop` (e.g., `feat/add-menu-search`).
*   **Commits**: Use conventional commits (e.g., `feat: ...`, `fix: ...`, `chore: ...`).


