# shape-text

Browser-first TypeScript library for laying out text inside polygon shapes and rendering the result to SVG.

## V1 scope

- SVG renderer
- Polygon input
- Latin/Vietnamese first
- Single closed shape, no holes
- Shape-first API, not a thin wrapper over `pretext`

## Install

```bash
npm install shape-text
```

## Quick start

```ts
import {
  createCanvasTextMeasurer,
  layoutTextInShape,
  renderLayoutToSvg,
} from 'shape-text'

const measurer = createCanvasTextMeasurer()

const layout = layoutTextInShape({
  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  font: '16px "Helvetica Neue", Arial, sans-serif',
  lineHeight: 22,
  shape: {
    kind: 'polygon',
    points: [
      { x: 0, y: 0 },
      { x: 240, y: 0 },
      { x: 240, y: 280 },
      { x: 0, y: 280 },
    ],
  },
  measurer,
})

const svg = renderLayoutToSvg(layout, {
  background: '#fffdf7',
  textFill: '#111827',
  shapeStroke: '#d1d5db',
  showShape: true,
})
```

## Public API

- `createCanvasTextMeasurer()`
- `prepareTextForLayout()`
- `layoutNextLineFromPreparedText()`
- `getBandIntervalsFromPolygon()`
- `layoutTextInShape()`
- `renderLayoutToSvg()`

## Notes

- V1 keeps the text engine simple on purpose. It uses `Intl.Segmenter` for grapheme-safe word breaking, but it does not promise full browser-parity for every writing system.
- The project takes inspiration from `pretext` for the `prepare -> layout` split and streaming line iteration, but owns its geometry, slot policy, and public API.

