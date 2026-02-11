# Phase 2: State Boundaries and Sync

## State

- Completed
- Date: 2026-02-11

## Objectives

- Separate domain reducer logic from provider orchestration.
- Extract storage access into services.
- Move sync from poll-first to event-driven with fallback polling.

## Actions Taken

1. Extracted session reducer/domain actions:
   - `features/session/domain/sessionReducer.ts`
   - `sessionReducer`
   - `createInitialSession`
2. Extracted storage service APIs:
   - `features/session/services/sessionStorage.ts`
   - `readSession`
   - `writeSession`
   - `collectOrdersFromStorage`
   - `updateOrderStatusInStorage`
3. Added sync channel service:
   - `features/session/services/sessionSync.ts`
   - `notifySessionUpdated`
   - `subscribeToSessionUpdates`
4. Refactored provider to use extracted services:
   - `components/providers/TableSessionProvider.tsx`
   - Removed in-file reducer and storage key orchestration.
5. Refactored kitchen hook to use extracted services and event-driven sync:
   - `hooks/useKitchenOrders.ts`
   - `storage`/`BroadcastChannel` driven updates + 15s fallback poll.

## Tests Added/Updated

1. Added reducer-focused unit tests:
   - `__tests__/unit/session-reducer.test.ts`
2. Updated kitchen sync hook test for event-driven behavior:
   - `__tests__/hooks/useKitchenOrders.test.ts`

## Why This Phase Matters

- Reduces coupling in `TableSessionProvider`.
- Makes domain rules testable in isolation.
- Enables future backend swap by keeping storage concerns in services.
- Removes 2s aggressive polling as primary sync strategy.

## Validation

- `npm run lint`
- `npm run type-check`
- `npm run test`

## Follow-up for Next Phase

- Decompose `Checkout` into smaller presentational/action sections.
- Move checkout side effects (`location.reload`, `alert`, inline style injection) to action handlers.
