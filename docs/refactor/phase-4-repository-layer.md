# Phase 4: Repository Layer for API Readiness

## State

- Completed
- Date: 2026-02-11

## Objectives

- Introduce repository interfaces so hooks/providers depend on contracts, not direct storage/data sources.
- Keep local adapters as default implementations.
- Prepare future backend adapters with minimal UI churn.

## Actions Taken

1. Added menu repository contract and local adapter:
   - `features/menu/repositories/menuRepository.ts`
2. Added order repository contract and local adapter:
   - `features/order/repositories/orderRepository.ts`
3. Added session repository contract and local adapter:
   - `features/session/repositories/sessionRepository.ts`
4. Migrated hooks/provider to repository usage:
   - `hooks/useMenuPrefetch.ts`
   - `hooks/useKitchenOrders.ts`
   - `components/providers/TableSessionProvider.tsx`

## Tests Added

1. `__tests__/unit/menu-repository.test.ts`
2. `__tests__/unit/order-repository.test.ts`

## Why This Phase Matters

- Decouples application logic from persistence implementation.
- Creates explicit boundaries for backend integration.
- Reduces risk when replacing local storage with API calls.

## Validation

- `npm run lint`
- `npm run type-check`
- `npm run test`

## Follow-up

- Add mock/remote repository adapters and contract tests per adapter.
- Route all remaining storage consumers through repositories.
