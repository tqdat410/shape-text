import type { CompiledShapeBands, PolygonShape } from '../types.js'
import { assertFiniteShapeTextPoints } from '../geometry/assert-finite-shape-text-points.js'
import { getBandIntervalsFromPolygon } from '../geometry/get-band-intervals-from-polygon.js'
import { getPolygonBounds } from '../geometry/get-polygon-bounds.js'

export function compilePolygonShapeForLayout(
  shape: PolygonShape,
  lineHeight: number,
  minSlotWidth: number,
): CompiledShapeBands {
  assertFiniteShapeTextPoints(shape.points)
  const bounds = getPolygonBounds(shape.points)
  const bands = []

  for (let bandTop = bounds.top; bandTop + lineHeight <= bounds.bottom; bandTop += lineHeight) {
    bands.push({
      top: bandTop,
      bottom: bandTop + lineHeight,
      intervals: getBandIntervalsFromPolygon(
        shape.points,
        bandTop,
        bandTop + lineHeight,
        minSlotWidth,
      ),
    })
  }

  return {
    kind: shape.kind,
    source: shape,
    bounds,
    bandHeight: lineHeight,
    minSlotWidth,
    bands,
    debugView: {
      kind: 'polygon',
      points: shape.points,
    },
  }
}
