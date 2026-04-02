# shape-text

Browser-first TypeScript library for laying out text inside shapes and rendering the result to SVG.

## V1 scope

- SVG renderer
- Polygon input
- Text-mask input from glyph text
- Latin/Vietnamese first
- Single closed shape, no holes
- Shape-first API, not a thin wrapper over `pretext`
- Compile-shape boundary for cache-friendly repeated rendering

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
  textStyle: {
    family: '"Helvetica Neue", Arial, sans-serif',
    size: 16,
    weight: 700,
    style: 'italic',
    color: '#111827',
  },
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
  shapeStyle: {
    backgroundColor: '#dbeafe',
    borderColor: '#94a3b8',
    borderWidth: 2,
    shadow: {
      blur: 6,
      offsetY: 6,
    },
  },
})
```

## Text-mask autofill

```ts
const layout = layoutTextInShape({
  text: 'ONE',
  textStyle: {
    family: 'Arial, sans-serif',
    size: 16,
    weight: 700,
    color: '#0f172a',
  },
  lineHeight: 20,
  autoFill: true,
  fillStrategy: 'max',
  shape: {
    kind: 'text-mask',
    text: '2',
    font: '700 420px Arial',
    size: {
      mode: 'fit-content',
      padding: 10,
    },
  },
  measurer,
})
```

## Sequential text-mask regions

```ts
const layout = layoutTextInShape({
  text: 'ABCDEFGHIJ',
  textStyle: {
    family: 'Arial, sans-serif',
    size: 14,
    weight: 700,
  },
  lineHeight: 18,
  shape: {
    kind: 'text-mask',
    text: 'AB',
    font: '700 160px Arial',
    size: {
      mode: 'fixed',
      width: 260,
      height: 180,
    },
    shapeTextMode: 'per-character',
  },
  measurer,
})
```

`shape.size` defaults to `{ mode: 'fit-content', padding: 0 }`. Use `mode: 'fixed'` only when you need to force the glyph mask into an explicit raster box.

`shape.shapeTextMode` defaults to `'whole-text'`. Set it to `'per-character'` to compile one ordered region per non-space grapheme and flow layout through those regions in shape-text order.

## Public API

- `createCanvasTextMeasurer()`
- `compileShapeForLayout()`
- `normalizeTextStyleToFont()`
- `prepareTextForLayout()`
- `layoutNextLineFromPreparedText()`
- `layoutNextLineFromRepeatedText()`
- `getBandIntervalsFromPolygon()`
- `layoutTextInCompiledShape()`
- `layoutTextInShape()`
- `renderLayoutToSvg()`

## Notes

- V1 keeps the text engine simple on purpose. It uses `Intl.Segmenter` for grapheme-safe word breaking, but it does not promise full browser-parity for every writing system.
- The project takes inspiration from `pretext` for the `prepare -> layout` split and streaming line iteration, but owns its geometry, slot policy, and public API.
- `text-mask` shapes are raster-compiled into reusable line bands. This is the default path for browser fonts such as `Arial`, and it is designed so callers can precompile `0-9` and `:` for clock-like UIs.
- `autoFill: true` repeats the source text until the available shape bands are full.
- `autoFillMode: 'words'` is the default readable repeat behavior. `autoFillMode: 'dense'` strips whitespace and breaks at grapheme boundaries to pack shapes harder for decorative fills.
- `fillStrategy: 'max'` switches to an all-slots pass that fills every usable interval in reading order. It keeps spaces as normal graphemes instead of stripping them, and it does not fall back to smaller text for leftover pockets.
- `text-mask` sizing now lives under `shape.size`. The default `fit-content` mode measures the text mask first and grows the raster box to avoid clipping multi-character shapes such as `23`.
- `shape.shapeTextMode: 'per-character'` keeps the full text-mask debug view, but also compiles ordered per-character regions for sequential fill across multi-character shape text.
- `textStyle` is the new data-driven API for size, weight, italic/oblique, family, and default text color. Legacy `font` string input still works.
- `shapeStyle` lives in `renderLayoutToSvg()` because fill, border, and shadow do not affect line breaking or shape compilation.
- For late-loading web fonts, compile after the font is ready if you want immediate cache reuse. The compiler skips cache writes until `document.fonts.check()` reports the font as ready.

## Local E2E

Install the local browser once:

```bash
npx playwright install chromium
```

Run the local browser suite:

```bash
npm run e2e
```

Run unit coverage for `src/`:

```bash
npm run test:coverage
```

Useful dev modes:

```bash
npm run e2e:ui
npm run e2e:headed
npm run e2e:debug
```

The E2E fixture is a static page served from `/e2e/fixtures/index.html`. It imports the built library from `/dist/index.js`, so the browser test path stays very close to real package usage.

## Local Demo UI

If you just want to open a real browser UI and click around:

```bash
npm run demo
```

Then open:

```text
http://127.0.0.1:4173/
```

For a fast local loop without rebuilding first:

```bash
npm run build
npm run demo:dev
```

The demo now includes:

- direct `shape.text` editing for text-mask scenarios
- `shape.size.mode` switching between `fit-content` and `fixed`
- `shapeTextMode` switching between `whole-text` and sequential `per-character` text-mask regions
- a payload JSON editor for the live `layout` + `render` request
- a scrollable full-output SVG viewport with `Zoom out`, `Zoom in`, `100%`, and `Fit` controls
- predefined random character-pattern fill presets for quick repeat-fill experiments
