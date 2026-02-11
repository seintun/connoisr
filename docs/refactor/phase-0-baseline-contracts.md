# Phase 0: Baseline and Contracts

## State

- Completed
- Date: 2026-02-11

## Objectives

- Define canonical cart/order invariants before deeper refactors.
- Introduce shared test fixture builders to reduce fixture drift.
- Establish an auditable record of architectural decisions.

## Actions Taken

1. Added ADR for cart and order invariants:
   - `docs/adr/cart-order-invariants.md`
2. Added shared fixture builders for tests:
   - `__tests__/fixtures/builders.ts`
   - `buildCartItem`
   - `buildOrder`
   - `buildSession`
3. Migrated existing tests to consume the shared builders:
   - `__tests__/components/Checkout.test.tsx`
   - `__tests__/hooks/useKitchenOrders.test.ts`

## Why This Phase Matters

- Enforces one canonical domain model across runtime + tests.
- Reduces repeated inline test object construction.
- Creates a stable base for extraction work in Phase 1 and Phase 2.

## Validation

- `npm run lint`
- `npm run type-check`
- `npm run test`

## Follow-up for Next Phase

- Extract shared cart identity/grouping and money utilities.
- Replace duplicated grouping logic in checkout, kitchen page, and diner page.
