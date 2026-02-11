# Phase 1: DRY Domain Extraction

## State

- Completed
- Date: 2026-02-11

## Objectives

- Remove duplicated cart grouping/identity logic across diner, checkout, and kitchen surfaces.
- Centralize money and totals calculations.
- Start consuming shared domain helpers in runtime flows.

## Actions Taken

1. Added shared cart identity and grouping domain module:
   - `features/cart/domain/grouping.ts`
   - `buildCartItemIdentityKey`
   - `areCartItemsEquivalent`
   - `groupCartItems`
   - `groupItemsByUser`
2. Added shared money helper module:
   - `features/cart/domain/money.ts`
   - `computeSubtotal`
   - `computeOrdersSubtotal`
   - `computeTax`
   - `computeGrandTotal`
   - `formatCurrency`
3. Replaced duplicated grouping logic in:
   - `components/domain/Checkout.tsx`
   - `app/kitchen/page.tsx`
   - `app/table/[id]/DinerPageClient.tsx`
4. Replaced repeated inline currency/tax calculations in:
   - `components/domain/Checkout.tsx`
   - `app/table/[id]/DinerPageClient.tsx`
5. Reused cart item equivalence in provider group updates:
   - `components/providers/TableSessionProvider.tsx`

## Tests Added

1. Cart grouping domain tests:
   - `__tests__/unit/cart-grouping.test.ts`
2. Money helper tests:
   - `__tests__/unit/money.test.ts`

## Why This Phase Matters

- Eliminates copy/pasted grouping rules that diverged over time.
- Reduces risk of behavior mismatches between diner and kitchen views.
- Makes cart math and display formatting deterministic and reusable.

## Validation

- `npm run lint`
- `npm run type-check`
- `npm run test`

## Follow-up for Next Phase

- Split `TableSessionProvider` into reducer + persistence + sync boundaries.
- Introduce event-driven sync channel (`BroadcastChannel`) with storage fallback.
