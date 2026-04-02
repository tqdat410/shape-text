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
