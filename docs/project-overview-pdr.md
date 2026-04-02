# Project Overview PDR

## Product

`shape-text` is a browser-first TypeScript library for shape-paragraph layout. It places text inside either explicit geometry or value-derived shapes and renders the result to SVG.

## Problem

Web CSS can wrap text around floated shapes, but it does not provide a solid, portable way to fill text inside arbitrary shapes. We need a small library that solves that exact gap, supports dynamic value-derived layouts such as numeric clocks, and has a real browser workbench for manual verification.

## V1 Requirements

- Accept geometry input
- Accept value-derived input from glyph text and font
- Measure and stream paragraph lines through shape bands
- Support max-fill repeat coverage for decorative glyph fills
- Support structured text formatting params for size, family, weight, style, and color
- Support renderer-only shape decoration for fill, border, and shadow
- Ship a React browser workbench that exercises the library directly
- Return deterministic line geometry
- Render to SVG
- Support Latin/Vietnamese first

## Non-Goals

- Holes and multi-island shapes
- Full browser parity for all writing systems
- DOM selection-grade renderer
- Justified typography
- Multi-island glyph routing

## Acceptance Criteria

- A caller can pass text, text formatting, line height, shape input, and measurer
- The library can compile reusable shape bands for geometry and value-derived shapes
- The library can repeat source text until the target shape bands are full
- The library returns line positions inside the target shape
- The library renders those lines to SVG with optional shape decoration
- The React workbench covers both shape-source directions and the advanced payload editor path
- Build and tests pass
