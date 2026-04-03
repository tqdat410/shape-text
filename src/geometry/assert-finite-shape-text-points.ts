import type { ShapeTextPoint } from '../types.js'

export function assertFiniteShapeTextPoints(points: ShapeTextPoint[]): void {
  for (let index = 0; index < points.length; index += 1) {
    const point = points[index]!
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
      throw new Error('polygon point coordinates must be finite numbers')
    }
  }
}
