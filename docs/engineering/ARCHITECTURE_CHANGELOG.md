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
