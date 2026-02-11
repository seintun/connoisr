# AI Feature Conventions

This guide defines implementation conventions for AI agents and contributors.

## Where This Should Live

- **Root entrypoint for agents**: `AGENTS.md`
- **Detailed engineering guide**: `docs/engineering/AI_FEATURE_CONVENTIONS.md`
- **Current architecture snapshot**: `docs/engineering/REPO_ARCHITECTURE.md`
- **Architecture history**: `docs/engineering/ARCHITECTURE_CHANGELOG.md`
- **Contributor-facing setup and workflow**: `CONTRIBUTING.md`

## 1. Component Naming and Debuggability

### `displayName` requirements

Add explicit `displayName` for:

1. All exported UI components.
2. All `React.memo(...)` and `forwardRef(...)` components.
3. Provider components and key context boundaries.

Example:

```ts
export const DinerMenuItem = React.memo(function DinerMenuItem() {
  // ...
});

DinerMenuItem.displayName = 'DinerMenuItem';
```

### Why

- Better React DevTools tree.
- Clearer stack traces and runtime error analysis.

## 2. `data-testid` Convention

Use `data-testid` selectively, not everywhere.

### Required

1. Primary action buttons (`submit`, `open`, `close`, `send`, `pay`).
2. Critical state containers (empty states, page wrappers, modal/sheet roots).
3. Repeated list items that need deterministic test selection.

### Avoid

1. Decorative-only wrappers.
2. Every nested element in a component.

### Naming

- Use kebab-case, intent-based names.
- Prefer stable semantics over visual naming.

Examples:

- `checkout-sheet`
- `send-order-btn`
- `menu-item-card-item-7`

## 3. Test Creation Convention

For each feature/fix:

1. Add/update unit tests for pure logic (`features/*/domain` and `lib/*`).
2. Add/update component tests for UI behavior changes.
3. Add/update e2e tests for critical user-flow changes.

### Minimum expectations per change

1. New domain helper: unit test.
2. New UI action: component test.
3. Cross-surface behavior/sync/offline change: e2e or integration-level assertion.

### Commands

```bash
npm run lint
npm run type-check
npm run test
```

If architecture rules apply:

```bash
npm run test:architecture
```

## 4. Accessibility (a11y) Convention

### Interactive elements

1. Use semantic controls (`button`, `a`, `input`) first.
2. If non-semantic clickable containers are required, add:
   - keyboard support
   - appropriate role
   - accessible name/label

### Labels and announcements

1. Inputs must have clear labels or accessible placeholder + context.
2. Status banners should remain readable by assistive tech.
3. Do not rely only on color for state signaling.

### Focus and keyboard

1. Focus styles must remain visible.
2. Modal/sheet close interactions must be keyboard accessible.
3. `Escape` behavior should be consistent for overlays.

## 5. Touch/Interaction UX Convention

1. Prevent accidental text highlight on touch targets.
2. Keep form fields selectable/editable.
3. Use `touch-action: manipulation` for tap interactions.

Global baseline is in:

- `app/globals.css`

For custom clickable wrappers, mark:

- `data-touchable="true"`

## 6. Architecture and Feature Best Practices

### Separation of concerns

1. Keep domain rules in `features/*/domain`.
2. Keep persistence/sync in services/repositories.
3. Keep components focused on rendering and interaction orchestration.

### Reuse over duplication

1. Use shared grouping/selector/money helpers.
2. Avoid re-implementing identity/grouping logic inside UI components.

### Side effects

Avoid hard UI side effects in domain components:

1. `alert(...)`
2. `location.reload(...)`
3. runtime style/script injection

These are guarded by:

- `scripts/architecture-guards.mjs`

## 7. Documentation Convention For Refactors

When implementing planned phases/refactors:

1. Document each phase in `docs/refactor/phase-*.md`.
2. Include:
   - state (`completed`, date)
   - actions taken
   - why
   - validation commands
   - follow-up

## 8. Documentation Convention For Architecture Changes

For any architecture-impacting change (module boundaries, ownership, data flow, storage/sync, repository contracts):

1. Update `docs/engineering/REPO_ARCHITECTURE.md` to reflect current-state structure.
2. Add a dated entry in `docs/engineering/ARCHITECTURE_CHANGELOG.md`.
3. Update relevant `docs/refactor/phase-*.md` when change is part of a phase plan.
4. Keep these updates in the same PR/commit set as code changes.

## 9. Pull Request Readiness Checklist

Before finalizing:

1. Conventions followed (`displayName`, targeted test IDs, a11y basics).
2. Tests added/updated.
3. Validation commands pass.
4. `REPO_ARCHITECTURE.md` and `ARCHITECTURE_CHANGELOG.md` updated for architecture-impacting changes.
5. Docs updated when conventions changed.
