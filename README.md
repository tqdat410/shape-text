# shape-text

Browser-first TypeScript library for laying out text inside custom shapes and rendering the result as SVG.

## Live demo

- Playground: https://tqdat410.github.io/shape-text/

## Install

```bash
npm install shape-text
bun add shape-text
```

## What it does

- flows text inside a polygon, text-derived mask, or SVG silhouette
- supports readable paragraph layout or decorative max-fill coverage
- returns a reusable compiled layout plus SVG output
- works well for clocks, badges, hero art, poster typography, and generative text fills

## Core flow

```ts
import {
  createCanvasTextMeasurer,
  layoutTextInShape,
  renderLayoutToSvg,
} from 'shape-text'

const measurer = createCanvasTextMeasurer()

const layout = layoutTextInShape({
  text: 'Shape text lets a paragraph live inside a silhouette.',
  textStyle: {
    family: '"Helvetica Neue", Arial, sans-serif',
    size: 16,
    weight: 700,
    color: '#111827',
  },
  lineHeight: 22,
  shape: {
    kind: 'polygon',
    points: [
      { x: 0, y: 0 },
      { x: 260, y: 0 },
      { x: 260, y: 320 },
      { x: 0, y: 320 },
    ],
  },
  measurer,
})

const svg = renderLayoutToSvg(layout, {
  background: '#fffdf7',
  shapeStyle: {
    backgroundColor: '#dbeafe',
    borderColor: '#94a3b8',
    borderWidth: 2,
  },
})
```

## Shape inputs

### 1. Polygon

Use this when you already have explicit points.

```ts
shape: {
  kind: 'polygon',
  points: [
    { x: 0, y: 0 },
    { x: 320, y: 0 },
    { x: 320, y: 240 },
    { x: 0, y: 240 },
  ],
}
```

### 2. Text mask

Use this when the shape itself should come from text like `23`, `SALE`, or `AB`.

```ts
shape: {
  kind: 'text-mask',
  text: '23',
  font: '700 420px Arial',
  size: {
    mode: 'fit-content',
    padding: 10,
  },
}
```

`shapeTextMode: 'per-character'` is useful when you want a multi-character mask like `AB` to behave as ordered regions instead of one combined silhouette.

### 3. SVG mask

Use this when you already have an authored vector silhouette.

```ts
shape: {
  kind: 'svg-mask',
  path: 'M 0 0 L 160 0 L 160 40 L 0 40 Z',
  viewBox: {
    width: 160,
    height: 40,
  },
  size: {
    mode: 'fit-content',
    padding: 4,
  },
}
```

`svg-mask` accepts path geometry plus `viewBox`. It does not accept arbitrary raw SVG markup or remote asset URLs.

## Layout options that matter most

- `textStyle`: family, size, weight, style, color
- `lineHeight`: vertical rhythm of the text lines
- `autoFill: true`: fill as much usable shape area as possible
- `shape.size`: `fit-content` or `fixed`
- `renderLayoutToSvg(..., { shapeStyle })`: optional background, border, and shadow for the shape layer

## Random fill helpers

```ts
import { createRandomFillText } from 'shape-text'

const fillText = createRandomFillText({
  preset: 'hex',
  length: 48,
})
```

Built-in presets:

- `ascii`
- `binary`
- `hex`
- `octal`
- `symbol`

## Public API

- `createCanvasTextMeasurer()`
- `createRandomFillText()`
- `compileShapeForLayout()`
- `clearTextMaskShapeCache()`
- `getBandIntervalsFromPolygon()`
- `getRandomFillPreset()`
- `layoutNextLineFromPreparedText()`
- `layoutNextLineFromRepeatedText()`
- `layoutTextInCompiledShape()`
- `layoutTextInShape()`
- `normalizeTextStyleToFont()`
- `prepareTextForLayout()`
- `randomFillPresets`
- `renderLayoutToSvg()`

## Current limits

- browser-first API
- single closed shape per layout
- no hole-aware geometry yet
- browser font loading still matters for `text-mask` cache reuse
- `Intl.Segmenter` keeps layout grapheme-safe, but this is not a full browser text engine replacement
