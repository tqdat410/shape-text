# System Architecture

## Modules

- `text/*`: text preparation and streamed line breaking
- `geometry/*`: polygon band sampling, interval extraction, and shared scanline interval helpers
- `shape/*`: shape compilation, text-mask size resolution, cacheable band generation, optional per-character text-mask region extraction, and capped text-mask cache lifecycle
- `layout/*`: shape-aware line placement, max-fill repeat coverage, and sequential region flow for per-character text masks
- `render/*`: SVG serialization
- `demo/*`: internal maintainer workbench and browser verification app
- `e2e/*`: Playwright browser coverage against the internal verification app
- `.github/workflows/*`: CI enforcement and tag-driven npm release automation

## Data Flow

1. Normalize text formatting into a canonical font string
2. Validate shape inputs, resolve text-mask sizing into either `fit-content` or fixed bounds, then compile the input shape into reusable line bands
3. For `text-mask` shapes with `shapeTextMode: 'per-character'`, also compile ordered non-space grapheme regions from the same mask source
4. Compute allowed intervals for each band or per-character region
5. Route layout through sequential regions when they exist; otherwise use the normal whole-shape flow or the max-fill path
6. Optionally repeat the source text until the active shape bands are full
7. Project positioned lines into SVG
8. CI reruns project validation, package smoke checks, and browser coverage before merge
9. Release tags rerun validation, verify the semver tag, and publish once to npm with Bun compatibility already covered by smoke checks

## Boundary Decisions

- Text measurement stays replaceable through the layout measurer interface
- Layout-affecting text style stays in the layout API
- Shape compilation stays separate from content flow so resolved text-mask bounds, glyph shapes, per-character regions, and bounded text-mask cache entries can be reused
- Geometry stays shape-specific, not DOM-specific
- Renderer-only decoration stays out of compile/layout caching
- Renderer consumes compiled layout output only
- Compile and render normalization reject invalid or extreme numeric inputs early instead of silently clamping them
- Playwright should assert visible browser behavior, not private controller state
- Release automation should publish to npm once and treat Bun as a verified consumer path rather than a second registry target
