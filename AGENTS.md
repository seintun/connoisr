# AGENTS.md

This file is the default entrypoint for AI coding agents in this repository.

## Primary Reference

Start here:

- `docs/README.md`

Use the following document as the source of truth for implementation conventions:

- `docs/engineering/AI_FEATURE_CONVENTIONS.md`
- `docs/engineering/REPO_ARCHITECTURE.md`
- `docs/engineering/ARCHITECTURE_CHANGELOG.md`

## Required Workflow For Feature Work

1. Follow component naming/test/a11y conventions in `docs/engineering/AI_FEATURE_CONVENTIONS.md`.
2. Read and align with current boundaries in `docs/engineering/REPO_ARCHITECTURE.md`.
3. Add or update tests for all behavioral changes.
4. Run:
   - `npm run lint`
   - `npm run type-check`
   - `npm run test:docs`
   - `npm run test`
5. If UI architecture constraints apply, also run:
   - `npm run test:architecture`

## Documentation Update Requirement

When architecture or module boundaries change, agents must update docs in the same change set:

1. Update `docs/engineering/REPO_ARCHITECTURE.md` for current-state structure.
2. Add an entry to `docs/engineering/ARCHITECTURE_CHANGELOG.md` with date, change summary, impact, and affected files.
3. If the change is part of planned refactor work, update or add the corresponding `docs/refactor/phase-*.md`.

## Scope

These rules apply to all changes under:

- `app/`
- `components/`
- `context/`
- `hooks/`
- `features/`
