---
phase: 1
title: "DRY: Extract intersectIntervalSets"
status: completed
priority: P2
effort: 15m
---

# Phase 1 — Extract `intersectIntervalSets`

## Status

- Completed
- Audit finding #5 closed

## Files

| Action | File |
|--------|------|
| Create | `src/geometry/intersect-interval-sets.ts` |
| Modify | `src/geometry/get-band-intervals-from-polygon.ts` |
| Modify | `src/shape/build-text-mask-bands-from-alpha.ts` |

## Completed Work

- [x] Created shared `src/geometry/intersect-interval-sets.ts`
- [x] Removed duplicate local `intersectIntervalSets` implementation from polygon band generation
- [x] Removed duplicate local `intersectIntervalSets` implementation from text-mask alpha band generation
- [x] Kept the helper internal-only with no new public API surface

## Validation

- [x] Included in repo validation run: `npm run check`

## Notes

- Mechanical DRY extraction only
- Behavior unchanged by design
