# Project Overview PDR

## Product

`shape-text` is a browser-first TypeScript library that places text inside polygon or glyph-derived shapes and renders the result to SVG.

## Problem

Web CSS can wrap text around floated shapes, but it does not provide a solid, portable way to fill text inside arbitrary shapes. We need a small library that solves that exact gap and supports dynamic glyph-shaped layouts such as numeric clocks.

## V1 Requirements

- Accept polygon input
- Accept text-mask input from glyph text and font
- Measure and stream paragraph lines through shape bands
- Support repeat-fill mode for dense glyph fills
- Support structured text formatting params for size, family, weight, style, and color
- Support renderer-only shape decoration for fill, border, and shadow
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
- The library can compile reusable shape bands for polygon and text-mask shapes
- The library can repeat source text until the target shape bands are full
- The library returns line positions inside the target shape
- The library renders those lines to SVG with optional shape decoration
- Build and tests pass
