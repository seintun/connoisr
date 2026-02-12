# CI Testing Pipeline

## Purpose

This document defines the test pipeline for Connoisr so we keep push velocity high without weakening coverage on diner/kitchen critical flows.

## Architecture-Aware Test Strategy

Connoisr has two coupled runtime surfaces:

- Diner flow (`/table/[id]`) with onboarding, menu, customization, checkout.
- Kitchen flow (`/kitchen`) with live order state transitions.

The riskiest regressions happen at these boundaries:

- Item grouping and quantity math in checkout/customization.
- Cross-page synchronization between diner and kitchen.
- Status transitions (`ordered` -> `cooking` -> `ready` -> `served`).

Pipeline layers map to that architecture:

- Unit/component (`vitest`): reducer/hook/component correctness in isolation.
- E2E smoke (`playwright @smoke`, Chromium): fastest protection for core user journeys.
- E2E full (`playwright`, Chromium + mobile emulation): broader regression sweep.

## Local Developer Gates (Husky)

- `pre-commit`:
  - `npm run lint-staged`
- `pre-push`:
  - `npm run test:architecture`
  - `npm run test:docs`
  - `npm run test:unit`
  - `npm run test:e2e:smoke` only when UI/e2e-relevant files changed.

Relevant file paths for smoke trigger:

- `app/**`
- `components/**`
- `context/**`
- `hooks/**`
- `lib/**`
- `tests/e2e/**`
- `playwright.config.ts`
- `package.json`
- `package-lock.json`

## GitHub Actions Pipeline

Workflow file: `.github/workflows/ci.yml`

### Trigger Matrix

- `pull_request`:
  - Run `quality` (lint, type-check, architecture guard, docs guard, unit tests with coverage thresholds).
  - Run full Chromium e2e if UI paths changed.
- `push` (`main`, `develop`):
  - Run `quality` (lint, type-check, architecture guard, docs guard, unit tests with coverage thresholds).
  - Run smoke e2e if UI paths changed.
- `schedule` (daily):
  - Run full matrix e2e (`npm run test:e2e:full`).
- `workflow_dispatch`:
  - Optional manual full matrix run (`full_e2e=true`).

### Why This Split

- Fast feedback on every push.
- Stronger PR confidence before merge.
- Nightly safety net for wider combinations and slower edge cases.

## Playwright Conventions

- Tag business-critical tests with `@smoke`.
- Prefer `data-testid` selectors for stability.
- Keep smoke tests deterministic and minimal.

Current smoke-covered flows:

- Diner -> checkout send -> kitchen status sync.
- Modify flow split/merge behavior with quantity + note + level preservation.
- Kitchen touch action path (`Start Cooking`, `Mark Ready`) remains synchronized back to diner checkout status labels.
- Kitchen keyboard action path (`Enter` on focused ticket) advances status and syncs back to diner.
- KDS modifier/urgency semantics stay visible via deterministic card signals (`MOD`, `OVERDUE`, note block).

## Vercel Integration Notes

- Use GitHub branch protection to require `CI` checks before merge.
- In Vercel project settings, require successful GitHub checks before production deployment.
- Keep build/deploy separate from test workflow so CI remains focused and debuggable.

## When Adding New Features

1. Add/update unit tests first.
2. Add e2e smoke only if the feature affects core diner/kitchen business flow.
3. Add non-smoke e2e tests for wider regressions.
4. Use `data-testid` for critical controls and state surfaces.
