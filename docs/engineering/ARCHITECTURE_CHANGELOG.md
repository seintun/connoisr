# Architecture Changelog

Use this changelog for architecture-impacting changes.  
Keep entries concise and always include affected files.

## Template

```md
## YYYY-MM-DD

- Summary:
- Why:
- Impact:
- Affected files:
  - path/a
  - path/b
```

## 2026-02-11

- Summary: Rebuilt kitchen board architecture for hybrid touch + keyboard operation with a dedicated kitchen domain/view-model layer and modular KDS components.
  - Why: Support both iPad touch stations and monitor + keyboard stations while preserving one product surface and consistent status behavior.
  - Impact: Kitchen route now composes domain selectors and dedicated KDS components; keyboard command flow is centralized and testable.
  - Affected files:
    - `app/kitchen/page.tsx`
    - `hooks/useKDSInputController.ts`
    - `features/kitchen/domain/kdsPrioritization.ts`
    - `features/kitchen/domain/kdsModifiers.ts`
    - `features/kitchen/domain/kdsSelectors.ts`
    - `features/kitchen/domain/kdsCommands.ts`
    - `components/domain/kitchen/KDSHeader.tsx`
    - `components/domain/kitchen/KDSOrderCard.tsx`
    - `components/domain/kitchen/KDSModifierBlock.tsx`
    - `components/domain/kitchen/KDSStatusAction.tsx`
    - `components/domain/kitchen/KDSKeyboardHelp.tsx`
    - `components/domain/kitchen/KDSInputHintBar.tsx`
    - `tests/e2e/sync.spec.ts`
    - `docs/engineering/KDS_HYBRID_INPUT_DESIGN.md`
    - `docs/engineering/REPO_ARCHITECTURE.md`
    - `docs/engineering/ARCHITECTURE_CHANGELOG.md`
    - `docs/qa/CI_TESTING_PIPELINE.md`
    - `docs/README.md`
- Summary: Added architecture governance docs and agent requirements for mandatory architecture documentation updates.
  - Why: Ensure AI and contributors can infer current structure reliably and keep documentation synchronized with code changes.
  - Impact: Agents now have explicit rules for architecture references and update cadence.
  - Affected files:
    - `AGENTS.md`
    - `docs/engineering/AI_FEATURE_CONVENTIONS.md`
    - `docs/engineering/REPO_ARCHITECTURE.md`
    - `docs/engineering/ARCHITECTURE_CHANGELOG.md`
- Summary: Reorganized repository documentation with a central index, fixed stale references, and marked historical plans to avoid source-of-truth conflicts.
  - Why: Improve AI indexing and inference quality by reducing duplicate guidance and clarifying authoritative docs.
  - Impact: Documentation navigation is explicit, broken ADR references are resolved, and legacy plans are clearly scoped as historical.
  - Affected files:
    - `docs/README.md`
    - `AGENTS.md`
    - `README.md`
    - `CONTRIBUTING.md`
    - `PROJECT_CONTEXT.md`
    - `docs/engineering/REPO_ARCHITECTURE.md`
    - `docs/plan/QA_IMPLEMENTATION_PLAN.md`
    - `docs/plan/QA_STRATEGY.md`
    - `docs/plan/performance-enhancements-v1.md`
    - `docs/plan/performance-enhancements-v1-walkthrough.md`
    - `docs/plan/turbo-onboarding.md`
    - `docs/adr/cart-order-invariants.md`
- Summary: Hardened local/CI script gates for architecture and documentation consistency, and optimized lint execution with cache.
  - Why: Keep modularity and documentation goals continuously enforced with faster feedback loops.
  - Impact: `pre-push` and CI now enforce architecture/docs guards; lint runs faster with cache; quality command set is standardized.
  - Affected files:
    - `scripts/architecture-guards.mjs`
    - `scripts/docs-guards.mjs`
    - `package.json`
    - `.husky/pre-push`
    - `.github/workflows/ci.yml`
    - `AGENTS.md`
    - `CONTRIBUTING.md`
    - `docs/engineering/AI_FEATURE_CONVENTIONS.md`
    - `docs/qa/CI_TESTING_PIPELINE.md`
- Summary: Refined KDS sticky header density and keyboard focus scrolling so focused tickets stay visible between top and bottom sticky rails.
  - Why: Prevent focus/context loss on mobile and keyboard-only operation while preserving glanceable status context.
  - Impact: `/kitchen` now computes focus scroll against dynamic sticky header/hint-bar offsets; mobile header uses a tighter, single-row metric rail.
  - Affected files:
    - `app/kitchen/page.tsx`
    - `components/domain/kitchen/KDSHeader.tsx`
    - `docs/engineering/KDS_HYBRID_INPUT_DESIGN.md`
    - `docs/engineering/ARCHITECTURE_CHANGELOG.md`
- Summary: Reordered KDS header status metrics by urgency and removed mobile horizontal overflow in the KPI rail.
  - Why: Kitchen staff need an urgency-first, no-scroll summary in portrait mode and clearer `Active` visibility.
  - Impact: KDS header now surfaces `Active` beside the title and renders metrics as `Overdue`, `Ready`, `Cooking`, `Ordered` without the `Modified` summary chip.
  - Affected files:
    - `components/domain/kitchen/KDSHeader.tsx`
    - `app/kitchen/page.tsx`
    - `__tests__/components/KDSHeader.test.tsx`
    - `docs/engineering/KDS_HYBRID_INPUT_DESIGN.md`
    - `docs/engineering/ARCHITECTURE_CHANGELOG.md`
- Summary: Converted KDS bottom hint bar to a persistent fixed command rail and compacted mobile ticket density.
  - Why: Keep controls reachable at scroll end and reduce oversized ticket chrome on iPhone portrait without losing glanceability.
  - Impact: Command rail now stays pinned to viewport bottom; order cards use tighter mobile typography/spacing for faster scanning.
  - Affected files:
    - `components/domain/kitchen/KDSInputHintBar.tsx`
    - `components/domain/kitchen/KDSOrderCard.tsx`
    - `docs/engineering/KDS_HYBRID_INPUT_DESIGN.md`
    - `docs/engineering/ARCHITECTURE_CHANGELOG.md`
