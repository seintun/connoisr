# ADR: Cart and Order Invariants

## Status

Accepted

## Date

2026-02-11

## Context

Cart, checkout, and kitchen flows currently share behavior assumptions, but those assumptions are spread across UI components and provider logic. This makes refactors risky and introduces drift between runtime code and tests.

## Decision

The app will use these canonical invariants:

1. `CartItem` is instance-based.
2. Each `CartItem` instance has `quantity = 1`.
3. Grouped quantity is derived by counting instances, not by summing mutable instance quantity.
4. `status = "PENDING"` means in cart; `status = "SENT"` means copied into an order snapshot.
5. `Order.items` is immutable snapshot data after send.
6. Item identity grouping is deterministic and based on:
   - `menuItemId`
   - normalized options
   - normalized notes
   - `orderedByName`
   - customization flag
7. Totals are derived from source items using shared money helpers.
8. Storage is an implementation detail; domain transitions must stay pure.

## Consequences

- Domain selectors and grouping helpers can be reused across diner, checkout, and kitchen surfaces.
- UI components should render pre-derived values rather than rebuild domain logic.
- Future backend migration is simpler because domain behavior is explicit and testable.
