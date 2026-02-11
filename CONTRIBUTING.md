# Contributing to Connoisr

We welcome contributions to Connoisr! This document outlines the standards and setup required to work on the project.

For documentation navigation and source-of-truth ownership, see `docs/README.md`.

## Development Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Run development server** (Turbopack - fast):

   ```bash
   npm run dev
   ```

   - Hot reload enabled
   - PWA features disabled in dev
   - Open [http://localhost:3000](http://localhost:3000)

3. **Test PWA features** (webpack - production):

   ```bash
   npm run build
   npm start
   ```

   - Service worker active
   - Test offline mode, caching, installability
   - **Tip**: Unregister old service workers in DevTools → Application → Service Workers

4. **Type checking**:
   ```bash
   npm run type-check
   ```

### Why Two Build Systems?

- **Dev (Turbopack)**: 10x faster hot reload, better DX
- **Build (webpack)**: PWA plugin compatibility
- Empty `turbopack: {}` config silences warnings

### Prerequisites

- Node.js 24.x
- npm 10+ or yarn

### Repository Setup

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/seintun/connoisr.git
    cd connoisr
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

For run/test commands, use **Development Setup** above to avoid duplication.

## Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/domain/`: Business logic components (e.g., `DinerMenuItem`, `Checkout`).
- `components/ui/`: Reusable primitive components.
- `hooks/`: Custom React hooks (e.g., `useOrderTimer`, `useTableSession`).
- `lib/`: Utility functions and constants.
- `types/`: TypeScript definitions.

## Engineering Conventions

- AI + feature implementation conventions: `docs/engineering/AI_FEATURE_CONVENTIONS.md`
- Current repo architecture: `docs/engineering/REPO_ARCHITECTURE.md`
- Architecture changelog: `docs/engineering/ARCHITECTURE_CHANGELOG.md`
- Agent entrypoint: `AGENTS.md`

## Aesthetic Guidelines (Vibrant Modernism)

### Mobile First Philosophy 📱

All diner-facing components must be optimized for mobile devices first.

- **Compactness**: Maximize vertical screen real estate. Avoid excessive padding on cards.
- **Touch Targets**: Interactive elements (buttons, inputs) must be at least 44px height/width or span `w-full`.
- **Gestures**: Support natural swipes and taps (e.g., tap backdrop to dismiss).

### Styling

- **Tailwind CSS v4**: usage of `@theme` and CSS variables in `app/globals.css`.
- **Colors**: Use semantic variables (e.g., `--primary`, `--muted-foreground`).
- **Motion**: Transitions should be snappy (`duration-200` to `duration-300`) or spring-based for a premium feel.

## Git Workflow

- **Branching**: Create feature branches from `develop` (e.g., `feat/add-menu-search`).
- **Commits**: Use conventional commits (e.g., `feat: ...`, `fix: ...`, `chore: ...`).
- **Pre-Commit Hook**: Runs `lint-staged` to lint/format changed files only.
- **Pre-Push Hook**: Runs `npm run test:unit` and conditional `npm run test:e2e:smoke` for UI/e2e changes.
- **Commit Message Hook**: Enforces conventional commit format with `commitlint`.
