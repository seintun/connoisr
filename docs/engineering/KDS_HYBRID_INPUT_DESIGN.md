# KDS Hybrid Input Design (Touch + Keyboard)

Status: Approved design for implementation
Date: 2026-02-11

## Summary

The kitchen display must run in two operational modes without splitting into separate apps:

1. iPad touch mode
2. Monitor + keyboard mode

Both modes share one board, one priority model, and one status update flow.

## Product Decisions

1. Board model: Single unified board.
2. Information hierarchy: Modifier-first for one-glance scanning.
3. Alerts: Balanced audio + visual.
4. Layout target: 2-column large cards (iPad landscape default).
5. Input model: Hybrid (touch and keyboard parity).

## UX and Interaction Specification

### 1. Glance-first hierarchy

Each card must expose, in this order:

1. Table identity
2. Modifier state (`MOD` badge)
3. Overdue/new urgency state
4. Item rows with quantity and diner name
5. Modifier tokens + kitchen note
6. Primary status action

### 2. Priority ordering

Active tickets are sorted by:

1. Overdue (`>= 12m`, non-ready)
2. New ordered (`<= 90s`)
3. Modified ordered
4. Normal ordered/cooking
5. Ready

Tie-breakers:

1. Older `createdAt` first
2. Stable `id` sort

### 3. Modifier readability

Use compact, high-contrast tokens:

- `NO` (removals)
- `HEAT` (spiciness)
- `SWEET` (sweetness)
- `ALLERGEN`
- Additional normalized option keys as uppercase tokens

Kitchen note is always a dedicated highlighted block and never hidden behind interaction.

### 4. Overdue and warning behavior

- Warning threshold: `8m`
- Overdue threshold: `12m`
- Overdue state uses icon + text label + color (not color only)

### 5. Touch operation

- Large primary action button at card footer
- Minimum actionable height target: `56px`
- Touch can set focused ticket for parity with keyboard mode

### 6. Keyboard operation

Default shortcuts:

- `ArrowUp` / `ArrowDown`: move focus
- `Enter`: advance focused ticket status
- `M`: next modified ticket
- `O`: next overdue ticket
- `N`: next new ticket
- `U`: undo last status change (5s)
- `?`: keyboard help overlay

### 7. Sticky status rail (mobile-first)

- Header remains sticky at top while scrolling ticket cards.
- Mobile portrait target: header occupies at most ~25% of viewport height.
- Time, input mode, and sound controls use consistent height and contrast for quick scan.
- KPI chips stay in-device-width with no horizontal scrolling.
- KPI priority order: `Overdue` -> `Ready` -> `Cooking` -> `Ordered`.
- `Active` count is promoted beside the `Connoisr KDS` title on mobile.
- Bottom command rail is pinned to viewport bottom for both short and long boards.
- Mobile command rail uses compact controls and truncated action hint to avoid horizontal scrolling.

### 8. Ticket density for portrait

- Ticket header typography is reduced on small phones to keep one-ticket cards concise.
- Quantity pill, item title text, and card paddings use smaller mobile defaults while preserving contrast.
- Primary action remains a large touch target for fast status progression.

### 9. Focus visibility guarantees

- Keyboard focus changes must keep the focused ticket fully visible in the safe viewport band.
- Safe viewport band is constrained by:
  - top sticky header height + spacing
  - bottom input hint bar height + spacing
- If a focused card is taller than the available safe band, align its top edge under the sticky header.

## Benefits

1. Supports mixed hardware in real restaurants (touch and non-touch stations).
2. Improves modifier miss-rate by making changes visually dominant.
3. Reduces action latency with one-key progression for high-volume service.
4. Keeps training simpler: one KDS UI regardless of station hardware.
5. Prevents keyboard focus loss behind sticky chrome during rush navigation.

## Architecture Notes

1. Route orchestration remains in `app/kitchen/page.tsx`.
2. Kitchen domain logic is isolated under `features/kitchen/domain/`.
3. KDS rendering primitives live under `components/domain/kitchen/`.
4. Keyboard orchestration is in `hooks/useKDSInputController.ts`.

## Validation and Quality Gates

Required command set:

- `npm run lint`
- `npm run type-check`
- `npm run test:docs`
- `npm run test`
- `npm run test:architecture`

Additionally, kitchen flow smoke coverage must verify both touch and keyboard operation paths.
