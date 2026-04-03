import type { Interval, ShapeTextPoint } from '../types.js'
import { assertFiniteShapeTextPoints } from './assert-finite-shape-text-points.js'
import { getXIntersectionsAtY } from './get-x-intersections-at-y.js'
import { intersectIntervalSets } from './intersect-interval-sets.js'

function pairIntersections(xs: number[]): Interval[] {
  const intervals: Interval[] = []

  for (let index = 0; index + 1 < xs.length; index += 2) {
    intervals.push({ left: xs[index]!, right: xs[index + 1]! })
  }

  return intervals
}

export function getBandIntervalsFromPolygon(
  points: ShapeTextPoint[],
  bandTop: number,
  bandBottom: number,
  minSlotWidth = 0,
): Interval[] {
  assertFiniteShapeTextPoints(points)

  const startRow = Math.floor(bandTop)
  const endRow = Math.max(startRow, Math.ceil(bandBottom) - 1)
  let intervals: Interval[] | null = null

  for (let row = startRow; row <= endRow; row++) {
    const rowIntervals = pairIntersections(getXIntersectionsAtY(points, row + 0.5))
    if (rowIntervals.length === 0) return []
    intervals = intervals === null ? rowIntervals : intersectIntervalSets(intervals, rowIntervals)
    if (intervals.length === 0) return []
  }

  return (intervals ?? []).filter(interval => interval.right - interval.left >= minSlotWidth)
}
