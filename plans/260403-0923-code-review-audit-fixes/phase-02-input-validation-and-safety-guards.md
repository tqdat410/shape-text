---
phase: 2
title: "Input validation & safety guards"
status: completed
priority: P2
effort: 30m
---

# Phase 2 — Input Validation & Safety Guards

Closes audit findings #2, #3, #4.

## Status

- Completed
- Validation green

## Files

| Action | File | Finding |
|--------|------|---------|
| Create | `src/geometry/assert-finite-shape-text-points.ts` | #2 polygon point validation |
| Modify | `src/shape/compile-polygon-shape-for-layout.ts` | #2 polygon point validation |
| Modify | `src/text/layout-next-line-from-repeated-text.ts` | #3 repeated-text loop guard |
| Modify | `src/render/normalize-shape-decoration.ts` | #4 blur cap |
| Modify | `src/layout/layout-text-in-shape.test.ts` | #2 validation coverage |
| Create | `src/geometry/get-band-intervals-from-polygon.test.ts` | #2 validation coverage |
| Create | `src/text/layout-next-line-from-repeated-text.test.ts` | #3 safety coverage |
| Modify | `src/render/render-layout-to-svg.test.ts` | #4 validation coverage |

## Completed Work

- [x] Added reusable finite-coordinate validation through `src/geometry/assert-finite-shape-text-points.ts`
- [x] Wired polygon compilation through the new point validator before bounds/interval work
- [x] Added repeated-text protection for zero-grapheme tokens, including all-empty token streams
- [x] Added hard upper bound for `shapeStyle.shadow.blur`
- [x] Added or updated tests for polygon coordinate rejection, repeated-text safety, and blur rejection

## Validation

- [x] `npm run check`
- [x] Polygon validation tests green
- [x] Repeated-text loop guard tests green
- [x] Render blur guard tests green

## Notes

- Finding #2 landed as a reusable helper, not an inline loop
- Finding #3 remains defense-in-depth, but now safe for manually constructed exported types too
