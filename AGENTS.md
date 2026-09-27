# AGENTS.md

This file is the default entrypoint and single guide for AI coding agents in this repository (Claude Code imports it from CLAUDE.md; Codex and opencode read it directly).

## Primary Reference

Start here:

- `docs/README.md`

Use the following document as the source of truth for implementation conventions:

- `docs/engineering/AI_FEATURE_CONVENTIONS.md`
- `docs/engineering/REPO_ARCHITECTURE.md`
- `docs/engineering/ARCHITECTURE_CHANGELOG.md`

## Tech Stack

| Layer      | Technology                                       |
| ---------- | ------------------------------------------------ |
| Framework  | Next.js 16 (App Router), React 19, TypeScript    |
| Styling    | Tailwind CSS v4, `clsx`, `tailwind-merge`        |
| State      | TanStack Query, Context API, `useLocalStorage`   |
| Animations | Framer Motion                                    |
| Icons      | `lucide-react`                                   |
| PWA        | `@ducanh2912/next-pwa`                           |
| Analytics  | Vercel Analytics, Vercel Speed Insights          |
| Testing    | Vitest, Playwright, Testing Library              |
| Quality    | ESLint, Prettier, Husky, lint-staged, commitlint |
| Validation | Zod                                              |

## Commands

```sh
npm run dev              # Local dev server
npm run build            # Production build (webpack, required for PWA)
npm run lint             # ESLint
npm run type-check       # TypeScript
npm run test             # Unit tests
npm run test:unit        # Unit tests (explicit)
npm run test:architecture # Architecture guard checks
npm run test:docs        # Documentation guard checks
npm run test:e2e         # Playwright E2E
npm run test:quality     # Full quality gate (lint + type-check + architecture + docs + unit)
```

## Directory Map

```
app/                   # Next.js routes (table/[id], kitchen, ~offline)
  components/          # Route-level components
  globals.css          # Global styles + Tailwind v4
  manifest.ts          # PWA manifest (dynamic)
components/
  domain/              # Feature-facing UI (kitchen/, etc.)
  ui/                  # Reusable UI controls
  onboarding/          # Entry and identity flow UI
features/
  cart/domain/         # Grouping, identity, money/totals helpers
  session/domain/      # Session reducer + state transitions
  session/services/    # Storage parsing/persistence, sync channel
  kitchen/domain/      # KDS prioritization, modifier extraction, view-models
  */repositories/      # Data access contracts + local adapters
hooks/                 # Cross-component behavior hooks
lib/                   # Constants and helper utilities
types/                 # App-level type contracts
__tests__/             # Unit/component tests
tests/                 # E2E tests
scripts/               # Architecture guards, doc guards
docs/
  engineering/         # AI conventions, repo architecture, changelog
  refactor/            # Phase tracking for refactors
```

## Required Workflow For Feature Work

1. Follow component naming/test/a11y conventions in `docs/engineering/AI_FEATURE_CONVENTIONS.md`.
2. Read and align with current boundaries in `docs/engineering/REPO_ARCHITECTURE.md`.
3. Add or update tests for all behavioral changes. If deferred, document why + risk + follow-up.
4. Run:
   - `npm run lint`
   - `npm run type-check`
   - `npm run test:docs`
   - `npm run test`
5. If UI architecture constraints apply, also run:
   - `npm run test:architecture`

`npm run test:quality` runs the full gate (lint + type-check + architecture + docs + unit).

## Architecture Principles

1. **Domain rules out of render trees**: keep reducers pure; side effects in services/repositories.
2. **Route components orchestrate feature modules**: avoid embedding domain logic in route files.
3. **Module boundaries**: read `docs/engineering/REPO_ARCHITECTURE.md` before structural changes.
4. **Architecture changes require docs**: see Documentation Update Requirement below.

## Runtime Surfaces

1. **Landing**: `app/page.tsx`
2. **Diner flow**: `app/table/[id]/...`: zero-auth, QR scan → order
3. **Kitchen flow**: `app/kitchen/...`: real-time KDS dashboard
4. **Offline fallback**: `app/~offline/page.tsx`

## TanStack Query Patterns

- **Query keys**: structured arrays `[entity, id]`, not strings.
- **Reads**: `useQuery`. **Writes**: `useMutation`. Never mix.
- **Optimistic updates**: use `onMutate`/`onError` rollback, or invalidate after mutations.
- **Stale time**: set per data freshness needs (menu: long, orders: short).
- **Error handling**: query-level `retry` config, not manual retry loops.
- **Invalidation**: targeted `queryClient.invalidateQueries`, not broad resets.

## PWA Configuration

- **Dev**: Turbopack (default, faster).
- **Build**: Webpack (`next build --webpack`, required for PWA).
- **Plugin**: `@ducanh2912/next-pwa` in `next.config.ts`.
- **Manifest**: Dynamic via `app/manifest.ts`.
- **Caching**:
  - Images: CacheFirst (30 days)
  - Static assets: StaleWhileRevalidate (24h)
  - Pages/API: StaleWhileRevalidate (24h)
- **Offline**: `app/~offline/page.tsx` + `components/domain/NetworkStatus.tsx`.

## Component Conventions

- **`displayName`**: required on all exported components, `React.memo`, `forwardRef`, providers.
- **`data-testid`**: on primary actions, critical state containers, repeated list items. Kebab-case, intent-based. Not on decorative wrappers.
- **Server Components** by default; `"use client"` only when needed.
- **Styling**: Tailwind v4 + `clsx`/`tailwind-merge` for conditional classes.
- **Icons**: `lucide-react` only.
- **Animations**: Framer Motion; respect `prefers-reduced-motion`.

## Commit Messages (commitlint)

Commits must follow conventional format: `type(scope): description`

Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `style`, `ci`.

Always scope: `feat(kitchen): add order priority indicator` not `feat: add indicator`.

## Testing

- **Unit**: `__tests__/`: Vitest + Testing Library.
- **E2E**: `tests/`: Playwright.
- **Architecture**: `npm run test:architecture` validates module boundaries.
- **Docs**: `npm run test:docs` validates documentation consistency.

## Documentation Update Requirement

When architecture or module boundaries change, agents must update docs in the same change set:

1. Update `docs/engineering/REPO_ARCHITECTURE.md` for current-state structure.
2. Add an entry to `docs/engineering/ARCHITECTURE_CHANGELOG.md` with date, change summary, impact, and affected files.
3. If the change is part of planned refactor work, update or add the corresponding `docs/refactor/phase-*.md`.

## Design System

- **Dark Mode ("Midnight Slate")**: BG `hsl(224 71% 4%)`, FG `hsl(210 40% 98%)`, Primary `hsl(217 91% 60%)`
- **Light Mode ("Alabaster & Ink")**: BG `hsl(40 20% 99%)`, FG `hsl(240 10% 3.9%)`, Primary `hsl(45 93% 47%)`
- **Success**: Emerald | **Error**: Burnt Sienna / Muted Red
- **Typography**: Headers: Outfit | Body/UI: Plus Jakarta Sans
- **UI polish**: glassmorphism via `.glass-card` utilities; pulse indicators for activity; mobile-first `w-full` touch targets.

## Tools

- **CLI**: `rg --json` for search, `duckdb` for data analysis.

## Lessons Learned

Format: `[Date] Mistake → Root Cause → Fix → Rule`

<!-- Append lessons below this line -->

## Scope

These rules apply to all changes under:

- `app/`
- `components/`
- `context/`
- `hooks/`
- `features/`
- `lib/`
- `types/`
