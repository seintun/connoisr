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
