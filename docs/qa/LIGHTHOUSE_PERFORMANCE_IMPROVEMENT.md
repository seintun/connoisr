# Lighthouse Performance Improvement: `/table/demo`

## Date

- 2026-02-11

## Scope

- Route: `http://localhost:3000/table/demo`
- Primary target: improve Lighthouse Performance score by reducing LCP delays and improving LCP image prioritization.

## Baseline (from local audit)

- Performance: `70`
- Largest Contentful Paint (LCP): `8.9s`
- Total Blocking Time (TBT): `250ms`
- Key opportunities:
  - `LCP request discovery`: missing `fetchpriority=high` on the LCP image.
  - `Render blocking requests`: route CSS chunk on the critical path.
  - `Missing source maps for large first-party JavaScript` (unscored, mostly observed in local dev audits).

## Implemented Changes

1. Deterministic LCP image prioritization in `app/table/[id]/DinerPageClient.tsx`.
   - Priority is now based on the first 4 global menu items, not first 4 items per category loop.
   - This avoids over-prioritizing images and ensures the top-of-page candidates are consistently treated as high priority.
2. Explicit image fetch priority in `components/domain/DinerMenuItem.tsx`.
   - Added `fetchPriority="high"` and `loading="eager"` for prioritized images.
   - Non-priority images remain lazy.
3. Added `preconnect` hint for Unsplash in `app/layout.tsx`.
   - `<link rel="preconnect" href="https://images.unsplash.com" />`
   - Reduces connection setup overhead for hero/top image fetches.
4. Added regression coverage in `__tests__/components/DinerMenuItem.test.tsx`.
   - Verifies prioritized cards emit high fetch priority behavior.
5. Tightened responsive image delivery for menu cards.
   - Updated image `sizes` in `components/domain/DinerMenuItem.tsx` to match actual card layout breakpoints.
   - Expanded Next image breakpoints in `next.config.ts`:
     - `deviceSizes` now includes smaller mobile widths (`320`, `375`, `414`) so mobile cards are less likely to receive oversized image candidates.
     - `imageSizes` includes additional small widths (`112`, `160`, `320`) for better fit across mixed card layouts.
6. Reduced route JavaScript execution on `/table/[id]`.
   - Removed `framer-motion` from `app/table/[id]/DinerPageClient.tsx` wrapper/render path.
   - Replaced animated `motion.*` controls in `components/domain/DinerMenuItem.tsx` with CSS transitions.
   - Lazy-loaded `ImageLightbox` from `components/domain/DinerMenuItem.tsx` via `next/dynamic` so lightbox code is not part of initial critical route JS.
7. Removed `framer-motion` from remaining startup UI components.
   - Replaced animation wrappers with CSS transitions in:
     - `components/domain/FloatingCart.tsx`
     - `components/onboarding/IdentityModal.tsx`
     - `components/ui/ThemeToggle.tsx`
     - `components/domain/NetworkStatus.tsx`
   - This further reduces script parse/evaluation cost for first load.
8. Accessibility fixes from Lighthouse audits.
   - Removed viewport zoom restrictions in `app/layout.tsx` by dropping `userScalable: false` and `maximumScale: 1`.
   - Increased dark-mode contrast for primary UI text by updating `--primary-foreground` in `app/globals.css`.
   - Targets failing elements reported for category pill and add-button text contrast.
9. Contrast follow-up pass for persistent dark-mode button failures.
   - Tuned dark-mode primary palette in `app/globals.css`:
     - `--primary: 35 70% 38%`
     - `--primary-foreground: 0 0% 98%`
   - This specifically raises contrast for `bg-primary` + `text-primary-foreground` controls (`Starters`, `Add`).

## Validation

Run:

```bash
npm run lint
npm run type-check
npm run test:docs
npm run test
```

Then re-run Lighthouse against a production build for reliable metrics:

```bash
npm run build
npm run start
```

## Notes

- The `Missing source maps` Lighthouse warning is commonly noisy in local development mode and is unscored.
- Track score deltas using production-mode runs to avoid dev-server compilation effects.
- The `Improve image delivery` audit should be evaluated after a fresh production rebuild because Next image `srcset` candidates are derived from `next.config.ts`.
- `Minify JS/CSS`, `Reduce unused JavaScript`, and BFCache warnings can be inflated in local dev audits; verify on production build output (`npm run build && npm run start`) before final conclusions.
