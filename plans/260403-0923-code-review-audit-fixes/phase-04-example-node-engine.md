---
phase: 4
title: "Example Node engine declaration"
status: completed
priority: P2
effort: 5m
---

# Phase 4 — Example Node Engine Declaration

Closes published consumer review finding #1.

## Status

- Completed
- Review item closed

## Files

| Action | File |
|--------|------|
| Modify | `examples/react-published-package-consumer/package.json` |

## Completed Work

- [x] Added example-level `engines.node` for the Vite 7 / `@vitejs/plugin-react` toolchain floor
- [x] Kept the root library Node floor unchanged because the library contract did not move
- [x] Removed the pending example compatibility gap called out in the review report

## Validation

- [x] `npm run check`
- [x] `examples/react-published-package-consumer`: `npm run build`

## Notes

- This phase fixes the example/toolchain contract mismatch only
- The library itself still targets the repo-level Node floor
