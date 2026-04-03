---
phase: 3
title: "Cache eviction + public API export"
status: completed
priority: P2
effort: 30m
---

# Phase 3 — Cache Eviction & Public API Export

Closes audit finding #1.

## Status

- Completed
- Validation green

## Files

| Action | File |
|--------|------|
| Modify | `src/shape/compile-text-mask-shape-for-layout.ts` |
| Modify | `src/index.ts` |

## Completed Work

- [x] Added bounded text-mask cache behavior with capped size and hit promotion
- [x] Added `clearTextMaskShapeCache()` in `src/shape/compile-text-mask-shape-for-layout.ts`
- [x] Re-exported `clearTextMaskShapeCache` from `src/index.ts`
- [x] Verified the public surface in `dist/index.d.ts`

## Validation

- [x] `npm run check`
- [x] `npm run build`
- [x] `dist/index.d.ts` exports `clearTextMaskShapeCache`

## Notes

- Only one public API addition in this plan: `clearTextMaskShapeCache`
- Cache fix is implemented in current tree and no longer left as a follow-up
