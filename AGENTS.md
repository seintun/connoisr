# AGENTS.md

This file is the default entrypoint for AI coding agents in this repository.

## Primary Reference

Use the following document as the source of truth for implementation conventions:

- `docs/engineering/AI_FEATURE_CONVENTIONS.md`

## Required Workflow For Feature Work

1. Follow component naming/test/a11y conventions in `docs/engineering/AI_FEATURE_CONVENTIONS.md`.
2. Add or update tests for all behavioral changes.
3. Run:
   - `npm run lint`
   - `npm run type-check`
   - `npm run test`
4. If UI architecture constraints apply, also run:
   - `npm run test:architecture`

## Scope

These rules apply to all changes under:

- `app/`
- `components/`
- `context/`
- `hooks/`
- `features/`
