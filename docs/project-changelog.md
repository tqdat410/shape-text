# Project Changelog

## 2026-03-30

- Bootstrapped repository
- Added shape-first layout core
- Added SVG renderer
- Added initial tests and docs
- Added local Playwright E2E setup with static fixture page
- Added compiled shape boundary for cache-friendly layout
- Added `text-mask` glyph shape support
- Added `autoFill` repeat mode for dense shape fills
- Added browser E2E coverage for glyph-based layout
- Added compiler guards for invalid alpha thresholds and oversized raster requests
- Added cache safety for late-loading fonts and frozen compiled shapes
- Added Vitest coverage support and direct text-mask compiler tests

## 2026-04-01

- Added structured `textStyle` API for text size, family, weight, style, and default color
- Added renderer-side `shapeStyle` API for shape fill, border, and shadow
- Added `autoFillMode: 'dense'` for whitespace-stripped grapheme repeat fill inside compiled shape bands
- Added `fillStrategy: 'max'` for all-slot glyph coverage without mini-font fallback, while preserving spaces in the repeat stream
- Added `shape.shapeTextMode: 'per-character'` for ordered non-space text-mask regions and sequential per-region layout flow
- Replaced top-level text-mask `width` / `height` / `padding` with `shape.size`, defaulting text-mask sizing to `fit-content`
- Added demo payload editing, freeform glyph-shape text input, and predefined random character-pattern fill presets
- Added a scrollable demo full-output SVG viewport with zoom in/out, reset, and fit controls for wide or tall renders
- Kept legacy `font`, `textFill`, `shapeFill`, and `shapeStroke` compatibility paths
- Extended local demo and Playwright coverage for style and decoration controls

## 2026-04-02

- Reframed the product language around `shape paragraph`
- Standardized the two primary shape-source directions as geometry input and value-derived input
- Replaced the static fixture browser demo with a small React workbench under `demo/`
- Rewrote Playwright coverage against visible React app behavior instead of a private `window` test API
- Moved the local browser workflow to Vite + React and removed the legacy static fixture server scripts
- Kept payload JSON editing as an advanced workbench panel instead of a parallel demo-only state architecture
- Fixed Windows `npm run demo` / `npm run e2e:*` execution under `\\?\C:\...` cwd by resolving package-root script entrypoints explicitly instead of relying on relative cwd paths
- Simplified browser E2E to run against the built preview app on a dedicated Playwright port, so local tests are closer to the shipped browser path
- Simplified repeat fill to one product path: `autoFill: true` now always routes to max fill
- Removed the workbench fill-mode selector and the medium weight option
- Changed workbench fill presets from seeded deterministic strings to true-random generation with reroll support
- Tightened package metadata for library shipping, including `sideEffects`, publish metadata, and LICENSE packaging
- Cleaned the library build so `dist/` no longer ships compiled test files
- Added `npm` + `bun` ship-readiness smoke checks for tarball generation and consumer import validation
- Added GitHub Actions CI for library validation and browser integration
- Added a tag-driven release workflow with semver tag guarding and npm-first publish automation
- Added a maintainer deployment guide covering trusted publishing, token fallback, and branch protection
- Added a Windows-safe manual `npm run publish:npm` path for first-time local publishes from `\\?\C:\...` terminals
- Made the tag-driven release workflow idempotent so GitHub releases can still be created after a manual npm publish of the same version
- Trimmed public GitHub-facing docs so the top-level surface stays focused on the library API and release flow instead of the internal demo app
