# System Architecture

## Modules

- `text/*`: text preparation and streamed line breaking
- `geometry/*`: polygon band sampling and interval extraction
- `shape/*`: shape compilation and cacheable band generation
- `layout/*`: shape-aware line placement and repeat-fill policies
- `render/*`: SVG serialization

## Data Flow

1. Normalize text formatting into a canonical font string
2. Compile the input shape into reusable line bands
3. Compute allowed intervals for each band
4. Pick the widest interval
5. Stream the next line into that width
6. Optionally repeat the source text until bands are full
7. Project positioned lines into SVG

## Boundary Decisions

- Text measurement stays replaceable through `TextMeasurer`
- Layout-affecting text style stays in the layout API
- Shape compilation stays separate from content flow so glyph shapes can be cached
- Geometry stays shape-specific, not DOM-specific
- Renderer-only decoration stays out of compile/layout caching
- Renderer consumes compiled layout output only
