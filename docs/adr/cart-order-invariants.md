# ADR: Cart and Order Invariants

Status: Accepted  
Date: 2026-02-11

## Context

The diner and kitchen flows share cart and order models across UI surfaces, local storage persistence, and test fixtures. Divergent object shapes caused drift risk and brittle grouping logic.

## Decision

Use the following invariants:

1. `CartItem.instanceId` is the canonical per-item identity.
2. `CartItem.quantity` is aggregate count for equivalent items and should be derived/managed consistently by grouping helpers.
3. Cart item equivalence is determined by deterministic identity fields (item, user, note, customizations), not raw `JSON.stringify` comparisons in render paths.
4. Order status flow is monotonic: `ordered` -> `cooking` -> `ready` -> `served`.
5. Currency/tax/grand total calculations are centralized in shared domain helpers.

## Consequences

1. Shared helpers must be reused by diner, checkout, and kitchen surfaces.
2. Tests should construct fixtures through shared builders to avoid shape drift.
3. Future storage or API adapters must preserve these invariants.
