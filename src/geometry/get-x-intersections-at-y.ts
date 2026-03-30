import type { ShapeTextPoint } from '../types.js'

export function getXIntersectionsAtY(points: ShapeTextPoint[], y: number): number[] {
  const xs: number[] = []
  let previous = points[points.length - 1]

  if (previous === undefined) return xs

  for (let index = 0; index < points.length; index++) {
    const current = points[index]!

    if ((previous.y <= y && y < current.y) || (current.y <= y && y < previous.y)) {
      xs.push(previous.x + ((y - previous.y) * (current.x - previous.x)) / (current.y - previous.y))
    }

    previous = current
  }

  return xs.sort((left, right) => left - right)
}

