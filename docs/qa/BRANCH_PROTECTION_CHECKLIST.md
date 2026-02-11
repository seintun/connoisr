# Branch Protection Checklist

Use this checklist when configuring GitHub branch protection for `main` and `develop`.

## Target Branches

- [ ] `main`
- [ ] `develop`

## Core Protection Rules

- [ ] Require a pull request before merging.
- [ ] Require approvals (recommended: at least 1).
- [ ] Dismiss stale approvals when new commits are pushed.
- [ ] Require review from Code Owners.
- [ ] Require conversation resolution before merging.
- [ ] Require branches to be up to date before merging.
- [ ] Restrict force pushes.
- [ ] Restrict branch deletion.

## Required Status Checks

- [ ] Require status checks to pass before merging.
- [ ] Required check: `quality`
- [ ] Required check: `e2e_pr_chromium`

Notes:

- `e2e_pr_chromium` is path-gated (runs when UI/e2e files change).
- If GitHub branch protection requires checks to be present on every PR, either:
  - include only checks that always run, or
  - remove path gating from PR e2e checks.

## Merge Policy

- [ ] Require linear history (recommended if you squash/rebase).
- [ ] Restrict who can push directly to protected branches.
- [ ] Allow bypass only for explicit maintainers (if needed).

## Vercel Integration

- [ ] Enable "Wait for checks to pass" for production deployments.
- [ ] Confirm required GitHub checks match branch protection settings.

## Verification Steps

1. Open a test PR touching only docs and confirm required checks behavior.
2. Open a test PR touching UI files and confirm both `quality` and `e2e_pr_chromium` run.
3. Confirm merge is blocked when required checks fail.
4. Confirm merge is blocked without required approval(s).
