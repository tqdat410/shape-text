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
- Kept legacy `font`, `textFill`, `shapeFill`, and `shapeStroke` compatibility paths
- Extended local demo and Playwright coverage for style and decoration controls
