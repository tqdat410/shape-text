import type { ShapeBounds, ShapeTextPoint } from '../types.js'

export function getPolygonBounds(points: ShapeTextPoint[]): ShapeBounds {
  if (points.length < 3) {
    throw new Error('A polygon needs at least 3 points')
  }

  let left = Infinity
  let top = Infinity
  let right = -Infinity
  let bottom = -Infinity

  for (let index = 0; index < points.length; index++) {
    const point = points[index]!
    left = Math.min(left, point.x)
    top = Math.min(top, point.y)
    right = Math.max(right, point.x)
    bottom = Math.max(bottom, point.y)
  }

  return { left, top, right, bottom }
}

