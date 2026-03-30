# Project Overview PDR

## Product

`shape-text` is a browser-first TypeScript library that places paragraph text inside polygon shapes and renders the result to SVG.

## Problem

Web CSS can wrap text around floated shapes, but it does not provide a solid, portable way to fill text inside arbitrary shapes. We need a small library that solves that exact gap.

## V1 Requirements

- Accept polygon input
- Measure and stream paragraph lines through shape bands
- Return deterministic line geometry
- Render to SVG
- Support Latin/Vietnamese first

## Non-Goals

- Holes and multi-island shapes
- Full browser parity for all writing systems
- DOM selection-grade renderer
- Justified typography

## Acceptance Criteria

- A caller can pass text, font, line height, polygon, and measurer
- The library returns line positions inside the polygon
- The library renders those lines to SVG
- Build and tests pass

