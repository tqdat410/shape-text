---
title: "Code Review Audit Fixes"
description: "Fix 6 issues from parallel codebase audit: cache eviction, input validation, loop guard, blur cap, DRY extraction, example Node engine."
status: completed
priority: P2
effort: 2h
branch: main
tags: [bugfix, validation, security, DRY, maintenance]
created: 2026-04-03
---

# Code Review Audit Fixes

## Outcome

- Plan complete. `4/4` phases done.
- Audit fixes complete. `6/6` findings closed.
- Validation green. Review gate cleared.

## Source Reports

- `plans/reports/code-review-260403-0907-parallel-codebase-audit.md`
- `plans/reports/code-review-260403-0921-published-consumer-pending-review.md`

## Phases

- [x] [Phase 01](./phase-01-extract-intersect-interval-sets.md) - extract shared `intersectIntervalSets` helper and remove duplicate implementations
- [x] [Phase 02](./phase-02-input-validation-and-safety-guards.md) - close polygon validation, repeated-text loop safety, and shadow blur guard findings
- [x] [Phase 03](./phase-03-cache-eviction-and-api-export.md) - add bounded text-mask cache behavior and export `clearTextMaskShapeCache`
- [x] [Phase 04](./phase-04-example-node-engine.md) - declare example-only Node engine floor for the Vite 7 toolchain

## Progress

- Phases: `4/4` completed
- Findings: `6/6` fixed
- Public API delta: `clearTextMaskShapeCache` only

## Validation

- [x] `npm run check`
- [x] `npm run build`
- [x] `examples/react-published-package-consumer`: `npm run build`
- [x] `dist/index.d.ts` includes `clearTextMaskShapeCache`

## Review Gate

- `code-review-260403-0907-parallel-codebase-audit.md`: all 5 important findings addressed in current tree
- `code-review-260403-0921-published-consumer-pending-review.md`: remaining medium finding addressed in current tree
- No pending audit item left from the two source review reports
