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

## Local demo and browser E2E

```bash
npx playwright install chromium
npm run demo
npm run e2e:ui
```

- `npm run demo` starts the React workbench on `http://127.0.0.1:4173/`
- `npm run demo:preview` serves the built demo
- `npm run e2e` and `npm run e2e:ui` run Playwright against the built preview app on port `4174`, which is closer to production than hitting the dev server
- The npm scripts resolve their own package root so they still work even if Windows launches `cmd.exe` with a broken fallback cwd

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

## Shape sources

`shape-text` currently ships two first-class ways to provide the shape paragraph surface:

- Geometry input: pass explicit polygon points
- Value-derived input: pass a `text-mask` shape derived from text and font

The low-level API term stays `text-mask`, but the product framing is `value-derived shape`.

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
  autoFill: true,
  shape: {
    kind: 'text-mask',
    text: '23',
    font: '700 420px Arial',
    size: {
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
- Geometry and value-derived shapes both compile into reusable line bands before layout.
- `text-mask` shapes are raster-compiled into reusable line bands. This is the default value-derived path for browser fonts such as `Arial`, and it is designed so callers can precompile `0-9` and `:` for clock-like UIs.
- `autoFill: true` now means one thing: max-fill stream layout that sweeps every usable interval in reading order.
- Max fill keeps spaces as normal graphemes instead of stripping them, and it does not fall back to smaller text for leftover pockets.
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

Playwright now targets the React workbench in `demo/`, so browser coverage runs against the same app used for manual exploration.

## Publish notes

- Published package surface is limited to `dist/`, `README.md`, and `LICENSE`
- `npm pack` / `npm publish` trigger a clean library rebuild through `prepack`
- Build output excludes test files so the tarball stays library-only
- PR validation now runs through `.github/workflows/ci.yml`
- Tag releases now run through `.github/workflows/release.yml`
- Preferred publish path is npm Trusted Publisher via GitHub Actions OIDC, with `NPM_TOKEN` as fallback only
- Maintainer release steps and repository settings live in [docs/deployment-guide.md](./docs/deployment-guide.md)

## Local Demo UI

Open the React workbench:

```bash
npm run demo
```

Then open:

```text
http://127.0.0.1:4173/
```

Build the workbench explicitly:

```bash
npm run demo:build
```

Preview the built app:

```bash
npm run demo:preview
```

The workbench includes:

- geometry vs value-derived shape source switching
- direct `shape.text` editing for value-derived shapes
- `shape.size.mode` switching between `fit-content` and `fixed`
- `shapeTextMode` switching between `whole-text` and sequential `per-character` value-derived regions
- random character-pattern fill presets
- a payload JSON editor for the live `layout` + `render` request
- a scrollable full-output SVG viewport with `Zoom out`, `Zoom in`, `100%`, and `Fit` controls
