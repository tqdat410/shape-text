# shape-text

Browser-first TypeScript library for shape-paragraph layout and SVG rendering.

## V1 scope

- SVG renderer
- Geometry input
- Value-derived input from text masks
- Latin/Vietnamese first
- Single closed shape, no holes
- Shape-first API, not a thin wrapper over `pretext`
- Compile-shape boundary for cache-friendly repeated rendering

## Install

```bash
npm install shape-text
bun add shape-text
```

## Published consumer example

A small React consumer app lives at [examples/react-published-package-consumer](./examples/react-published-package-consumer/). It now renders a minimal ICT `HH:mm:SS` clock screen plus a reaching-hand SVG-mask fill example below it, all driven by the package exports. Inside this repo it installs `shape-text` through a local file dependency instead of aliasing source files, so the app validates the real packaged surface of the current tree.

## Ship readiness

Library packaging is validated for both `npm` and `bun`.

```bash
npm run ship:check
```

That flow currently checks:

- clean library build output
- `npm pack` tarball contents
- `bun pm pack` compatibility
- smoke install + ESM import via both `npm` and `bun`

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
    // Swap `family` to any browser-available font stack.
    family: '"Helvetica Neue", Arial, sans-serif',
    // Increase or decrease `size` with `lineHeight` together.
    size: 16,
    // Typical weights: 400, 500, 700.
    weight: 700,
    // `style` can be omitted, `italic`, or `oblique`.
    style: 'italic',
    color: '#111827',
  },
  lineHeight: 22,
  shape: {
    // Replace `polygon` with `text-mask` for value-derived shapes.
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
    // Replace the palette or omit `shapeStyle` if you only want the text layer.
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

## Shape sources

`shape-text` currently ships three first-class ways to provide the shape paragraph surface:

- Geometry input: pass explicit polygon points
- Value-derived input: pass a `text-mask` shape derived from text and font
- SVG mask input: pass a silhouette path and viewBox through `svg-mask`

The low-level API term stays `text-mask`, but the product framing is `value-derived shape`.

## SVG mask example

```ts
const layout = layoutTextInShape({
  text: 'Shape paragraph can also fill an authored SVG silhouette.',
  textStyle: {
    family: '"Ubuntu", sans-serif',
    size: 12,
    weight: 400,
    color: '#ffffff',
  },
  lineHeight: 14,
  autoFill: true,
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
  },
  measurer,
})
```

## Value-derived example

```ts
const layout = layoutTextInShape({
  text: 'Shape paragraph can fill a value-derived silhouette too.',
  textStyle: {
    family: 'Arial, sans-serif',
    size: 16,
    weight: 700,
    color: '#0f172a',
  },
  lineHeight: 20,
  // Set `autoFill: false` for normal paragraph flow instead of max-fill repeat coverage.
  autoFill: true,
  shape: {
    kind: 'text-mask',
    // Replace with any glyph string, for example `SALE`, `09`, or `AB`.
    text: '23',
    font: '700 420px Arial',
    size: {
      // Use `fixed` with explicit `width` / `height` when you need a forced raster box.
      mode: 'fit-content',
      padding: 10,
    },
  },
  measurer,
})
```

## Sequential value-derived regions

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
    // Omit this or set `whole-text` to treat the full string as one shape region.
    shapeTextMode: 'per-character',
  },
  measurer,
})
```

`shape.size` defaults to `{ mode: 'fit-content', padding: 0 }`. Use `mode: 'fixed'` only when you need to force the glyph mask into an explicit raster box.

`shape.shapeTextMode` defaults to `'whole-text'`. Set it to `'per-character'` to compile one ordered region per non-space grapheme and flow layout through those regions in shape-text order.

## Random fill helpers

```ts
import { createRandomFillText } from 'shape-text'

const fillText = createRandomFillText({
  // Presets: 'ascii', 'binary', 'hex', 'octal', 'symbol'.
  preset: 'hex',
  // Omit `length` to use the preset default length.
  length: 48,
})

const customFillText = createRandomFillText({
  // Custom alphabets work too.
  alphabet: 'ABCD1234',
  length: 32,
})
```

## Public API

- `createCanvasTextMeasurer()`
- `createRandomFillText()`
- `compileShapeForLayout()`
- `clearTextMaskShapeCache()`
- `getRandomFillPreset()`
- `normalizeTextStyleToFont()`
- `prepareTextForLayout()`
- `randomFillPresets`
- `layoutNextLineFromPreparedText()`
- `layoutNextLineFromRepeatedText()`
- `getBandIntervalsFromPolygon()`
- `layoutTextInCompiledShape()`
- `layoutTextInShape()`
- `renderLayoutToSvg()`

## Notes

- V1 keeps the text engine simple on purpose. It uses `Intl.Segmenter` for grapheme-safe word breaking, but it does not promise full browser-parity for every writing system.
- The project takes inspiration from `pretext` for the `prepare -> layout` split and streaming line iteration, but owns its geometry, slot policy, and public API.
- Geometry and value-derived shapes both compile into reusable line bands before layout.
- `text-mask` shapes are raster-compiled into reusable line bands. This is the default value-derived path for browser fonts such as `Arial`, and it is designed so callers can precompile `0-9` and `:` for clock-like UIs.
- `svg-mask` shapes are raster-compiled from a local SVG path silhouette plus viewBox. V1 intentionally accepts path geometry, not arbitrary raw SVG markup or remote assets.
- `autoFill: true` now means one thing: max-fill stream layout that sweeps every usable interval in reading order.
- Max fill keeps spaces as normal graphemes instead of stripping them, and it does not fall back to smaller text for leftover pockets.
- Random fill helpers are content utilities only; they generate source text but do not change layout rules.
- `text-mask` sizing now lives under `shape.size`. The default `fit-content` mode measures the text mask first and grows the raster box to avoid clipping multi-character shapes such as `23`.
- `shape.shapeTextMode: 'per-character'` keeps the full text-mask debug view, but also compiles ordered per-character regions for sequential fill across multi-character shape text.
- `textStyle` is the new data-driven API for size, weight, italic/oblique, family, and default text color. Legacy `font` string input still works.
- `shapeStyle` lives in `renderLayoutToSvg()` because fill, border, and shadow do not affect line breaking or shape compilation.
- For late-loading web fonts, compile after the font is ready if you want immediate cache reuse. The compiler skips cache writes until `document.fonts.check()` reports the font as ready.

## Maintainer checks

Run the local validation stack:

```bash
npm run check
npm run ship:check
npm run e2e
```

Useful extras:

```bash
npm run test:coverage
npm run e2e:ui
npm run e2e:headed
```

## Publish notes

- Published package surface is limited to `dist/`, `README.md`, and `LICENSE`
- `npm pack` / `npm publish` trigger a clean library rebuild through `prepack`
- Build output excludes test files so the tarball stays library-only
- On Windows terminals that start inside a `\\?\C:\...` cwd, prefer `npm run publish:npm` instead of raw `npm publish`
- PR validation now runs through `.github/workflows/ci.yml`
- Tag releases now run through `.github/workflows/release.yml`
- Release tags now skip npm publish automatically if that exact version already exists on npm
- Preferred publish path after the first release is npm Trusted Publisher via GitHub Actions OIDC, with `NPM_TOKEN` as fallback only
- Maintainer release steps and repository settings live in [docs/deployment-guide.md](./docs/deployment-guide.md)
