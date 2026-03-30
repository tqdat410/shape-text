# System Architecture

## Modules

- `text/*`: text preparation and streamed line breaking
- `geometry/*`: polygon band sampling and interval extraction
- `layout/*`: shape-aware line placement
- `render/*`: SVG serialization

## Data Flow

1. Normalize and prepare text
2. Sample polygon per line band
3. Compute allowed intervals for each band
4. Pick the widest interval
5. Stream the next line into that width
6. Project positioned lines into SVG

## Boundary Decisions

- Text measurement stays replaceable through `TextMeasurer`
- Geometry stays shape-specific, not DOM-specific
- Renderer consumes layout output only

