# System Architecture

## Modules

- `text/*`: text preparation and streamed line breaking
- `geometry/*`: polygon band sampling and interval extraction
- `shape/*`: shape compilation, text-mask size resolution, cacheable band generation, and optional per-character text-mask region extraction
- `layout/*`: shape-aware line placement, max-fill repeat coverage, and sequential region flow for per-character text masks
- `render/*`: SVG serialization
- `demo/src/*`: React workbench UI, request editing, and SVG viewport presentation
- `e2e/*`: Playwright browser coverage against the React workbench

## Data Flow

1. Normalize text formatting into a canonical font string
2. Resolve text-mask sizing into either `fit-content` or fixed bounds, then compile the input shape into reusable line bands
3. For `text-mask` shapes with `shapeTextMode: 'per-character'`, also compile ordered non-space grapheme regions from the same mask source
4. Compute allowed intervals for each band or per-character region
5. Route layout through sequential regions when they exist; otherwise use the normal whole-shape flow or the max-fill path
6. Optionally repeat the source text until the active shape bands are full
7. Project positioned lines into SVG
8. In the React workbench, mount the SVG into a scrollable viewport and apply bounded zoom or fit-to-viewport scaling

## Boundary Decisions

- Text measurement stays replaceable through the layout measurer interface
- Layout-affecting text style stays in the layout API
- Shape compilation stays separate from content flow so resolved text-mask bounds, glyph shapes, and per-character regions can be cached
- Geometry stays shape-specific, not DOM-specific
- Renderer-only decoration stays out of compile/layout caching
- Renderer consumes compiled layout output only
- Workbench zoom is a presentation concern only; it never changes compile or layout results
- Playwright should assert visible browser behavior, not private controller state
