# Repo Architecture (Current State)

This document describes the current architecture and module boundaries of the repository.

## Runtime Surfaces

1. Landing experience: `app/page.tsx`
2. Diner flow: `app/table/[id]/...`
3. Kitchen flow: `app/kitchen/...`
4. Offline fallback: `app/~offline/page.tsx`

## Main Boundaries

### App routing and shells

- `app/` owns route-level composition and layouts.
- Route components orchestrate feature modules; they should avoid embedding domain logic.

### UI components

- `components/domain/` contains feature-facing UI components.
  - `components/domain/kitchen/` contains KDS-specific board/card/input components.
- `components/ui/` contains smaller reusable UI controls.
- `components/onboarding/` contains entry and identity flow UI.

### Feature/domain logic

- `features/cart/domain/`:
  - grouping and identity helpers
  - money/totals helpers
- `features/session/domain/`:
  - session reducer + core state transitions
- `features/kitchen/domain/`:
  - KDS prioritization, modifier extraction, and view-model selectors

### Services and repositories

- `features/session/services/`:
  - storage parsing/persistence
  - sync channel orchestration
- `features/*/repositories/`:
  - data access contracts and local adapters
  - currently: menu, order, session repositories

### Shared utilities

- `hooks/`: cross-component behavior hooks (`useKitchenOrders`, `useKDSInputController`, `useMenuPrefetch`, etc.)
- `lib/`: constants and helper utilities
- `types/`: app-level type contracts

### Testing

- Unit/component tests: `__tests__/`
- E2E tests: `tests/e2e/`
- Refactor logs: `docs/refactor/`

## Design Principles

1. Keep domain rules out of route/component render trees.
2. Keep reducers pure and side effects in services/repositories.
3. Keep UI components focused on presentation and interaction handling.
4. Prefer shared selectors/helpers over duplicated logic.
5. Keep KDS input orchestration (touch + keyboard) in hooks and domain helpers, not route JSX.

## Guardrails

Architecture guard script:

- `scripts/architecture-guards.mjs`
- Run via: `npm run test:architecture`

Current guard blocks unsafe side effects in UI surfaces (for example hard reloads and runtime HTML/style injection).

## Related Documents

1. `docs/README.md`
2. `docs/engineering/AI_FEATURE_CONVENTIONS.md`
3. `docs/engineering/ARCHITECTURE_CHANGELOG.md`
4. `docs/plan/architecture-scalability-modularity-plan.md`
5. `docs/refactor/phase-*.md`
